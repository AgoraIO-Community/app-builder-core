import React, {useState, useContext} from 'react';
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
import {SidePanelType} from '../subComponents/SidePanelEnum';
import {controlsHolder,localButton, buttonIcon} from '../../theme.json';

const Controls = (props: any) => {
  const {primaryColor} = useContext(ColorContext);
  const [screenshareActive, setScreenshareActive] = useState(false);
  const {
    // participantsView,
    // setParticipantsView,
    setRecordingActive,
    recordingActive,
    // setChatDisplayed,
    // chatDisplayed,
    sidePanel,
    setSidePanel,
    isHost,
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
              sidePanel === SidePanelType.Chat
                ? setSidePanel(SidePanelType.None)
                : setSidePanel(SidePanelType.Chat);
            }}>
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
    paddingHorizontal: Platform.OS === 'web' ? '20%' : '1%',
    ...controlsHolder
  },
  localButton: localButton,
  buttonIcon: buttonIcon,
});

export default Controls;
