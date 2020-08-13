import React, {useContext} from 'react';
import styles from '../components/styles';
import {TouchableOpacity, Image, View} from 'react-native';
import ChatContext, {controlMessageEnum} from '../components/ChatContext';
import icons from '../assets/icons';

const RemoteAudioMute = (props: {
  uid: number;
  audio: boolean;
  isHost: boolean;
}) => {
  const {sendControlMessageToUid} = useContext(ChatContext);
  return props.isHost ? (
    <TouchableOpacity
      onPress={() => {
        sendControlMessageToUid(controlMessageEnum.muteAudio, props.uid);
      }}>
      <Image
        style={styles.buttonIconMic}
        source={{uri: props.audio ? icons.mic : icons.micOff}}
      />
    </TouchableOpacity>
  ) : (
    <View>
      <Image
        style={styles.buttonIconMic}
        source={{uri: props.audio ? icons.mic : icons.micOff}}
      />
    </View>
  );
};

export default RemoteAudioMute;
