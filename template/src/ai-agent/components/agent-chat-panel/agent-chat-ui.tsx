import React, {useContext} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
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
      createdTimestamp={`${item.time}`}
      uid={item.uid}
      isDeleted={false}
      isSameUser={false}
      type={ChatMessageType.TXT}
      remoteUIConfig={{
        username: 'AI Agent',
        avatarIcon:
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik01LjAyMTQ4IDYuNjgxMzZDNS4wMjE0OCA2LjgwMDg5IDUuMTEwNDkgNi45MDE3MiA1LjIyOTE0IDYuOTE2NThDNS4yMzE4IDYuOTE2ODkgNS41MDQ2MyA2Ljk1NDY5IDUuNzkwMjQgNy4xMjI3MkM2LjE2OTIxIDcuMzQ1NjEgNi4zODk3IDcuNjg1NTggNi40NDU2NSA4LjEzMzA4QzYuNDYwNSA4LjI1MTczIDYuNTYxMzMgOC4zNDA3NCA2LjY4MDg3IDguMzQwNzRDNi44MDA0MSA4LjM0MDc0IDYuOTAxMjMgOC4yNTE3MyA2LjkxNjA5IDguMTMzMDhDNi45MTY0IDguMTMwNDIgNi45NTQyMSA3Ljg1NzU5IDcuMTIyMjMgNy41NzE5OUM3LjM0NTEzIDcuMTkzMDEgNy42ODUwOSA2Ljk3MjUyIDguMTMyNTkgNi45MTY1OEM4LjI1MTI0IDYuOTAxNzIgOC4zNDAyNSA2LjgwMDg5IDguMzQwMjUgNi42ODEzNkM4LjM0MDI1IDYuNTYxODIgOC4yNTEyNCA2LjQ2MDk5IDguMTMyNTkgNi40NDYxM0M4LjEyOTkzIDYuNDQ1ODIgNy44NTcxIDYuNDA4MDIgNy41NzE1IDYuMjM5OTlDNy4xOTI1MyA2LjAxNzEgNi45NzIwMyA1LjY3NzEzIDYuOTE2MDkgNS4yMjk2M0M2LjkwMTIzIDUuMTEwOTggNi44MDA0MSA1LjAyMTk3IDYuNjgwODcgNS4wMjE5N0M2LjU2MTMzIDUuMDIxOTcgNi40NjA1IDUuMTEwOTggNi40NDU2NSA1LjIyOTYzQzYuNDQ1MzMgNS4yMzIyOSA2LjQwNzUzIDUuNTA1MTIgNi4yMzk1IDUuNzkwNzJDNi4wMTY2MSA2LjE2OTcgNS42NzY2NCA2LjM5MDE5IDUuMjI5MTQgNi40NDYxM0M1LjExMDQ5IDYuNDYwOTkgNS4wMjE0OCA2LjU2MTgyIDUuMDIxNDggNi42ODEzNlpNMi41MzI3MSAxMi4wNzQzQzIuNTMyNzEgMTIuMjgzNSAyLjY4ODQ4IDEyLjQ2IDIuODk2MTIgMTIuNDg2QzIuOTAwNzcgMTIuNDg2NSAzLjM3ODIzIDEyLjU1MjcgMy44NzgwMyAxMi44NDY3QzQuNTQxMjMgMTMuMjM2OCA0LjkyNzA5IDEzLjgzMTcgNS4wMjUgMTQuNjE0OEM1LjA1MDk5IDE0LjgyMjUgNS4yMjc0NCAxNC45NzgyIDUuNDM2NjMgMTQuOTc4MkM1LjY0NTgzIDE0Ljk3ODIgNS44MjIyNyAxNC44MjI1IDUuODQ4MjcgMTQuNjE0OEM1Ljg0ODgyIDE0LjYxMDIgNS45MTQ5OCAxNC4xMzI3IDYuMjA5MDIgMTMuNjMyOUM2LjU5OTA5IDEyLjk2OTcgNy4xOTQwMyAxMi41ODM5IDcuOTc3MTUgMTIuNDg2QzguMTg0NzkgMTIuNDYgOC4zNDA1NSAxMi4yODM1IDguMzQwNTUgMTIuMDc0M0M4LjM0MDU1IDExLjg2NTEgOC4xODQ3OSAxMS42ODg3IDcuOTc3MTUgMTEuNjYyN0M3Ljk3MjUgMTEuNjYyMSA3LjQ5NTA0IDExLjU5NiA2Ljk5NTI0IDExLjMwMTlDNi4zMzIwNCAxMC45MTE5IDUuOTQ2MTggMTAuMzE2OSA1Ljg0ODI3IDkuNTMzODFDNS44MjIyNyA5LjMyNjE3IDUuNjQ1ODMgOS4xNzA0MSA1LjQzNjYzIDkuMTcwNDFDNS4yMjc0NCA5LjE3MDQxIDUuMDUwOTkgOS4zMjYxNyA1LjAyNSA5LjUzMzgxQzUuMDI0NDQgOS41Mzg0NiA0Ljk1ODI5IDEwLjAxNTkgNC42NjQyNSAxMC41MTU3QzQuMjc0MTggMTEuMTc4OSAzLjY3OTI0IDExLjU2NDggMi44OTYxMiAxMS42NjI3QzIuNjg4NDggMTEuNjg4NyAyLjUzMjcxIDExLjg2NTEgMi41MzI3MSAxMi4wNzQzWk0xMy41NTA3IDEzLjU3NzVDMTMuNTA5OSAxMy45MDM4IDEzLjIzMjYgMTQuMTQ4NiAxMi45MDM5IDE0LjE0ODZDMTIuNTc1MSAxNC4xNDg2IDEyLjI5NzkgMTMuOTAzOCAxMi4yNTcgMTMuNTc3NUMxMi4xMDMyIDEyLjM0NjkgMTEuNDk2OCAxMS40MTIgMTAuNDU0NiAxMC43OTlDOS42NjkyMiAxMC4zMzcgOC45MTg5MiAxMC4yMzMgOC45MTE2MiAxMC4yMzIyQzguNTg1MzIgMTAuMTkxMyA4LjM0MDU2IDkuOTE0MDMgOC4zNDA1NSA5LjU4NTNDOC4zNDA1NSA5LjI1NjU3IDguNTg1MzIgOC45NzkyOSA4LjkxMTYxIDguOTM4NDRDMTAuMTQyMiA4Ljc4NDU4IDExLjA3NzEgOC4xNzgyMiAxMS42OTAxIDcuMTM2MDVDMTIuMTUyMiA2LjM1MDY0IDEyLjI1NjEgNS42MDAzNCAxMi4yNTcgNS41OTMwNEMxMi4yOTc4IDUuMjY2NzQgMTIuNTc1MSA1LjAyMTk3IDEyLjkwMzggNS4wMjE5N0MxMy4yMzI2IDUuMDIxOTcgMTMuNTA5OCA1LjI2Njc0IDEzLjU1MDcgNS41OTMwM0MxMy43MDQ1IDYuODIzNjUgMTQuMzEwOSA3Ljc1ODU2IDE1LjM1MzEgOC4zNzE1MUMxNi4xMzg1IDguODMzNTcgMTYuODg4OCA4LjkzNzUyIDE2Ljg5NjEgOC45MzgzOUMxNy4yMjI0IDguOTc5MjQgMTcuNDY3MiA5LjI1NjUyIDE3LjQ2NzIgOS41ODUyNUMxNy40NjcyIDkuOTEzOTggMTcuMjIyNCAxMC4xOTEzIDE2Ljg5NjEgMTAuMjMyMUMxNS42NjU1IDEwLjM4NiAxNC43MzA2IDEwLjk5MjMgMTQuMTE3NiAxMi4wMzQ1QzEzLjY1NTYgMTIuODE5OSAxMy41NTE2IDEzLjU3MDIgMTMuNTUwNyAxMy41Nzc1WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzc2MDZfNzAwMSkiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl83NjA2XzcwMDEiIHgxPSIxNy40MTQiIHkxPSIxMC4xMzQ1IiB4Mj0iMi4yOTkzNyIgeTI9IjEwLjE2MDEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzAwQzJGRiIvPgo8c3RvcCBvZmZzZXQ9IjAuMzMiIHN0b3AtY29sb3I9IiNBMEZBRkYiLz4KPHN0b3Agb2Zmc2V0PSIwLjY2IiBzdG9wLWNvbG9yPSIjRTVGRUZGIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0M0NkZGQiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=',
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
      <FlatList
        data={chatItems}
        keyExtractor={item => `${item.uid}`}
        renderItem={({item}) => <ChatItemBubble item={item} />}
        contentContainerStyle={styles.chatList}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatList: {},
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
