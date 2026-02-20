/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.
 Use without a license or in violation of any license terms and conditions (including use for
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more
 information visit https://appbuilder.agora.io.
*********************************************
*/
import React, {useState, useContext, useEffect, useRef} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {ClientRoleType} from '../../../agora-rn-uikit';
import {ErrorContext} from '../../components/common/index';
import {useWakeLock} from '../../components/useWakeLock';
import {useParams, useHistory} from '../../components/Router';
import {useSetRoomInfo} from '../../components/room-info/useSetRoomInfo';
import {SdkApiContext} from '../../components/SdkApiContext';
import {
  useRoomInfo,
  RoomInfoDefaultValue,
  WaitingRoomStatus,
} from '../../components/room-info/useRoomInfo';
import {useIsRecordingBot} from '../../subComponents/recording/useIsRecordingBot';
import Logo from '../../subComponents/Logo';
import SDKEvents from '../../utils/SdkEvents';
import isSDK from '../../utils/isSDK';
import {useHasBrandLogo, AuthErrorCodes} from '../../utils/common';
import useJoinRoom from '../../utils/useJoinRoom';
import useGetMeetingPhrase from '../../utils/useGetMeetingPhrase';
import {useString} from '../../utils/useString';
import {videoRoomStartingCallText} from '../../language/default-labels/videoCallScreenLabels';
import {LogSource, logger} from '../../logger/AppBuilderLogger';
import {RTMCoreProvider} from '../../rtm/RTMCoreProvider';
import {videoView} from '../../../theme.json';
import VideoCallContent from './VideoCallContent';
import RTMGlobalStateProvider from '../../rtm/RTMGlobalStateProvider';
import UserGlobalPreferenceProvider from '../../components/UserGlobalPreferenceProvider';
import {useRtcProps} from '../../components/rtc/RtcPropsComposer';

const VideoCallStateWrapper = () => {
  const hasBrandLogo = useHasBrandLogo();
  const joiningLoaderLabel = useString(videoRoomStartingCallText)();
  const {isRecordingBot} = useIsRecordingBot();
  const {setRoomInfo} = useSetRoomInfo();
  const {setGlobalErrorMessage} = useContext(ErrorContext);

  /**
   *  Should we set the callscreen to active ??
   *  a) If Recording bot( i.e prop: recordingBot) is TRUE then it means,
   *     the recording bot is accessing the screen - so YES we should set
   *     the callActive as true and we need not check for whether
   *     $config.PRECALL is enabled or not.
   *  b) If Recording bot( i.e prop: recordingBot) is FALSE then we should set
   *     the callActive depending upon the value of magic variable - $config.PRECALL
   */
  const shouldCallBeSetToActive = isRecordingBot
    ? true
    : $config.PRECALL
    ? false
    : true;
  const [callActive, setCallActive] = useState(shouldCallBeSetToActive);
  const [queryComplete, setQueryComplete] = useState(false);
  const [waitingRoomAttendeeJoined, setWaitingRoomAttendeeJoined] =
    useState(false);
  const {isJoinDataFetched, data, isInWaitingRoom, waitingRoomStatus} =
    useRoomInfo();
  const {join: SdkJoinState} = useContext(SdkApiContext);
  const useJoin = useJoinRoom();
  const getMeetingPhrase = useGetMeetingPhrase();

  const {phrase} = useParams<{phrase: string}>();
  const history = useHistory();
  const currentMeetingPhrase = useRef(history.location.pathname);
  const {awake, release} = useWakeLock();

  // Use RtcPropsComposer - rtcProps automatically derived from roomInfo
  const {rtcProps, setRtcPropsOverrides} = useRtcProps();

  // Handle waiting room preventJoin logic
  React.useEffect(() => {
    if (
      //isJoinDataFetched === true && (!queryComplete || !isInWaitingRoom)
      //non waiting room - host/attendee
      (!$config.ENABLE_WAITING_ROOM &&
        isJoinDataFetched === true &&
        !queryComplete) ||
      //waiting room - host
      ($config.ENABLE_WAITING_ROOM &&
        isJoinDataFetched === true &&
        data.isHost &&
        !queryComplete) ||
      //waiting room - attendee
      ($config.ENABLE_WAITING_ROOM &&
        isJoinDataFetched === true &&
        !data.isHost &&
        (!queryComplete || !isInWaitingRoom) &&
        !waitingRoomAttendeeJoined)
    ) {
      // Only override preventJoin - all other props derived from roomInfo
      /**
       * Return true (block / keep waiting) only if:
       *   a) Waiting room is enabled
       *   b) User is NOT the host
       *   c) User is NOT approved
       * else All other cases → allow entry
       */
      const shouldPreventJoin =
        $config.ENABLE_WAITING_ROOM &&
        !data.isHost &&
        waitingRoomStatus !== WaitingRoomStatus.APPROVED;

      setRtcPropsOverrides({preventJoin: shouldPreventJoin});

      if (
        $config.ENABLE_WAITING_ROOM &&
        !data.isHost &&
        waitingRoomStatus === WaitingRoomStatus.APPROVED
      ) {
        setWaitingRoomAttendeeJoined(true);
      }
      // 1. Store the display name from API
      // if (data.username) {
      //   setUsername(data.username);
      // }

      setQueryComplete(true);
    }
  }, [isJoinDataFetched, data, queryComplete, waitingRoomStatus]);

  // Fetch share data (roomId, pstn) once after join succeeds
  const shareFetchedRef = useRef(false);
  useEffect(() => {
    if (!isJoinDataFetched || shareFetchedRef.current) {
      return;
    }
    shareFetchedRef.current = true;
    getMeetingPhrase(phrase).catch(error => {
      logger.error(
        LogSource.Internals,
        'GET_MEETING_PHRASE',
        'Unable to fetch meeting phrase details',
        JSON.stringify(error || {}),
      );
    });
  }, [isJoinDataFetched, phrase]);

  useEffect(() => {
    if (!isJoinDataFetched) {
      return;
    }
    logger.log(LogSource.Internals, 'SET_MEETING_DETAILS', 'Room details', {
      user_id: data?.uid || '',
      meeting_title: data?.meetingTitle || '',
      channel_id: data?.channel,
      host_id: data?.roomId?.host || '',
      attendee_id: data?.roomId?.attendee || '',
    });
  }, [isJoinDataFetched, data, phrase]);

  //  SDK related code
  useEffect(() => {
    if (!isSDK() || !SdkJoinState.initialized) {
      return;
    }
    const {
      phrase: sdkMeetingPhrase,
      meetingDetails: sdkMeetingDetails,
      skipPrecall,
      promise,
      preference,
    } = SdkJoinState;

    const sdkMeetingPath = `/${sdkMeetingPhrase}`;

    setCallActive(skipPrecall);

    if (sdkMeetingDetails) {
      setQueryComplete(false);
      setRoomInfo(roomInfo => {
        return {
          ...roomInfo,
          isJoinDataFetched: true,
          data: {
            ...roomInfo.data,
            ...sdkMeetingDetails,
          },
          roomPreference: preference,
        };
      });
    } else if (sdkMeetingPhrase) {
      setQueryComplete(false);
      currentMeetingPhrase.current = sdkMeetingPath;
      useJoin(sdkMeetingPhrase, preference)
        .then(() => {
          logger.log(
            LogSource.Internals,
            'JOIN_MEETING',
            'Join channel success',
          );
        })
        .catch(error => {
          const errorCode = error?.code;
          if (AuthErrorCodes.indexOf(errorCode) !== -1 && isSDK()) {
            SDKEvents.emit('unauthorized', error);
          }
          logger.error(
            LogSource.Internals,
            'JOIN_MEETING',
            'Join channel error',
            JSON.stringify(error || {}),
          );
          setGlobalErrorMessage(error);
          history.push('/');
          currentMeetingPhrase.current = '';
          promise.rej(error);
        });
    }
  }, [SdkJoinState]);

  useEffect(() => {
    if (!SdkJoinState?.phrase) {
      useJoin(phrase, RoomInfoDefaultValue.roomPreference)
        .then(() => {
          logger.log(
            LogSource.Internals,
            'JOIN_MEETING',
            'Join channel success',
          );
        })
        .catch(error => {
          const errorCode = error?.code;
          if (AuthErrorCodes.indexOf(errorCode) !== -1 && isSDK()) {
            SDKEvents.emit('unauthorized', error);
          }
          logger.error(
            LogSource.Internals,
            'JOIN_MEETING',
            'Join channel error',
            JSON.stringify(error || {}),
          );
          setGlobalErrorMessage(error);
          history.push('/');
        });
    }
  }, []);

  React.useEffect(() => {
    return () => {
      logger.debug(
        LogSource.Internals,
        'VIDEO_CALL_ROOM',
        'Videocall unmounted',
      );
      setRoomInfo(prevState => {
        return {
          ...RoomInfoDefaultValue,
          loginToken: prevState?.loginToken,
        };
      });
      if (awake) {
        release();
      }
    };
  }, []);

  return (
    <>
      {queryComplete ? (
        queryComplete || !callActive ? (
          <RTMCoreProvider
            userInfo={{
              localUid: rtcProps.uid,
              screenShareUid: rtcProps.screenShareUid,
              isHost: rtcProps.role === ClientRoleType.ClientRoleBroadcaster,
              rtmToken: rtcProps.rtm,
            }}>
            <RTMGlobalStateProvider
              rtmLoginInfo={{
                uid: rtcProps.uid,
                channel: rtcProps.channel,
              }}>
              <UserGlobalPreferenceProvider>
                <VideoCallContent
                  callActive={callActive}
                  setCallActive={setCallActive}
                />
              </UserGlobalPreferenceProvider>
            </RTMGlobalStateProvider>
          </RTMCoreProvider>
        ) : (
          <View style={style.loader}>
            <View style={style.loaderLogo}>{hasBrandLogo() && <Logo />}</View>
            <Text style={style.loaderText}>{joiningLoaderLabel}</Text>
          </View>
        )
      ) : (
        <></>
      )}
    </>
  );
};

//change these to inline styles or sth
const style = StyleSheet.create({
  full: {
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  videoView: videoView,
  loader: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  loaderLogo: {
    alignSelf: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  loaderText: {fontWeight: '500', color: $config.FONT_COLOR},
});

export default VideoCallStateWrapper;
