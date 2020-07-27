import React from 'react';
import {View, Platform, Text} from 'react-native';
import styles from './styles';
import ChatContainer from '../subComponents/ChatContainer';
import ChatInput from '../subComponents/ChatInput';

const Chat = (props) => {
  return (
    <View style={Platform.OS === 'web' ? styles.chatWeb : styles.chatNative}>
      <View style={styles.chatNav}>
        <Text style={styles.chatNavText}>Chat</Text>
      </View>
      <ChatContainer />
      <ChatInput />
    </View>
  );
};

export default Chat;
