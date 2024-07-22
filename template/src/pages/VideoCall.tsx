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
// @ts-nocheck
import React, {useState, useContext, useEffect, useRef} from 'react';
import {useApolloClient} from '@apollo/client';
import {View, StyleSheet, Text} from 'react-native';
import {
  RtcConfigure,
  PropsProvider,
  ClientRoleType,
  ChannelProfileType,
  LocalUserContext,
  UidType,
  CallbacksInterface,
} from '../../agora-rn-uikit';
import styles from '../components/styles';
import {useParams, useHistory} from '../components/Router';
import RtmConfigure from '../components/RTMConfigure';
import DeviceConfigure from '../components/DeviceConfigure';
import Logo from '../subComponents/Logo';
import {useHasBrandLogo, isMobileUA, isWebInternal} from '../utils/common';
import {videoView} from '../../theme.json';
import {LiveStreamContextProvider} from '../components/livestream';
import ScreenshareConfigure from '../subComponents/screenshare/ScreenshareConfigure';
import {ErrorContext} from '.././components/common/index';
import {PreCallProvider} from '../components/precall/usePreCall';
import {LayoutProvider} from '../utils/useLayout';
import Precall from '../components/Precall';
import {RecordingProvider} from '../subComponents/recording/useRecording';
import useJoinRoom from '../utils/useJoinRoom';
import {
  useRoomInfo,
  RoomInfoDefaultValue,
  WaitingRoomStatus,
} from '../components/room-info/useRoomInfo';
import {SidePanelProvider} from '../utils/useSidePanel';
import {NetworkQualityProvider} from '../components/NetworkQualityContext';
import {ChatNotificationProvider} from '../components/chat-notification/useChatNotification';
import {ChatUIControlsProvider} from '../components/chat-ui/useChatUIControls';
import {ScreenShareProvider} from '../components/contexts/ScreenShareContext';
import {LiveStreamDataProvider} from '../components/contexts/LiveStreamDataContext';
import {VideoMeetingDataProvider} from '../components/contexts/VideoMeetingDataContext';
import {useWakeLock} from '../components/useWakeLock';
import SDKEvents from '../utils/SdkEvents';
import {UserPreferenceProvider} from '../components/useUserPreference';
import EventsConfigure from '../components/EventsConfigure';
import PermissionHelper from '../components/precall/PermissionHelper';
import {FocusProvider} from '../utils/useFocus';
import {VideoCallProvider} from '../components/useVideoCall';
import {SdkApiContext} from '../components/SdkApiContext';
import isSDK from '../utils/isSDK';
import {CaptionProvider} from '../subComponents/caption/useCaption';
import SdkMuteToggleListener from '../components/SdkMuteToggleListener';
import StorageContext from '../components/StorageContext';
import {useSetRoomInfo} from '../components/room-info/useSetRoomInfo';
import {NoiseSupressionProvider} from '../app-state/useNoiseSupression';
import {VideoQualityContextProvider} from '../app-state/useVideoQuality';
import {VBProvider} from '../components/virtual-background/useVB';
import {DisableChatProvider} from '../components/disable-chat/useDisableChat';
import {WaitingRoomProvider} from '../components/contexts/WaitingRoomContext';
import {isValidReactComponent} from '../utils/common';
import {ChatMessagesProvider} from '../components/chat-messages/useChatMessages';
import VideoCallScreenWrapper from './video-call/VideoCallScreenWrapper';
import {useIsRecordingBot} from '../subComponents/recording/useIsRecordingBot';
import {videoRoomStartingCallText} from '../language/default-labels/videoCallScreenLabels';
import {useString} from '../utils/useString';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import {useCustomization} from 'customization-implementation';
import {BeautyEffectProvider} from '../components/beauty-effect/useBeautyEffects';

