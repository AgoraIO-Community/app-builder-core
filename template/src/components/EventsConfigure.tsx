/*
********************************************
 Copyright © 2022 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React, {useContext, useEffect, useRef} from 'react';
import {StyleSheet} from 'react-native';
import PrimaryButton from '../atoms/PrimaryButton';
import {RtcContext, DispatchContext, useLocalUid} from '../../agora-rn-uikit';
import events, {PersistanceLevel} from '../rtm-events-api';
import {controlMessageEnum} from '../components/ChatContext';
import Toast from '../../react-native-toast-message';
import TertiaryButton from '../atoms/TertiaryButton';
import {useContent} from 'customization-api';
import {isAndroid, isIOS, isWebInternal} from '../utils/common';
import {useScreenshare} from '../subComponents/screenshare/useScreenshare';
import {EventNames} from '../../src/rtm-events';
import {useRoomInfo} from '../components/room-info/useRoomInfo';
import useWaitingRoomAPI from '../subComponents/waiting-rooms/useWaitingRoomAPI';

interface Props {
  children: React.ReactNode;
}

const EventsConfigure: React.FC<Props> = props => {
  //@ts-ignore
  const {isScreenshareActive, ScreenshareStoppedCallback, stopUserScreenShare} =
    useScreenshare();
  const isLiveStream = $config.EVENT_MODE;
  const {dispatch} = useContext(DispatchContext);
  const {RtcEngineUnsafe} = useContext(RtcContext);
  const {defaultContent, activeUids} = useContent();
  const defaultContentRef = useRef({defaultContent});
  const isScreenshareActiveRef = useRef({isScreenshareActive});
  useEffect(() => {
    isScreenshareActiveRef.current.isScreenshareActive = isScreenshareActive;
  }, [isScreenshareActive]);
  useEffect(() => {
    defaultContentRef.current.defaultContent = defaultContent;
  }, [defaultContent]);
  const {
    data: {isHost},
  } = useRoomInfo();

  const {approval} = useWaitingRoomAPI();
  const localUid = useLocalUid();
  const activeUidsRef = React.useRef({activeUids: activeUids});
  useEffect(() => {
    activeUidsRef.current.activeUids = activeUids;
  }, [activeUids]);

  useEffect(() => {
    //user joined event listener
    // events.on(controlMessageEnum.newUserJoined, ({payload}) => {
    //   const data = JSON.parse(payload);
    //   if (data?.name) {
    //     Toast.show({
    //       text1: `${trimText(data.name)} has joined the call`,
    //       visibilityTime: 3000,
    //       type: 'info',
    //       primaryBtn: null,
    //       secondaryBtn: null,
    //     });
    //   }
    // });
    events.on(controlMessageEnum.muteVideo, async ({payload, sender}) => {
      Toast.show({
        type: 'info',
        // text1: `${
        //   defaultContentRef.current.defaultContent[sender].name || 'The host'
        // } muted you.`,
        text1: 'The host has muted your video.',
        visibilityTime: 3000,
        primaryBtn: null,
        secondaryBtn: null,
        leadingIcon: null,
      });
      if (
        (isAndroid() || isIOS()) &&
        isScreenshareActiveRef.current.isScreenshareActive
      ) {
        //@ts-ignore
        stopUserScreenShare(false, true);
      } else {
        isWebInternal()
          ? await RtcEngineUnsafe.muteLocalVideoStream(true)
          : await RtcEngineUnsafe.enableLocalVideo(false);
        await updateVideoStream(true);
        dispatch({
          type: 'LocalMuteVideo',
          value: [0],
        });
      }
    });
    events.on(controlMessageEnum.muteAudio, ({sender}) => {
      Toast.show({
        type: 'info',
        // text1: `${
        //   defaultContentRef.current.defaultContent[sender].name || 'The host'
        // } muted you.`,
        text1: 'The host has muted your audio.',
        visibilityTime: 3000,
        primaryBtn: null,
        secondaryBtn: null,
        leadingIcon: null,
      });
      RtcEngineUnsafe.muteLocalAudioStream(true);
      dispatch({
        type: 'LocalMuteAudio',
        value: [0],
      });
    });
    events.on(controlMessageEnum.kickUser, () => {
      //before kickoff the user we have check whether screenshare on/off
      //if its on then stop screenshare and emit event for screensharing is stopped
      try {
        if (isScreenshareActiveRef?.current?.isScreenshareActive) {
          ScreenshareStoppedCallback && ScreenshareStoppedCallback();
        }
      } catch (error) {
        console.log('error on stop the screeshare', error);
      }

      Toast.show({
        type: 'info',
        text1: 'The host has removed you from the room.',
        visibilityTime: 5000,
        primaryBtn: null,
        secondaryBtn: null,
      });
      setTimeout(() => {
        dispatch({
          type: 'EndCall',
          value: [],
        });
      }, 5000);
    });
    events.on(controlMessageEnum.requestAudio, () => {
      Toast.show({
        type: 'info',
        text1: 'The host has requested you to speak',
        visibilityTime: 3000,
        leadingIcon: null,
        primaryBtn: (
          <PrimaryButton
            containerStyle={style.primaryBtn}
            textStyle={{fontWeight: '600', fontSize: 16, paddingLeft: 0}}
            text="UNMUTE"
            onPress={() => {
              RtcEngineUnsafe.muteLocalAudioStream(false);
              dispatch({
                type: 'LocalMuteAudio',
                value: [1],
              });
              Toast.hide();
            }}
          />
        ),
        secondaryBtn: SecondaryBtn,
      });
    });
    events.on(controlMessageEnum.requestVideo, () => {
      Toast.show({
        type: 'info',
        text1: 'The host has asked you to start your video.',
        visibilityTime: 3000,
        leadingIcon: null,
        primaryBtn: (
          <PrimaryButton
            containerStyle={style.primaryBtn}
            textStyle={style.primaryBtnText}
            text="UNMUTE"
            onPress={async () => {
              isWebInternal()
                ? await RtcEngineUnsafe.muteLocalVideoStream(false)
                : await RtcEngineUnsafe.enableLocalVideo(true);
              await updateVideoStream(false);
              dispatch({
                type: 'LocalMuteVideo',
                value: [1],
              });
              Toast.hide();
            }}
          />
        ),
        secondaryBtn: SecondaryBtn,
      });
    });

    events.on(EventNames.WAITING_ROOM_STATUS_UPDATE, data => {
      if (!isHost) return;
      const {attendee_uid} = JSON.parse(data?.payload);
      dispatch({
        type: 'UpdateRenderList',
        value: [attendee_uid, {isInWaitingRoom: false}],
      });
    });

    events.on(EventNames.WAITING_ROOM_REQUEST, data => {
      if (!isHost) return;

      const {attendee_uid, attendee_screenshare_uid} = JSON.parse(
        data?.payload,
      );
      const userName =
        defaultContentRef.current.defaultContent[attendee_uid]?.name || 'OO';
      // put the attendee in waitingroom in renderlist
      dispatch({
        type: 'UpdateRenderList',
        value: [attendee_uid, {isInWaitingRoom: true}],
      });
      // check if any other host has approved then dont show permission to join the room
      console.log(activeUidsRef);
      const AllowBtn = () => (
        <PrimaryButton
          containerStyle={style.primaryBtn}
          textStyle={style.primaryBtnText}
          text="Allow"
          onPress={() => {
            // user approving waiting room request
            const res = approval({
              host_uid: localUid,
              attendee_uid: attendee_uid,
              attendee_screenshare_uid: attendee_screenshare_uid,
              approved: true,
            });
            console.log('waiting-room:approval', res);
            dispatch({
              type: 'UpdateRenderList',
              value: [attendee_uid, {isInWaitingRoom: false}],
            });
            // inform other that hosts as well
            events.send(
              EventNames.WAITING_ROOM_STATUS_UPDATE,
              JSON.stringify({attendee_uid, approved: true}),
              PersistanceLevel.None,
            );
            // server will send the RTM message with approved status and RTC token to the approved attendee.
            Toast.hide();
          }}
        />
      );
      const DenyBtn = () => (
        <TertiaryButton
          containerStyle={style.secondaryBtn}
          textStyle={style.primaryBtnText}
          text="Deny"
          onPress={() => {
            // user rejecting waiting room request
            const res = approval({
              host_uid: localUid,
              attendee_uid: attendee_uid,
              attendee_screenshare_uid: attendee_screenshare_uid,
              approved: false,
            });
            dispatch({
              type: 'UpdateRenderList',
              value: [attendee_uid, {isInWaitingRoom: false}],
            });
            // inform other that hosts as well
            events.send(
              'WAITING_ROOM_STATUS_UPDATE',
              JSON.stringify({attendee_uid, approved: false}),
              PersistanceLevel.None,
            );
            console.log('waiting-room:reject', res);
            // server will send the RTM message with rejected status and RTC token to the approved attendee.
            Toast.hide();
          }}
        />
      );

      Toast.show({
        type: 'info',
        text1: 'Approval Required',
        text2: `${userName} is waiting for approval to join the call`,
        visibilityTime: 30000,
        primaryBtn: <AllowBtn />,
        secondaryBtn: <DenyBtn />,
      });
    });

    const updateVideoStream = async (enabled: boolean) => {
      if ((isAndroid() || isIOS()) && isLiveStream) {
        await RtcEngineUnsafe.muteLocalVideoStream(enabled);
      }
    };

    return () => {
      //events.off(controlMessageEnum.newUserJoined);
      events.off(controlMessageEnum.requestAudio);
      events.off(controlMessageEnum.requestVideo);
      events.off(controlMessageEnum.muteVideo);
      events.off(controlMessageEnum.muteAudio);
      events.off(controlMessageEnum.kickUser);
    };
  }, []);

  return <>{props.children}</>;
};

export default EventsConfigure;

const style = StyleSheet.create({
  secondaryBtn: {marginLeft: 16, height: 40, paddingVertical: 5},
  primaryBtn: {
    maxWidth: 109,
    minWidth: 109,
    height: 40,
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  primaryBtnText: {
    fontWeight: '600',
    fontSize: 16,
    paddingLeft: 0,
  },
});
const SecondaryBtn = (
  <TertiaryButton
    containerStyle={style.secondaryBtn}
    text="LATER"
    onPress={() => {
      Toast.hide();
    }}
  />
);
