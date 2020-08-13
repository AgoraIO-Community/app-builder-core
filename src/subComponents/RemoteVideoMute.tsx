import React, {useContext} from 'react';
import styles from '../components/styles';
import {TouchableOpacity, Image, View} from 'react-native';
import ChatContext, {controlMessageEnum} from '../components/ChatContext';
import icons from '../assets/icons';

const RemoteVideoMute = (props: {
  uid: number;
  video: boolean;
  isHost: boolean;
}) => {
  const {sendControlMessageToUid} = useContext(ChatContext);
  return props.isHost ? (
    <TouchableOpacity
      onPress={() => {
        sendControlMessageToUid(controlMessageEnum.muteVideo, props.uid);
      }}>
      <Image
        style={styles.buttonIconCam}
        source={{uri: props.video ? icons.videocam : icons.videocamOff}}
      />
    </TouchableOpacity>
  ) : (
    <View>
      <Image
        style={styles.buttonIconCam}
        source={{uri: props.video ? icons.videocam : icons.videocamOff}}
      />
    </View>
  );
};

export default RemoteVideoMute;
