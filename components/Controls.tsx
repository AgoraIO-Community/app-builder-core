import React from 'react';
import {View, Platform} from 'react-native';
import LocalUserContext from '../agora-rn-uikit/src/LocalUserContext';
import {
  Recording,
  LocalAudioMute,
  LocalVideoMute,
  SwitchCamera,
  Endcall,
  Screenshare,
} from '../agora-rn-uikit/Components';
import styles from '../components/styles';

export default function Controls() {
  return (
    <LocalUserContext>
      <View style={{...styles.bottomBar}}>
        <LocalAudioMute />
        <LocalVideoMute />
        <Recording />
        {Platform.OS === 'web' ? <Screenshare /> : <></>}
        {Platform.OS === 'web' ? <></> : <SwitchCamera />}
        <Endcall />
      </View>
    </LocalUserContext>
  );
}
