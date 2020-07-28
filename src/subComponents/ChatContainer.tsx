import React, {useContext} from 'react';
import {View, ScrollView} from 'react-native';
import styles from '../components/styles';
import ChatBubble from './ChatBubble';
import ChatContext from '../components/ChatContext';

const ChatContainer = () => {
  const {messageStore, localUid} = useContext(ChatContext);
  return (
    <View style={styles.videoViewInner}>
      <ScrollView>
        {messageStore.map((message: any) => {
          return (
            <ChatBubble
              type={localUid === message.uid ? 1 : 0}
              msg={message.msg}
              ts={message.ts}
              uid={message.uid}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

export default ChatContainer;
