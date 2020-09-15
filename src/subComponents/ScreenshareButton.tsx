import React, {useContext} from 'react';
import {Image, TouchableOpacity, StyleSheet} from 'react-native';
import icons from '../assets/icons';
import RtcContext from '../../agora-rn-uikit/src/RtcContext';
import PropsContext from '../../agora-rn-uikit/src/PropsContext';

const ScreenshareButton = (props: any) => {
  const rtc = useContext(RtcContext);
  const {screenshareActive, setScreenshareActive} = props;
  const {channel, appId, screenShareUid, screenShareToken} = useContext(PropsContext).rtcProps;

  rtc.RtcEngine.addListener('ScreenshareStopped', () => {
    setScreenshareActive(false);
  });
  return (
    <TouchableOpacity
      style={screenshareActive ? style.greenLocalButton : style.localButton}
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
      <Image source={{uri: icons.screenshareIcon}} style={style.buttonIcon} />
    </TouchableOpacity>
  );
};

const style = StyleSheet.create({
  localButton: {
    backgroundColor: '#fff',
    borderRadius: 2,
    borderColor: '#099DFD',
    borderWidth: 1,
    width: 46,
    height: 46,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenLocalButton: {
    backgroundColor: '#4BEB5B',
    borderRadius: 2,
    borderColor: '#F86051',
    width: 46,
    height: 46,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: 25,
    height: 25,
    tintColor: '#099DFD',
  },
});

export default ScreenshareButton;
