import React, {useContext} from 'react';
import {TouchableOpacity, Image, View, StyleSheet} from 'react-native';
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
        style={style.buttonIconMic}
        source={{uri: props.audio ? icons.mic : icons.micOff}}
      />
    </TouchableOpacity>
  ) : (
    <View>
      <Image
        style={style.buttonIconMic}
        source={{uri: props.audio ? icons.mic : icons.micOff}}
      />
    </View>
  );
};

const style = StyleSheet.create({
  buttonIconMic: {
    width: 22,
    height: 20,
    tintColor: '#099DFD',
  },
});

export default RemoteAudioMute;
