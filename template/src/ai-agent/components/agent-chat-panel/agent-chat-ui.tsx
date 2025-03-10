import React, {useContext} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {AgentContext} from '../AgentControls/AgentContext';
import {ChatBubble, ChatMessageType, useLocalUid} from 'customization-api';

// ChatItem Component
const ChatItemBubble = ({item}: {item: any}) => {
  const localUid = useLocalUid();
  return (
    <ChatBubble
      key={`${item.turn_id}-${item.uid}`}
      msgId={`${item.turn_id}-${item.uid}`}
      isLocal={localUid === item.uid}
      message={item.text}
      createdTimestamp={item._time}
      uid={item.uid}
      isDeleted={false}
      isSameUser={false}
      type={ChatMessageType.TXT} //TODO: for images for vision modality
      agent_text_status={item.status}
      remoteUIConfig={{
        username: 'AI Agent',
        bubbleStyleLayer1: {
          backgroundColor: 'transparent',
          paddingLeft: 4,
          paddingRight: 0,
          paddingTop: 2,
          marginTop: 0,
        },
        bubbleStyleLayer2: {},
      }}
      disableReactions={true}
    />
  );
};

// Main Chat Component
const ChatScreen = () => {
  const {chatHistory} = useContext(AgentContext);
  return (
    <View style={styles.container}>
      <ScrollView style={styles.contentContainer}>
        {chatHistory.map(item => {
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
