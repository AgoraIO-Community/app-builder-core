import React, {useState} from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import LocalUserContext from '../../agora-rn-uikit/src/LocalUserContext';
import {
  LocalAudioMute,
  LocalVideoMute,
  Endcall,
} from '../../agora-rn-uikit/Components';
import Recording from './Recording';
import styles from './styles';
import icons from '../assets/icons';
import ScreenshareButton from '../subComponents/ScreenshareButton';

export default function Controls(props) {
  const [screenshareActive, setScreenshareActive] = useState(false);
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
        <ScreenshareButton
          screenshareActive={screenshareActive}
          setScreenshareActive={setScreenshareActive}
          channelName={props.channelName}
          appId={props.appId}
        />
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
