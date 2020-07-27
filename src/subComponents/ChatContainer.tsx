import React from 'react';
import {View, ScrollView} from 'react-native';
import styles from '../components/styles';
import ChatBubble from './ChatBubble';

const ChatContainer = () => {
  return (
    <View style={styles.videoViewInner}>
      <ScrollView>
        <ChatBubble type={0} />
        <ChatBubble type={0} />
        <ChatBubble type={0} />
        <ChatBubble type={0} />
        <ChatBubble type={1} />
        <ChatBubble type={0} />
        <ChatBubble type={0} />
        <ChatBubble type={1} />
        <ChatBubble type={0} />
        <ChatBubble type={0} />
        <ChatBubble type={1} />
        <ChatBubble type={1} />
        <ChatBubble type={1} />
        <ChatBubble type={0} />
        <ChatBubble type={0} />
        <ChatBubble type={1} />
      </ScrollView>
    </View>
  );
};

export default ChatContainer;
