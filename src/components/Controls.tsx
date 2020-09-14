import React, {useState} from 'react';
import {View, Image, TouchableOpacity, Platform} from 'react-native';
import LocalUserContext from '../../agora-rn-uikit/src/LocalUserContext';
import {
  LocalAudioMute,
  LocalVideoMute,
  Endcall,
} from '../../agora-rn-uikit/Components';
import Recording from '../subComponents/Recording';
import styles from './styles';
import icons from '../assets/icons';
import ScreenshareButton from '../subComponents/ScreenshareButton';

export default function Controls(props: any) {
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
      <View style={{
        flex: Platform.OS === 'web' ? 1.3 : 1.6,
        paddingHorizontal: Platform.OS === 'web' ? '20%' : '1%',
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        position: 'relative',
        margin: 0,
        bottom: 0,
      }}>
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
