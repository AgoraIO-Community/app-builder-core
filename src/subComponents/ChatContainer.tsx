import React, {useContext} from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import ChatBubble from './ChatBubble';
import ChatContext from '../components/ChatContext';

const ChatContainer = (props: any) => {
  const {selectedUser, privateActive, setPrivateActive} = props;
  const {messageStore, localUid, privateMessageStore} = useContext(ChatContext);
  return (
    <View style={style.containerView}>
      {privateActive ? (
        <View style={style.row}>
          <TouchableOpacity
            style={style.backButton}
            onPress={() => setPrivateActive(false)}>
            <Image
              resizeMode={'contain'}
              style={style.backIcon}
              source={{
                uri:
                  'data:image/png;base64,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',
              }}
            />
          </TouchableOpacity>
          <Text style={style.name}>{selectedUser.uid}</Text>
        </View>
      ) : (
        <></>
      )}
      <ScrollView>
        {!privateActive ? (
          messageStore.map((message: any) => {
            return (
              <ChatBubble
                type={localUid === message.uid ? 1 : 0}
                msg={message.msg}
                ts={message.ts}
                uid={message.uid}
                // key={}
              />
            );
          })
        ) : privateMessageStore[selectedUser.uid] ? (
          privateMessageStore[selectedUser.uid].map((message: any) => {
            return (
              <ChatBubble
                type={localUid === message.uid ? 1 : 0}
                msg={message.msg}
                ts={message.ts}
                uid={message.uid}
              />
            );
          })
        ) : (
          <></>
        )}
      </ScrollView>
    </View>
  );
};

const style = StyleSheet.create({
  containerView: {flex: 8},
  row: {flexDirection: 'row', marginTop: 5},
  backButton: {
    marginLeft: 5,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  name: {fontSize: 18, fontWeight: '500', marginLeft: 10, color: '#333'},
  backIcon: {
    width: 20,
    height: 12,
    alignSelf: 'center',
    justifyContent: 'center',
  },
});
export default ChatContainer;
