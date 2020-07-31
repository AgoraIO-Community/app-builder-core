import React from 'react';
import {View, TouchableOpacity, Image} from 'react-native';
import LocalUserContext from '../../agora-rn-uikit/src/LocalUserContext';
import {
  LocalAudioMute,
  LocalVideoMute,
  SwitchCamera,
  Endcall,
} from '../../agora-rn-uikit/Components';
import Recording from './Recording';
import styles from './styles';
import icons from '../assets/icons';

export default function Controls(props: any) {
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
          style={styles.localButton}
          onPress={() => {
            setChatDisplayed(!chatDisplayed);
          }}>
          <Image source={{uri: icons.chatIcon}} style={styles.buttonIcon} />
        </TouchableOpacity>
        <Endcall />
      </View>
    </LocalUserContext>
  );
}
