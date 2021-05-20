import React, {useState, useContext, useRef} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  TextInput as Ti,
  UIManager,
} from 'react-native';
import ChatContext from '../components/ChatContext';
import ColorContext from '../components/ColorContext';
import TextInput from '../atoms/TextInput';
import icons from '../assets/icons';

/**
 * Input component for the Chat interface
 */
const ChatInput = (props: any) => {
  const {primaryColor} = useContext(ColorContext);
  const [message, onChangeMessage] = useState('');
  const {privateActive, selectedUser} = props;
  const {sendMessage, sendMessageToUid} = useContext(ChatContext);
  return (
    <View style={[style.inputView, {borderColor: primaryColor}]}>
      <TextInput
        value={message}
        onChangeText={(text) => onChangeMessage(text)}
        style={{color: 'black'}}
        blurOnSubmit={false}
        onSubmitEditing={() => {
          !privateActive
            ? (sendMessage(message), onChangeMessage(''))
            : (sendMessageToUid(message, selectedUser.uid),
              onChangeMessage(''));

          // UIManager.focus(inputRef.current);
        }}
        placeholder="Type your message.."
        placeholderTextColor="#000"
        autoCorrect={false}
      />
      <TouchableOpacity
        style={[style.chatInputButton]}
        onPress={() => {
          !privateActive
            ? (sendMessage(message), onChangeMessage(''))
            : (sendMessageToUid(message, selectedUser.uid),
              onChangeMessage(''));
        }}>
        <Image
          source={{
            uri: icons.send,
          }}
          style={[style.chatInputButtonIcon]}
          resizeMode={'contain'}
        />
      </TouchableOpacity>
    </View>
  );
};

const style = StyleSheet.create({
  inputView: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 10,
    paddingVertical: 15,
  },
  chatInput: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    color: '#000',
  },
  chatInputButton: {
    width: 30,
    height: 30,
    borderRadius: 30,
    alignSelf: 'center',
    marginHorizontal: 10,
    backgroundColor: '#099DFD',
    display: 'flex',
    justifyContent: 'center',
  },
  chatInputButtonIcon: {
    width: '80%',
    height: '80%',
    alignSelf: 'center',
    transform: [
      {
        translateX: -2,
      },
    ],
  },
});
export default ChatInput;
