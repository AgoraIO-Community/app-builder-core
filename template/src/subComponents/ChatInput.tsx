import React, {useState, useContext, useRef} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  TextInput as Ti,
  UIManager,
  KeyboardAvoidingView,
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
  const [height, setHeight] = useState(0);
  const {privateActive, selectedUser} = props;
  const {sendMessage, sendMessageToUid} = useContext(ChatContext);

  return (
    <View
      style={[
        style.inputView,
        {borderColor: primaryColor, height: Math.max(40, height + 25)},
      ]}>
      <TextInput
        value={message}
        multiline={false}
        // onContentSizeChange={(event) => {
        // causes infinite react state update on ctrl+A -> delete
        // setHeight(event.nativeEvent.contentSize.height);
        // }}
        onChangeText={(text) => onChangeMessage(text)}
        style={{
          borderRadius: 10,
          backgroundColor: $config.tertiaryFontColor + '22',
          borderWidth: 1,
          color: $config.primaryFontColor,
          textAlign: 'left',
          height: Math.max(35, height),
          paddingVertical: 10,
          alignSelf: 'center',
        }}
        blurOnSubmit={false}
        onSubmitEditing={() => {
          // console.log('!click');
          if (!privateActive) {
            sendMessage(message);
            onChangeMessage('');
            setHeight(40);
          } else {
            sendMessageToUid(message, selectedUser.uid);
            onChangeMessage('');
            setHeight(40);
          }
          // UIManager.focus(inputRef.current);
        }}
        placeholder="Type your message.."
        placeholderTextColor={$config.primaryFontColor}
        autoCorrect={false}
      />
      <TouchableOpacity
        style={style.chatInputButton}
        onPress={() => {
          if (!privateActive) {
            sendMessage(message);
            onChangeMessage('');
            setHeight(40);
          } else {
            sendMessageToUid(message, selectedUser.uid);
            onChangeMessage('');
            setHeight(40);
          }
        }}>
        <Image
          source={{
            uri: icons.send,
          }}
          style={style.chatInputButtonIcon}
          resizeMode={'contain'}
        />
      </TouchableOpacity>
    </View>
  );
};

const style = StyleSheet.create({
  inputView: {
    // width: '100%',
    flexDirection: 'row',
    marginHorizontal: 10,
    paddingVertical: 15,
  },
  chatInput: {
    flex: 1,
    width: '100%',
    backgroundColor: $config.primaryFontColor,
    color: $config.primaryFontColor,
  },
  chatInputButton: {
    width: 30,
    // width: '10%',
    marginRight: 0,
    height: 30,
    borderRadius: 30,
    alignSelf: 'center',
    marginHorizontal: 10,
    backgroundColor: $config.primaryColor,
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
