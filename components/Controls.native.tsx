import React, { useState } from 'react';
import {View} from 'react-native';
import LocalUserContext from '../agora-rn-uikit/src/LocalUserContext';
import {
  LocalAudioMute,
  LocalVideoMute,
  SwitchCamera,
  Endcall,
} from '../agora-rn-uikit/Components';
import Recording from './Recording';
import styles from '../components/styles';

export default function Controls(props) {
  const setRecordingActive = props.setRecordingActive;
  const recordingActive = props.recordingActive;
  return (
    <LocalUserContext>
      <View style={{...styles.bottomBar}}>
        <LocalAudioMute />
        <LocalVideoMute />
        <Recording
          recordingActive={recordingActive}
          setRecordingActive={setRecordingActive}
        />
        <SwitchCamera />
        <Endcall />
      </View>
    </LocalUserContext>
  );
}
