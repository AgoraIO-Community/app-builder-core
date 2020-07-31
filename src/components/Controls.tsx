import React, {useContext, useState} from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import LocalUserContext from '../../agora-rn-uikit/src/LocalUserContext';
import RtcContext from '../../agora-rn-uikit/src/RtcContext';
import {
  LocalAudioMute,
  LocalVideoMute,
  Endcall,
} from '../../agora-rn-uikit/Components';
import Recording from './Recording';
import styles from './styles';
import icons from '../assets/icons';

export default function Controls(props) {
  const [screenshareActive, setScreenshareActive] = useState(false);
  const setRecordingActive = props.setRecordingActive;
  const recordingActive = props.recordingActive;
  const setChatDisplayed = props.setChatDisplayed;
  const chatDisplayed = props.chatDisplayed;
  const rtc = useContext(RtcContext);
  rtc.RtcEngine.addListener('ScreenshareStopped', () => {
    setScreenshareActive(false);
  });
  return (
    <LocalUserContext>
      <View style={{...styles.bottomBar}}>
        <LocalAudioMute />
        <LocalVideoMute />
        <Recording
          recordingActive={recordingActive}
          setRecordingActive={setRecordingActive}
        />
        <TouchableOpacity
          style={
            screenshareActive ? styles.greenLocalButton : styles.localButton
          }
          onPress={() => {
            setScreenshareActive(true);
            rtc.RtcEngine.startScreenshare(
              null,
              props.channelName,
              null,
              null,
              props.appId,
              rtc.RtcEngine,
            );
          }}>
          <Image
            source={{uri: icons.screenshareIcon}}
            style={styles.buttonIcon}
          />
        </TouchableOpacity>
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
