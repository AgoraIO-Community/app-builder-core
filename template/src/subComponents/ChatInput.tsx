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
import React, {useContext, useEffect, useRef} from 'react';
import {View, TouchableOpacity, StyleSheet, Image} from 'react-native';
import ColorContext from '../components/ColorContext';
import TextInput from '../atoms/TextInput';
import {useString} from '../utils/useString';
import {useChatMessages} from '../components/chat-messages/useChatMessages';
import {isValidReactComponent, isWebInternal} from '../utils/common';
import {useCustomization} from 'customization-implementation';
import {useChatUIControl} from '../components/chat-ui/useChatUIControl';
import {useRender, useUserName} from 'customization-api';
import ImageIcon from '../atoms/ImageIcon';
import ThemeConfig from '../theme';

export interface ChatSendButtonProps {
  render?: (onPress: () => void) => JSX.Element;
}

export const ChatSendButton = (props: ChatSendButtonProps) => {
  const {
    selectedChatUserId: selectedUserId,
    message,
    setMessage,
    inputActive,
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
    <TouchableOpacity style={[style.chatInputButton]} onPress={onPress}>
      <ImageIcon
        iconType="plain"
        tintColor={
          inputActive
            ? $config.PRIMARY_ACTION_BRAND_COLOR
            : $config.SEMANTIC_NEUTRAL
        }
        name={'send'}
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
  let chatInputRef = useRef(null);
  const {
    selectedChatUserId: selectedUserId,
    message,
    setMessage,
    inputActive,
    privateActive,
  } = useChatUIControl();
  const {sendChatMessage} = useChatMessages();
  const {renderList} = useRender();
  //commented for v1 release
  // const chatMessageInputPlaceholder = useString(
  //   'chatMessageInputPlaceholder',
  // )();
  const [name] = useUserName();
  const chatMessageInputPlaceholder = privateActive
    ? `Private Message to ${renderList[selectedUserId].name}`
    : `Chat publicly as ${name}...`;
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
  const {setInputActive} = useChatUIControl();

  useEffect(() => {
    setTimeout(() => {
      if (isWebInternal()) {
        chatInputRef?.current?.focus();
      }
    });
  }, []);

  return props?.render ? (
    props.render(
      message,
      onChangeText,
      onSubmitEditing,
      chatMessageInputPlaceholder,
    )
  ) : (
    <TextInput
      setRef={(ref) => (chatInputRef.current = ref)}
      onFocus={() => setInputActive(true)}
      onBlur={() => setInputActive(false)}
      value={message}
      onChangeText={onChangeText}
      style={{
        minHeight: 56,
        borderRadius: 0,
        borderBottomLeftRadius: 12,
        borderWidth: 0,
        color: $config.FONT_COLOR,
        textAlign: 'left',
        paddingVertical: 21,
        paddingLeft: 20,
        flex: 1,
        alignSelf: 'center',
        fontFamily: ThemeConfig.FontFamily.sansPro,
        fontWeight: '400',
      }}
      blurOnSubmit={false}
      onSubmitEditing={onSubmitEditing}
      placeholder={chatMessageInputPlaceholder}
      placeholderTextColor={
        $config.FONT_COLOR + ThemeConfig.EmphasisPlus.disabled
      }
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

  const {inputActive} = useChatUIControl();

  return (
    <View style={[style.inputView, inputActive ? style.inputActiveView : {}]}>
      <ChatInputComponent />
      <ChatSendButtonComponent />
    </View>
  );
};

const style = StyleSheet.create({
  inputActiveView: {
    borderTopWidth: 1,
    borderTopColor: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
  inputView: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  chatInputButton: {
    flex: 0.1,
    borderBottomRightRadius: 12,
    alignSelf: 'center',
    marginRight: 16,
  },
});
export default ChatInput;