enum RnEncryptionEnum {
  /**
   * @deprecated
   * 0: This mode is deprecated.
   */
  None = 0,
  /**
   * 1: (Default) 128-bit AES encryption, XTS mode.
   */
  AES128XTS = 1,
  /**
   * 2: 128-bit AES encryption, ECB mode.
   */
  AES128ECB = 2,
  /**
   * 3: 256-bit AES encryption, XTS mode.
   */
  AES256XTS = 3,
  /**
   * 4: 128-bit SM4 encryption, ECB mode.
   *
   * @since v3.1.2.
   */
  SM4128ECB = 4,
  /**
   * 6: 256-bit AES encryption, GCM mode.
   *
   * @since v3.1.2.
   */
  AES256GCM = 6,

  /**
   * 7:  128-bit GCM encryption, GCM mode.
   *
   * @since v3.4.5
   */
  AES128GCM2 = 7,
  /**
   * 8: 256-bit GCM encryption, GCM mode.
   * @since v3.1.2.
   * Compared to AES256GCM encryption mode, AES256GCM2 encryption mode is more secure and requires you to set the salt (encryptionKdfSalt).
   */
  AES256GCM2 = 8,
}

const VideoCall: React.FC = () => {
  const hasBrandLogo = useHasBrandLogo();
  const joiningLoaderLabel = useString(videoRoomStartingCallText)();

  const client = useApolloClient();

  const {setGlobalErrorMessage} = useContext(ErrorContext);
  const {awake, release} = useWakeLock();
  const {isRecordingBot} = useIsRecordingBot();
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
  const [isRecordingActive, setRecordingActive] = useState(false);
  const [queryComplete, setQueryComplete] = useState(false);
  const [waitingRoomAttendeeJoined, setWaitingRoomAttendeeJoined] =
    useState(false);

  const {phrase} = useParams<{phrase: string}>();

  const {store} = useContext(StorageContext);
  const {
    join: SdkJoinState,
    microphoneDevice: sdkMicrophoneDevice,
    cameraDevice: sdkCameraDevice,
    clearState,
  } = useContext(SdkApiContext);

  // commented for v1 release
  const afterEndCall = useCustomization(
    data =>
      data?.lifecycle?.useAfterEndCall && data?.lifecycle?.useAfterEndCall(),
  );

  const {PrefereceWrapper} = useCustomization(data => {
    let components: {
      PrefereceWrapper: React.ComponentType;
    } = {
      PrefereceWrapper: React.Fragment,
    };
    if (
      data?.components?.preferenceWrapper &&
      typeof data?.components?.preferenceWrapper !== 'object' &&
      isValidReactComponent(data?.components?.preferenceWrapper)
    ) {
      components.PrefereceWrapper = data?.components?.preferenceWrapper;
    }

    return components;
  });

  const [rtcProps, setRtcProps] = React.useState({
    appId: $config.APP_ID,
    channel: null,
    uid: null,
    token: null,
    rtm: null,
    screenShareUid: null,
    screenShareToken: null,
    profile: $config.PROFILE,
    screenShareProfile: $config.SCREEN_SHARE_PROFILE,
    dual: true,
    encryption: $config.ENCRYPTION_ENABLED
      ? {key: null, mode: RnEncryptionEnum.AES128GCM2, screenKey: null}
      : false,
    role: ClientRoleType.ClientRoleBroadcaster,
    geoFencing: $config.GEO_FENCING,
    audioRoom: $config.AUDIO_ROOM,
    activeSpeaker: $config.ACTIVE_SPEAKER,
    preferredCameraId:
      sdkCameraDevice.deviceId || store?.activeDeviceId?.videoinput || null,
    preferredMicrophoneId:
      sdkMicrophoneDevice.deviceId || store?.activeDeviceId?.audioinput || null,
    recordingBot: isRecordingBot ? true : false,
  });

  const history = useHistory();
  const currentMeetingPhrase = useRef(history.location.pathname);

  const useJoin = useJoinRoom();
  const {setRoomInfo} = useSetRoomInfo();
  const {isJoinDataFetched, data, isInWaitingRoom, waitingRoomStatus} =
    useRoomInfo();

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

  React.useEffect(() => {
    return () => {
      logger.debug(
        LogSource.Internals,
        'VIDEO_CALL_ROOM',
        'Videocall unmounted',
      );
      setRoomInfo(RoomInfoDefaultValue);
      if (awake) {
        release();
      }
    };
  }, []);

  useEffect(() => {
    if (!SdkJoinState.phrase) {
      useJoin(phrase, RoomInfoDefaultValue.roomPreference)
        .then(() => {})
        .catch(error => {
          setGlobalErrorMessage(error);
          history.push('/');
        });
    }
  }, []);

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
      useJoin(sdkMeetingPhrase, preference).catch(error => {
        setGlobalErrorMessage(error);
        history.push('/');
        currentMeetingPhrase.current = '';
        promise.rej(error);
      });
    }
  }, [SdkJoinState]);

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
      setRtcProps(prevRtcProps => ({
        ...prevRtcProps,
        channel: data.channel,
        uid: data.uid,
        token: data.token,
        rtm: data.rtmToken,
        encryption: $config.ENCRYPTION_ENABLED
          ? {
              key: data.encryptionSecret,
              mode: RnEncryptionEnum.AES256GCM2,
              screenKey: data.encryptionSecret,
              salt: data.encryptionSecretSalt,
            }
          : false,
        screenShareUid: data.screenShareUid,
        screenShareToken: data.screenShareToken,
        role: data.isHost
          ? ClientRoleType.ClientRoleBroadcaster
          : ClientRoleType.ClientRoleAudience,
        preventJoin:
          !$config.ENABLE_WAITING_ROOM ||
          ($config.ENABLE_WAITING_ROOM && data.isHost) ||
          ($config.ENABLE_WAITING_ROOM &&
            !data.isHost &&
            waitingRoomStatus === WaitingRoomStatus.APPROVED)
            ? false
            : true,
      }));

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
  }, [isJoinDataFetched, data, queryComplete]);

  const callbacks: CallbacksInterface = {
    // RtcLeft: () => {},
    // RtcJoined: () => {
    //   if (SdkJoinState.phrase && SdkJoinState.skipPrecall) {
    //     SdkJoinState.promise?.res();
    //   }
    // },
    EndCall: () => {
      clearState('join');
      setTimeout(() => {
        // TODO: These callbacks are being called twice
        SDKEvents.emit('leave');
        history.push('/');
        client.resetStore();
      }, 0);
    },
    UserJoined: (uid: UidType) => {
      console.log('UIKIT Callback: UserJoined', uid);
      SDKEvents.emit('rtc-user-joined', uid);
    },
    UserOffline: (uid: UidType) => {
      console.log('UIKIT Callback: UserOffline', uid);
      SDKEvents.emit('rtc-user-left', uid);
    },
    RemoteAudioStateChanged: (uid: UidType, status: 0 | 2) => {
      console.log('UIKIT Callback: RemoteAudioStateChanged', uid, status);
      if (status === 0) {
        SDKEvents.emit('rtc-user-unpublished', uid, 'audio');
      } else {
        SDKEvents.emit('rtc-user-published', uid, 'audio');
      }
    },
    RemoteVideoStateChanged: (uid: UidType, status: 0 | 2) => {
      console.log('UIKIT Callback: RemoteVideoStateChanged', uid, status);
      if (status === 0) {
        SDKEvents.emit('rtc-user-unpublished', uid, 'video');
      } else {
        SDKEvents.emit('rtc-user-published', uid, 'video');
      }
    },
  };

  return (
    <>
      {queryComplete ? (
        queryComplete || !callActive ? (
          <>
            <PropsProvider
              value={{
                rtcProps: {
                  ...rtcProps,
                  callActive,
                  // commented for v1 release
                  //lifecycle,
                },
                callbacks,
                styleProps,
                mode: $config.EVENT_MODE
                  ? ChannelProfileType.ChannelProfileLiveBroadcasting
                  : ChannelProfileType.ChannelProfileCommunication,
              }}>
              <RtcConfigure>
                <DeviceConfigure>
                  <NoiseSupressionProvider callActive={callActive}>
                    <VideoQualityContextProvider>
                      <ChatUIControlsProvider>
                        <ChatNotificationProvider>
                          <LayoutProvider>
                            <FocusProvider>
                              <SidePanelProvider>
                                <ChatMessagesProvider callActive={callActive}>
                                  <ScreenShareProvider>
                                    <RtmConfigure callActive={callActive}>
                                      <UserPreferenceProvider>
                                        <CaptionProvider>
                                          <WaitingRoomProvider>
                                            <EventsConfigure>
                                              <ScreenshareConfigure
                                                isRecordingActive={
                                                  isRecordingActive
                                                }>
                                                <LiveStreamContextProvider
                                                  value={{
                                                    setRtcProps,
                                                    rtcProps,
                                                    callActive,
                                                  }}>
                                                  <LiveStreamDataProvider>
                                                    <LocalUserContext
                                                      localUid={rtcProps?.uid}>
                                                      <RecordingProvider
                                                        value={{
                                                          setRecordingActive,
                                                          isRecordingActive,
                                                          callActive,
                                                        }}>
                                                        <NetworkQualityProvider>
                                                          {!isMobileUA() && (
                                                            <PermissionHelper />
                                                          )}
                                                          <VBProvider>
                                                            <BeautyEffectProvider>
                                                              <PrefereceWrapper>
                                                                <SdkMuteToggleListener>
                                                                  {callActive ? (
                                                                    <VideoMeetingDataProvider>
                                                                      <VideoCallProvider>
                                                                        <DisableChatProvider>
                                                                          <VideoCallScreenWrapper />
                                                                        </DisableChatProvider>
                                                                      </VideoCallProvider>
                                                                    </VideoMeetingDataProvider>
                                                                  ) : $config.PRECALL ? (
                                                                    <PreCallProvider
                                                                      value={{
                                                                        callActive,
                                                                        setCallActive,
                                                                      }}>
                                                                      <Precall />
                                                                    </PreCallProvider>
                                                                  ) : (
                                                                    <></>
                                                                  )}
                                                                </SdkMuteToggleListener>
                                                              </PrefereceWrapper>
                                                            </BeautyEffectProvider>
                                                          </VBProvider>
                                                        </NetworkQualityProvider>
                                                      </RecordingProvider>
                                                    </LocalUserContext>
                                                  </LiveStreamDataProvider>
                                                </LiveStreamContextProvider>
                                              </ScreenshareConfigure>
                                            </EventsConfigure>
                                          </WaitingRoomProvider>
                                        </CaptionProvider>
                                      </UserPreferenceProvider>
                                    </RtmConfigure>
                                  </ScreenShareProvider>
                                </ChatMessagesProvider>
                              </SidePanelProvider>
                            </FocusProvider>
                          </LayoutProvider>
                        </ChatNotificationProvider>
                      </ChatUIControlsProvider>
                    </VideoQualityContextProvider>
                  </NoiseSupressionProvider>
                </DeviceConfigure>
              </RtcConfigure>
            </PropsProvider>
          </>
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

const styleProps = {
  maxViewStyles: styles.temp,
  minViewStyles: styles.temp,
  localBtnContainer: styles.bottomBar,
  localBtnStyles: {
    muteLocalAudio: styles.localButton,
    muteLocalVideo: styles.localButton,
    switchCamera: styles.localButton,
    endCall: styles.endCall,
    fullScreen: styles.localButton,
    recording: styles.localButton,
    screenshare: styles.localButton,
  },
  theme: $config.PRIMARY_ACTION_BRAND_COLOR,
  remoteBtnStyles: {
    muteRemoteAudio: styles.remoteButton,
    muteRemoteVideo: styles.remoteButton,
    remoteSwap: styles.remoteButton,
    minCloseBtnStyles: styles.minCloseBtn,
    liveStreamHostControlBtns: styles.liveStreamHostControlBtns,
  },
  BtnStyles: styles.remoteButton,
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

export default VideoCall;
