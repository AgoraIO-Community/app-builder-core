import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Text,
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
import {SidePanelType} from '../subComponents/SidePanelEnum';
import {controlsHolder, localButton, buttonIcon} from '../../theme.json';

const Controls = (props: any) => {
  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };
  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  const isDesktop = dim[0] > 1224;

  const {primaryColor} = useContext(ColorContext);
  const {messageStore} = useContext(ChatContext);
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
    pendingMessageLength,
    setLastCheckedPublicState,
  } = props;

  return (
    <LocalUserContext>
      <View style={[style.controlsHolder, { paddingHorizontal: isDesktop ? '20%' : '1%'}]} onLayout={onLayout}>
        <View style={{alignSelf: 'center'}}>
          <LocalAudioMute />
          <Text
            style={{
              textAlign: 'center',
              marginTop: 5,
              color: $config.primaryColor,
            }}>
            Audio
          </Text>
        </View>
        <View style={{alignSelf: 'center'}}>
          <LocalVideoMute />
          <Text
            style={{
              textAlign: 'center',
              marginTop: 5,
              color: $config.primaryColor,
            }}>
            Video
          </Text>
        </View>
        {$config.screenSharing ? isDesktop ? (
          <View style={{alignSelf: 'center'}}>
            <ScreenshareButton
              screenshareActive={screenshareActive}
              setScreenshareActive={setScreenshareActive}
            />
            {/* <Text style={{color: '#fff'}}>{(dim[0] +":"+ dim[1]) + ''}</Text> */}
            <Text
              style={{
                textAlign: 'center',
                marginTop: 5,
                color: $config.primaryColor,
              }}>
              Share
            </Text>
          </View>
        ) : <></> : (
          <></>
        )}
        {isHost ? (
          $config.cloudRecording ? (
            <View style={{alignSelf: 'center'}}>
              <Recording
                recordingActive={recordingActive}
                setRecordingActive={setRecordingActive}
              />
              <Text
                style={{
                  textAlign: 'center',
                  marginTop: 5,
                  color: $config.primaryColor,
                }}>
                Record
              </Text>
            </View>
          ) : (
            <></>
          )
        ) : (
          <></>
        )}
        {$config.chat ? (
          <View style={{alignSelf: 'center'}}>
            <TouchableOpacity
              style={[style.localButton, {borderColor: primaryColor}]}
              onPress={() => {
                setLastCheckedPublicState(messageStore.length);
                sidePanel === SidePanelType.Chat
                  ? setSidePanel(SidePanelType.None)
                  : setSidePanel(SidePanelType.Chat);
              }}>
              {sidePanel !== SidePanelType.Chat &&
              pendingMessageLength !== 0 ? (
                <View style={style.chatNotification}>
                  {pendingMessageLength}
                </View>
              ) : (
                <></>
              )}
              <Image
                source={{uri: icons.chatIcon}}
                style={[style.buttonIcon, {tintColor: primaryColor}]}
              />
            </TouchableOpacity>
            <Text
              style={{
                textAlign: 'center',
                marginTop: 5,
                color: $config.primaryColor,
              }}>
              Chat
            </Text>
          </View>
        ) : (
          <></>
        )}
        {isDesktop ? <View
          style={{
            backgroundColor: $config.primaryFontColor + '80',
            width: 1,
            height: '70%',
            marginHorizontal: -20,
            alignSelf: 'center',
            opacity: 0.8,
          }}
        />:<></>}
        <View style={{alignSelf: 'center'}}>
          <Endcall />
          <Text style={{textAlign: 'center', marginTop: 5, color: '#FD0845'}}>
            Hang Up
          </Text>
        </View>
      </View>
    </LocalUserContext>
  );
};

const style = StyleSheet.create({
  controlsHolder: {
    flex: Platform.OS === 'web' ? 1.3 : 1.6,
    ...controlsHolder,
  },
  chatNotification: {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: $config.primaryColor,
    color: $config.secondaryFontColor,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif',
    borderRadius: 10,
    position: 'absolute',
    left: 25,
    top: -10,
  },
  localButton: localButton,
  buttonIcon: buttonIcon,
});

export default Controls;
