import React, { useState } from 'react';
import {View, TouchableOpacity} from 'react-native';
import LocalUserContext from '../../agora-rn-uikit/src/LocalUserContext';
import {
  LocalAudioMute,
  LocalVideoMute,
  SwitchCamera,
  Endcall,
} from '../../agora-rn-uikit/Components';
import Recording from './Recording';
import styles from './styles';

export default function Controls(props) {
  const setRecordingActive = props.setRecordingActive;
  const recordingActive = props.recordingActive;
  const setChatDisplayed = props.setChatDisplayed;
  const chatDisplayed = props.chatDisplayed;
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
        <TouchableOpacity
          style={chatDisplayed ? styles.greenLocalButton : styles.localButton}
          onPress={() => {
            setChatDisplayed(!chatDisplayed);
          }}>
        </TouchableOpacity>
        <Endcall />
      </View>
    </LocalUserContext>
  );
}
