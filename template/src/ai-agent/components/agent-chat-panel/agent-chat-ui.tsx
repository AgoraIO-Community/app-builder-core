import React, {useContext} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {AgentContext, ChatItem} from '../AgentControls/AgentContext'; // Ensure the path matches your project structure
import {ChatBubble, ChatMessageType} from 'customization-api';

// ChatItem Component
const ChatItemBubble = ({item}: {item: ChatItem}) => {
  return (
    <ChatBubble
      key={item.id}
      msgId={item.id}
      isLocal={item.isSelf}
      message={item.text}
      createdTimestamp={item.time}
      uid={item.uid}
      isDeleted={false}
      isSameUser={false}
      type={ChatMessageType.TXT}
      remoteUIConfig={{
        username: 'AI Agent',
        bubbleStyleLayer1: {
          backgroundColor: 'transparent',
          paddingLeft: 4,
          paddingRight: 0,
          paddingTop: 2,
          marginTop: 0,
        },
        bubbleStyleLayer2: {
          padding: 0,
        },
      }}
    />
  );
};

// Main Chat Component
const ChatScreen = () => {
  const {chatItems} = useContext(AgentContext); // Access chatItems from AgentContext

  return (
    <View style={styles.container}>
      <ScrollView style={styles.contentContainer}>
        {chatItems.map(item => {
          return <ChatItemBubble item={item} />;
        })}
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    height: '100%',
  },
  contentContainer: {
    padding: 16,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
  },
  chatBubble: {
    maxWidth: '70%',
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
  },
  selfBubble: {
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
    border: '1px solid blue',
  },
  otherBubble: {
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
    border: '1px solid green',
  },
  chatText: {
    fontSize: 14,
    color: '#fff',
  },
});

export default ChatScreen;
