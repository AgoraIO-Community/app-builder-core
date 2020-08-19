import React, {useContext} from 'react';
import {Image, TouchableOpacity} from 'react-native';
import styles from '../components/styles';
import icons from '../assets/icons';
import RtcContext from '../../agora-rn-uikit/src/RtcContext';
import PropsContext from '../../agora-rn-uikit/src/PropsContext';

export default function ScreenshareButton(props) {
  const rtc = useContext(RtcContext);
  const {screenshareActive, setScreenshareActive} = props;
  const {channel, appId, screenShareUid, screenShareToken} = useContext(PropsContext).rtcProps;

  rtc.RtcEngine.addListener('ScreenshareStopped', () => {
    setScreenshareActive(false);
  });
  return (
    <TouchableOpacity
      style={screenshareActive ? styles.greenLocalButton : styles.localButton}
      onPress={() => {
        setScreenshareActive(true);
        rtc.RtcEngine.startScreenshare(
          screenShareToken,
          channel,
          null,
          screenShareUid,
          appId,
          rtc.RtcEngine,
        );
      }}>
      <Image source={{uri: icons.screenshareIcon}} style={styles.buttonIcon} />
    </TouchableOpacity>
  );
}
