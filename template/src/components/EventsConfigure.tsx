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
import {
  RtcContext,
  UidType,
  useLocalUid,
  DispatchContext,
} from '../../agora-rn-uikit';
import events from '../rtm-events-api';
import {controlMessageEnum} from '../components/ChatContext';
import Toast from '../../react-native-toast-message';
import TertiaryButton from '../atoms/TertiaryButton';
import {useContent} from 'customization-api';
import {useParams} from '../components/Router';
import StorageContext from './StorageContext';
import {isWebInternal} from '../utils/common';
import LocalEventEmitter, {
  LocalEventsEnum,
} from '../rtm-events-api/LocalEvents';

interface Props {
  children: React.ReactNode;
}

const EventsConfigure: React.FC<Props> = (props) => {
  const {setStore} = useContext(StorageContext);
  const {RtcEngineUnsafe} = useContext(RtcContext);
  const {dispatch} = useContext(DispatchContext);
  const {defaultContent} = useContent();
  const defaultContentRef = useRef({defaultContent});
  const {phrase} = useParams<{phrase: string}>();
  const localUid = useLocalUid();
  const activeSpeakerUid = useRef(undefined);
  useEffect(() => {
    defaultContentRef.current.defaultContent = defaultContent;
  }, [defaultContent]);

  const emitActiveSpeaker = (uid: UidType) => {
    if (uid !== activeSpeakerUid.current) {
      activeSpeakerUid.current = uid;
      LocalEventEmitter.emit(LocalEventsEnum.ACTIVE_SPEAKER, uid);
    }
  };

  useEffect(() => {
    RtcEngineUnsafe.addListener('AudioVolumeIndication', (...args) => {
      // console.log('-- AudioVolumeCallback', args);
      const [speakers, totalVolume] = args;
      if (speakers[0]?.uid === 0) {
        //callback for local user
        const isLocalUserSpeaking = speakers[0].vad; //1-speaking ,  0-not speaking
        const localUserVolumeLevel = speakers[0].volume;
        // vad value is not consistent while speaking so using volume level
        if (localUserVolumeLevel > 0) {
          emitActiveSpeaker(localUid);
        } else {
          //undefined
          emitActiveSpeaker(undefined);
        }
      } else {
        // remote users callback, this will be handeled in ActiveSpeaker callback(367)
        // const highestvolumeObj = speakers.reduce(function (prev, current) {
        //   return prev.volume > current.volume ? prev : current;
        // }, null);
      }
    });

    RtcEngineUnsafe.addListener('ActiveSpeaker', (...args) => {
      // used as a callback from the web bridge as well remote users
      emitActiveSpeaker(args[0]);
    });
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
      });
      isWebInternal()
        ? await RtcEngineUnsafe.muteLocalVideoStream(true)
        : await RtcEngineUnsafe.enableLocalVideo(false);
      dispatch({
        type: 'LocalMuteVideo',
        value: [0],
      });
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
      });
      RtcEngineUnsafe.muteLocalAudioStream(true);
      dispatch({
        type: 'LocalMuteAudio',
        value: [0],
      });
    });
    events.on(controlMessageEnum.kickUser, () => {
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
        primaryBtn: (
          <PrimaryButton
            containerStyle={style.primaryBtn}
            textStyle={style.primaryBtnText}
            text="UNMUTE"
            onPress={async () => {
              isWebInternal()
                ? await RtcEngineUnsafe.muteLocalVideoStream(false)
                : await RtcEngineUnsafe.enableLocalVideo(true);
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
