import React, {useContext} from 'react';
import {TouchableOpacity, Image, View, StyleSheet} from 'react-native';
import ChatContext, {controlMessageEnum} from '../components/ChatContext';
import icons from '../assets/icons';
import ColorContext from '../components/ColorContext';

/**
 * Component to mute / unmute remote video.
 * Sends a control message to another user over RTM if the local user is a host.
 * If the local user is not a host, it simply renders an image
 */
const RemoteVideoMute = (props: {
  uid: number;
  video: boolean;
  isHost: boolean;
}) => {
  const {primaryColor} = useContext(ColorContext);
  const {sendControlMessageToUid} = useContext(ChatContext);
  return props.isHost ? (
    <TouchableOpacity
      onPress={() => {
        sendControlMessageToUid(controlMessageEnum.muteVideo, props.uid);
      }}>
      <Image
        style={[style.buttonIconCam, {tintColor: primaryColor}]}
        source={{uri: props.video ? icons.videocam : icons.videocamOff}}
        resizeMode={'contain'}
      />
    </TouchableOpacity>
  ) : (
    <View>
      <Image
        style={[style.buttonIconCam, {tintColor: primaryColor}]}
        source={{uri: props.video ? icons.videocam : icons.videocamOff}}
        resizeMode={'contain'}
      />
    </View>
  );
};

const style = StyleSheet.create({
  buttonIconCam: {
    width: 30,
    height: 25,
    marginHorizontal: 3,
    tintColor: $config.PRIMARY_COLOR,
  },
});

export default RemoteVideoMute;
