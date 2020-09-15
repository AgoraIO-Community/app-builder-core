import React, {useState} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import LocalUserContext from '../../agora-rn-uikit/src/LocalUserContext';
import {
  LocalAudioMute,
  LocalVideoMute,
  Endcall,
} from '../../agora-rn-uikit/Components';
import Recording from '../subComponents/Recording';
import icons from '../assets/icons';
import ScreenshareButton from '../subComponents/ScreenshareButton';

const Controls = (props: any) => {
  const [screenshareActive, setScreenshareActive] = useState(false);
  const {
    setRecordingActive,
    recordingActive,
    setChatDisplayed,
    chatDisplayed,
    isHost,
  } = props;
  return (
    <LocalUserContext>
      <View style={style.controlsHolder}>
        <LocalAudioMute />
        <LocalVideoMute />
        {isHost ? (
          <Recording
            recordingActive={recordingActive}
            setRecordingActive={setRecordingActive}
          />
        ) : (
          <></>
        )}
        <ScreenshareButton
          screenshareActive={screenshareActive}
          setScreenshareActive={setScreenshareActive}
        />
        <TouchableOpacity
          style={style.localButton}
          onPress={() => {
            setChatDisplayed(!chatDisplayed);
          }}>
          <Image source={{uri: icons.chatIcon}} style={style.buttonIcon} />
        </TouchableOpacity>
        <Endcall />
      </View>
    </LocalUserContext>
  );
};

const style = StyleSheet.create({
  controlsHolder: {
    flex: Platform.OS === 'web' ? 1.3 : 1.6,
    paddingHorizontal: Platform.OS === 'web' ? '20%' : '1%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    position: 'relative',
    margin: 0,
    bottom: 0,
  },
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
  buttonIcon:{
    width: 25,
    height: 25,
    tintColor: '#099DFD',
  },
});

export default Controls;
