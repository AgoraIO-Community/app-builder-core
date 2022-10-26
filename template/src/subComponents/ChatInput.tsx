/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React, {useContext} from 'react';
import {View, TouchableOpacity, StyleSheet, Image} from 'react-native';
import ColorContext from '../components/ColorContext';
import TextInput from '../atoms/TextInput';
import icons from '../assets/icons';
import {useString} from '../utils/useString';
import {useChatMessages} from '../components/chat-messages/useChatMessages';
import {isValidReactComponent} from '../utils/common';
import {useCustomization} from 'customization-implementation';
import {useChatUIControl} from '../components/chat-ui/useChatUIControl';

export interface ChatSendButtonProps {
  render?: (onPress: () => void) => JSX.Element;
}

export const ChatSendButton = (props: ChatSendButtonProps) => {
  const {
    selectedChatUserId: selectedUserId,
    message,
    setMessage,
  } = useChatUIControl();
  const {sendChatMessage} = useChatMessages();
  const onPress = () => {
    if (!selectedUserId) {
      sendChatMessage(message);
      setMessage && setMessage('');
    } else {
      sendChatMessage(message, selectedUserId);
      setMessage && setMessage('');
    }
  };
  return props?.render ? (
    props.render(onPress)
  ) : (
    <TouchableOpacity style={style.chatInputButton} onPress={onPress}>
      <Image
        source={{
          uri: icons.send,
        }}
        style={style.chatInputButtonIcon}
        resizeMode={'contain'}
      />
    </TouchableOpacity>
  );
};
export interface ChatTextInputProps {
  render?: (
    message: string,
    onChangeText: (text: string) => void,
    onSubmitEditing: () => void,
    chatMessageInputPlaceholder: string,
  ) => JSX.Element;
}
export const ChatTextInput = (props: ChatTextInputProps) => {
  const {
    selectedChatUserId: selectedUserId,
    message,
    setMessage,
  } = useChatUIControl();
  const {sendChatMessage} = useChatMessages();
  //commented for v1 release
  // const chatMessageInputPlaceholder = useString(
  //   'chatMessageInputPlaceholder',
  // )();
  const chatMessageInputPlaceholder = 'Type your message..';
  const onChangeText = (text: string) => setMessage(text);
  const onSubmitEditing = () => {
    if (!selectedUserId) {
      sendChatMessage(message);
      setMessage('');
    } else {
      sendChatMessage(message, selectedUserId);
      setMessage('');
    }
  };

  return props?.render ? (
    props.render(
      message,
      onChangeText,
      onSubmitEditing,
      chatMessageInputPlaceholder,
    )
  ) : (
    <TextInput
      value={message}
      onChangeText={onChangeText}
      style={{
        borderRadius: 10,
        backgroundColor: $config.PRIMARY_FONT_COLOR + '10',
        borderWidth: 1,
        color: $config.PRIMARY_FONT_COLOR,
        textAlign: 'left',
        height: 40,
        paddingVertical: 10,
        flex: 1,
        alignSelf: 'center',
      }}
      blurOnSubmit={false}
      onSubmitEditing={onSubmitEditing}
      placeholder={chatMessageInputPlaceholder}
      placeholderTextColor={$config.PRIMARY_FONT_COLOR}
      autoCorrect={false}
    />
  );
};

/**
 * Input component for the Chat interface
 */
const ChatInput = (props: {
  chatInput?: React.ComponentType<ChatTextInputProps>;
  chatSendButton?: React.ComponentType<ChatSendButtonProps>;
}) => {
  const {primaryColor} = useContext(ColorContext);
  const {ChatInputComponent, ChatSendButtonComponent} = useCustomization(
    (data) => {
      let components: {
        ChatInputComponent: React.ComponentType<ChatTextInputProps>;
        ChatSendButtonComponent: React.ComponentType<ChatSendButtonProps>;
      } = {
        ChatInputComponent: ChatTextInput,
        ChatSendButtonComponent: ChatSendButton,
      };
      if (
        data?.components?.videoCall &&
        typeof data?.components?.videoCall === 'object'
      ) {
        if (
          data?.components?.videoCall?.chat &&
          typeof data?.components?.videoCall?.chat === 'object'
        ) {
          if (
            data?.components?.videoCall?.chat?.chatInput &&
            typeof data?.components?.videoCall?.chat?.chatInput !== 'object' &&
            isValidReactComponent(data?.components?.videoCall?.chat?.chatInput)
          ) {
            components.ChatInputComponent =
              data?.components?.videoCall?.chat?.chatInput;
          }
          if (
            data?.components?.videoCall?.chat?.chatSendButton &&
            typeof data?.components?.videoCall?.chat?.chatSendButton !==
              'object' &&
            isValidReactComponent(
              data?.components?.videoCall?.chat?.chatSendButton,
            )
          ) {
            components.ChatSendButtonComponent =
              data?.components?.videoCall?.chat?.chatSendButton;
          }
        }
      } else {
        if (props?.chatInput && isValidReactComponent(props.chatInput)) {
          components.ChatInputComponent = props.chatInput;
        }
        if (
          props?.chatSendButton &&
          isValidReactComponent(props.chatSendButton)
        ) {
          components.ChatSendButtonComponent = props.chatSendButton;
        }
      }
      return components;
    },
  );

  return (
    <View style={[style.inputView, {borderColor: primaryColor, height: 40}]}>
      <ChatInputComponent />
      <ChatSendButtonComponent />
    </View>
  );
};

const style = StyleSheet.create({
  inputView: {
    width: '95%',
    flexDirection: 'row',
    marginHorizontal: 10,
    paddingVertical: 15,
  },
  chatInput: {
    flex: 1,
    width: '100%',
    backgroundColor: $config.PRIMARY_FONT_COLOR,
    color: $config.PRIMARY_FONT_COLOR,
  },
  chatInputButton: {
    width: 30,
    marginRight: 0,
    height: 30,
    borderRadius: 30,
    alignSelf: 'center',
    marginHorizontal: 10,
    backgroundColor: $config.PRIMARY_COLOR,
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
