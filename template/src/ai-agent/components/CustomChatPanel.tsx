import {StyleSheet, View} from 'react-native';
import React from 'react';
import ChatScreen from './agent-chat-panel/agent-chat-ui';

const CustomSidePanel = () => {
  return (
    <View style={styles.container}>
      <ChatScreen />
    </View>
  );
};

export default CustomSidePanel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    height: '100%',
  },
});
