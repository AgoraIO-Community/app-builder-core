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
import {RtcContext} from '../../agora-rn-uikit';
import events from '../rtm-events-api';
import {controlMessageEnum} from '../components/ChatContext';
import Toast from '../../react-native-toast-message';
import TertiaryButton from '../atoms/TertiaryButton';
import {useRender} from 'customization-api';
import {useParams} from '../components/Router';
import StorageContext from './StorageContext';
import {isWebInternal, trimText} from '../utils/common';
import {useScreenshare} from '../subComponents/screenshare/useScreenshare';
import {isAndroid, isIOS} from '../utils/common';

interface Props {
  children: React.ReactNode;
}

const EventsConfigure: React.FC<Props> = (props) => {
  const {setStore} = useContext(StorageContext);
  //@ts-ignore
  const {isScreenshareActive, ScreenshareStoppedCallback, stopUserScreenShare} =
    useScreenshare();
  const isLiveStream = $config.EVENT_MODE;
  const {RtcEngine, dispatch} = useContext(RtcContext);
  const {renderList} = useRender();
  const renderListRef = useRef({renderList});
  const isScreenshareActiveRef = useRef({isScreenshareActive});
  const {phrase} = useParams<{phrase: string}>();
  useEffect(() => {
    isScreenshareActiveRef.current.isScreenshareActive = isScreenshareActive;
  }, [isScreenshareActive]);
  useEffect(() => {
    renderListRef.current.renderList = renderList;
  }, [renderList]);
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
        //   renderListRef.current.renderList[sender].name || 'The host'
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
          ? await RtcEngine.muteLocalVideoStream(true)
          : await RtcEngine.enableLocalVideo(false);
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
        //   renderListRef.current.renderList[sender].name || 'The host'
        // } muted you.`,
        text1: 'The host has muted your audio.',
        visibilityTime: 3000,
        primaryBtn: null,
        secondaryBtn: null,
        leadingIcon: null,
      });
      RtcEngine.muteLocalAudioStream(true);
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
        text1: 'The host has removed you from the meeting.',
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
              RtcEngine.muteLocalAudioStream(false);
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
                ? await RtcEngine.muteLocalVideoStream(false)
                : await RtcEngine.enableLocalVideo(true);
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

    const updateVideoStream = async (enabled: boolean) => {
      if ((isAndroid() || isIOS()) && isLiveStream) {
        await RtcEngine.muteLocalVideoStream(enabled);
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
