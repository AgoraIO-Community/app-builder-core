import React, {useContext} from 'react';
import {TouchableOpacity, Image, View, StyleSheet} from 'react-native';
import ChatContext, {controlMessageEnum} from '../components/ChatContext';
import icons from '../assets/icons';
import ColorContext from '../components/ColorContext';

/**
 * Component to mute / unmute remote audio.
 * Sends a control message to another user over RTM if the local user is a host.
 * If the local user is not a host, it simply renders an image
 */
const RemoteAudioMute = (props: {
  uid: number;
  audio: boolean;
  isHost: boolean;
}) => {
  const {primaryColor} = useContext(ColorContext);
  const {sendControlMessageToUid} = useContext(ChatContext);
  return props.isHost ? (
    <TouchableOpacity
      onPress={() => {
        sendControlMessageToUid(controlMessageEnum.muteAudio, props.uid);
      }}>
      <Image
        style={[style.buttonIconMic, {tintColor: primaryColor}]}
        source={{uri: props.audio ? icons.mic : icons.micOff}}
      />
    </TouchableOpacity>
  ) : (
    <View>
      <Image
        style={[style.buttonIconMic, {tintColor: primaryColor}]}
        source={{uri: props.audio ? icons.mic : icons.micOff}}
      />
    </View>
  );
};

const style = StyleSheet.create({
  buttonIconMic: {
    width: 25,
    height: 24,
    tintColor: $config.PRIMARY_COLOR,
  },
});

export default RemoteAudioMute;
