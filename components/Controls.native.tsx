import React from 'react';
import {View} from 'react-native';
import LocalUserContext from '../agora-rn-uikit/src/LocalUserContext';
import {
  Recording,
  LocalAudioMute,
  LocalVideoMute,
  SwitchCamera,
  Endcall,
} from '../agora-rn-uikit/Components';
import styles from '../components/styles';

export default function Controls() {
  return (
    <LocalUserContext>
      <View style={{...styles.bottomBar}}>
        <LocalAudioMute />
        <LocalVideoMute />
        <Recording />
        <SwitchCamera />
        <Endcall />
      </View>
    </LocalUserContext>
  );
}
