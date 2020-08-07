import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import styles from './styles';

const HostControlView = () => {
  return (
    <View style={styles.hostControlView}>
      <TouchableOpacity style={styles.hostControlButton} onPress={() => {}}>
        <Text style={styles.buttonText}>Mute all audios</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.hostControlButton} onPress={() => {}}>
        <Text style={styles.buttonText}>Mute all videos</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HostControlView;
