import React, {useContext} from 'react';
import styles from '../components/styles';
import {TouchableOpacity, Image} from 'react-native';
import ChatContext, {controlMessageEnum} from '../components/ChatContext';
import icons from '../assets/icons';

const RemoteEndCall = (props: {uid: number; isHost: boolean}) => {
  const {sendControlMessageToUid} = useContext(ChatContext);
  return props.isHost ? (
    <TouchableOpacity
      style={styles.remoteButton}
      onPress={() => {
        sendControlMessageToUid(controlMessageEnum.kickUser, props.uid);
      }}>
      <Image style={styles.buttonIconEnd} source={{uri: icons.endCall}} />
    </TouchableOpacity>
  ) : (
    <></>
  );
};

export default RemoteEndCall;
