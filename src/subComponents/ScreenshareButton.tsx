import React, {useContext} from 'react';
import {Image, TouchableOpacity} from 'react-native';
import styles from '../components/styles';
import icons from '../assets/icons';
import RtcContext from '../../agora-rn-uikit/src/RtcContext';

export default function ScreenshareButton(props) {
  const rtc = useContext(RtcContext);
  const {screenshareActive, setScreenshareActive, channelName, appId} = props;
  rtc.RtcEngine.addListener('ScreenshareStopped', () => {
    setScreenshareActive(false);
  });
  return (
    <TouchableOpacity
      style={screenshareActive ? styles.greenLocalButton : styles.localButton}
      onPress={() => {
        setScreenshareActive(true);
        rtc.RtcEngine.startScreenshare(
          null,
          channelName,
          null,
          null,
          appId,
          rtc.RtcEngine,
        );
      }}>
      <Image source={{uri: icons.screenshareIcon}} style={styles.buttonIcon} />
    </TouchableOpacity>
  );
}
