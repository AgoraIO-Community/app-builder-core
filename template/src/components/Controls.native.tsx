import React, { useContext } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Platform,
  StyleSheet,
  Text,
} from 'react-native';
import LocalUserContext from '../../agora-rn-uikit/src/LocalUserContext';
import {
  LocalAudioMute,
  LocalVideoMute,
  SwitchCamera,
  Endcall,
} from '../../agora-rn-uikit/Components';
import Recording from '../subComponents/Recording';
import icons from '../assets/icons';
import ColorContext from './ColorContext';
import { SidePanelType } from '../subComponents/SidePanelEnum';

const Controls = (props: any) => {
  const {
    setRecordingActive,
    recordingActive,
    sidePanel,
    setSidePanel,
    isHost
  } = props;
  const { primaryColor } = useContext(ColorContext);

  return (
    <LocalUserContext>
      <View style={style.bottomBar}>
        <View style={{ alignSelf: 'center' }}>
          <LocalAudioMute />
          <Text style={{ textAlign: 'center', marginTop: 5, color: $config.primaryColor }}>Audio</Text>
        </View>
        <View style={{ alignSelf: 'center' }}>
          <LocalVideoMute />
          <Text style={{ textAlign: 'center', marginTop: 5, color: $config.primaryColor }}>Video</Text>
        </View>
        {isHost ? (
          $config.cloudRecording ? (
            <View style={{ alignSelf: 'center' }}>
              <Recording
                recordingActive={recordingActive}
                setRecordingActive={setRecordingActive}
              />
              <Text style={{ textAlign: 'center', marginTop: 5, color: $config.primaryColor }}>Record</Text>
            </View>
          ) : (
            <></>
          )
        ) : (
          <></>
        )}
        <View style={{ alignSelf: 'center' }}>
          <SwitchCamera />
          <Text style={{ textAlign: 'center', marginTop: 5, color: $config.primaryColor }}>Switch</Text>
        </View>
        {/* <View style={{ alignSelf: 'center' }}>
          <TouchableOpacity
            style={[style.localButton, { borderColor: primaryColor, borderRadius: 50 }]}
            onPress={() => {
              sidePanel === SidePanelType.Chat
                ? setSidePanel(SidePanelType.None)
                : setSidePanel(SidePanelType.Chat);
            }}>
            <Image
              source={{ uri: icons.chatIcon }}
              style={[style.buttonIcon, { tintColor: primaryColor }]}
            />
          </TouchableOpacity>
          <Text style={{ textAlign: 'center', marginTop: 5, color: $config.primaryColor }}>Chat</Text>
        </View> */}
        <View style={{ alignSelf: 'center' }}>
          <Endcall />
          <Text style={{ textAlign: 'center', marginTop: 5, color: '#FD0845' }}>Hang Up</Text>
        </View>
      </View>
    </LocalUserContext>
  );
};

const style = StyleSheet.create({
  bottomBar: {
    flex: 1,
    paddingHorizontal: '1%',
    backgroundColor: $config.secondaryFontColor + '80',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    position: 'relative',
    margin: 0,
    minHeight: 40,
    bottom: 0,
  },
  localButton: {
    backgroundColor: $config.secondaryFontColor,
    borderRadius: 2,
    borderColor: $config.primaryColor,
    // borderWidth: 1,
    width: 40,
    height: 40,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: 35,
    height: 35,
    tintColor: $config.primaryColor,
  },
});

export default Controls;
