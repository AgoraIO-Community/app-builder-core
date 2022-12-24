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
import React, {useContext, useEffect} from 'react';
import {StyleSheet} from 'react-native';
import PrimaryButton from '../atoms/PrimaryButton';
import {RtcContext} from '../../agora-rn-uikit';
import events from '../rtm-events-api';
import {controlMessageEnum} from '../components/ChatContext';
import Toast from '../../react-native-toast-message';
import TertiaryButton from '../atoms/TertiaryButton';

interface Props {
  children: React.ReactNode;
}

const EventsConfigure: React.FC<Props> = (props) => {
  const {RtcEngine, dispatch} = useContext(RtcContext);
  useEffect(() => {
    //user joined event listener
    events.on('NEW_USER_JOINED', ({payload}) => {
      const data = JSON.parse(payload);
      if (data?.name) {
        Toast.show({
          text1: `${data.name} has joined the call`,
          visibilityTime: 3000,
          type: 'info',
        });
      }
    });
    events.on(controlMessageEnum.muteVideo, () => {
      RtcEngine.muteLocalVideoStream(true);
      dispatch({
        type: 'LocalMuteVideo',
        value: [0],
      });
    });
    events.on(controlMessageEnum.muteAudio, () => {
      RtcEngine.muteLocalAudioStream(true);
      dispatch({
        type: 'LocalMuteAudio',
        value: [0],
      });
    });
    events.on(controlMessageEnum.kickUser, () => {
      dispatch({
        type: 'EndCall',
        value: [],
      });
    });
    events.on(controlMessageEnum.requestAudio, () => {
      Toast.show({
        type: 'info',
        text1: 'The host has requested you to speak',
        visibilityTime: 3000,
        primaryBtn: (
          <PrimaryButton
            containerStyle={{
              maxWidth: 109,
              minWidth: 109,
              height: 40,
              borderRadius: 4,
            }}
            textStyle={{fontWeight: '600', fontSize: 16, paddingLeft: 0}}
            text="UNMUTE"
            onPress={() => {
              RtcEngine.muteLocalAudioStream(false);
              dispatch({
                type: 'LocalMuteAudio',
                value: [1],
              });
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
            onPress={() => {
              RtcEngine.muteLocalVideoStream(false);
              dispatch({
                type: 'LocalMuteVideo',
                value: [1],
              });
            }}
          />
        ),
        secondaryBtn: SecondaryBtn,
      });
    });

    return () => {
      events.off('NEW_USER_JOINED');
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
  secondaryBtn: {marginLeft: 16, height: 40},
  primaryBtn: {
    maxWidth: 109,
    minWidth: 109,
    height: 40,
    borderRadius: 4,
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
