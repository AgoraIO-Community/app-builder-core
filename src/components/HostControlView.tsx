import React, {useContext} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import styles from './styles';
import chatContext, { controlMessageEnum } from './ChatContext';

const HostControlView = () => {
  const {sendControlMessage} = useContext(chatContext);

  return (
    <View style={styles.hostControlView}>
      <TouchableOpacity
        style={styles.hostControlButton}
        onPress={() => sendControlMessage(controlMessageEnum.muteAudio)}>
        <Text style={styles.buttonText}>Mute all audios</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.hostControlButton}
        onPress={() => sendControlMessage(controlMessageEnum.muteVideo)}>
        <Text style={styles.buttonText}>Mute all videos</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HostControlView;
