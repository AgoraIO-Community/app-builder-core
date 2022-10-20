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
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {controlMessageEnum} from './ChatContext';
import SecondaryButton from '../atoms/SecondaryButton';
import {useString} from '../utils/useString';
import useSendControlMessage, {
  CONTROL_MESSAGE_TYPE,
} from '../utils/useSendControlMessage';
import TertiaryButton from '../atoms/TertiaryButton';
import Spacer from '../atoms/Spacer';

export interface MuteAllAudioButtonProps {
  render?: (onPress: () => void) => JSX.Element;
}

export const MuteAllAudioButton = (props: MuteAllAudioButtonProps) => {
  const sendCtrlMsg = useSendControlMessage();
  //commented for v1 release
  //const muteAllAudioButton = useString('muteAllAudioButton')();
  const muteAllAudioButton = 'Mute all';
  const onPress = () =>
    sendCtrlMsg(
      CONTROL_MESSAGE_TYPE.controlMessageToEveryOne,
      controlMessageEnum.muteAudio,
    );
  return props?.render ? (
    props.render(onPress)
  ) : (
    <TertiaryButton onPress={onPress} text={muteAllAudioButton} />
  );
};

export interface MuteAllVideoButtonProps {
  render?: (onPress: () => void) => JSX.Element;
}
export const MuteAllVideoButton = (props: MuteAllVideoButtonProps) => {
  const sendCtrlMsg = useSendControlMessage();
  //commented for v1 release
  //const muteAllVideoButton = useString('muteAllVideoButton')();
  const muteAllVideoButton = 'Turn off all cameras';
  const onPress = () =>
    sendCtrlMsg(
      CONTROL_MESSAGE_TYPE.controlMessageToEveryOne,
      controlMessageEnum.muteVideo,
    );
  return props?.render ? (
    props.render(onPress)
  ) : (
    <TertiaryButton onPress={onPress} text={muteAllVideoButton} />
  );
};

const HostControlView = () => {
  //commented for v1 release
  //const hostControlsLabel = useString('hostControlsLabel')();

  return (
    <View style={style.container}>
      {!$config.AUDIO_ROOM && <MuteAllVideoButton />}
      <Spacer horizontal size={8} />
      <MuteAllAudioButton />
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btn: {},
});

export default HostControlView;
