import React, {useState, useContext, useEffect} from 'react';
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
import ColorContext from './ColorContext';
import ChatContext from '../components/ChatContext';

const Controls = (props: any) => {
  const {primaryColor} = useContext(ColorContext);
  const {messageStore} = useContext(ChatContext);
  const [screenshareActive, setScreenshareActive] = useState(false);
  const {
    setRecordingActive,
    recordingActive,
    setChatDisplayed,
    chatDisplayed,
    isHost,
    pendingMessageLength,
    setLastCheckedPublicState,
  } = props;

  return (
    <LocalUserContext>
      <View style={style.controlsHolder}>
        <LocalAudioMute />
        <LocalVideoMute />
        {isHost ? (
          $config.cloudRecording ? (
            <Recording
              recordingActive={recordingActive}
              setRecordingActive={setRecordingActive}
            />
          ) : (
            <></>
          )
        ) : (
          <></>
        )}
        {$config.screenSharing ? (
          <ScreenshareButton
            screenshareActive={screenshareActive}
            setScreenshareActive={setScreenshareActive}
          />
        ) : (
          <></>
        )}
        {$config.chat ? (
          <TouchableOpacity
            style={[style.localButton, {borderColor: primaryColor}]}
            onPress={() => {
              setLastCheckedPublicState(messageStore.length);
              setChatDisplayed(!chatDisplayed);
            }}>
            {!chatDisplayed && pendingMessageLength !== 0 ? (
              <View style={style.chatNotification}>{pendingMessageLength}</View>
            ) : null}
            <Image
              source={{uri: icons.chatIcon}}
              style={[style.buttonIcon, {tintColor: primaryColor}]}
            />
          </TouchableOpacity>
        ) : (
          <></>
        )}
        <Endcall />
      </View>
    </LocalUserContext>
  );
};

const style = StyleSheet.create({
  controlsHolder: {
    flex: Platform.OS === 'web' ? 1.3 : 1.6,
    maxHeight: '10%',
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
    // borderWidth: 1,
    width: 46,
    height: 46,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: 35,
    height: 35,
    tintColor: '#099DFD',
  },
  chatNotification: {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#099DFD',
    color: '#FFF',
    borderRadius: '50%',
    position: 'absolute',
    left: 25,
    top: -15,
  },
});

export default Controls;
