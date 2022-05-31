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
import useSendMessage, {MESSAGE_TYPE} from '../utils/useSendMessage';
import {isValidReactComponent} from '../utils/common';
import {useFpe} from 'fpe-api';
import {useChatUIControl} from '../components/chat-ui/useChatUIControl';

export const ChatSendButton = () => {
  const {
    selectedChatUserId: selectedUserId,
    message,
    setMessage,
  } = useChatUIControl();
  const sendMessage = useSendMessage();
  return (
    <TouchableOpacity
      style={style.chatInputButton}
      onPress={() => {
        if (!selectedUserId) {
          sendMessage(MESSAGE_TYPE.group, message);
          setMessage && setMessage('');
        } else {
          sendMessage(MESSAGE_TYPE.private, message, selectedUserId);
          setMessage && setMessage('');
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
  );
};

const ChatTextInput = () => {
  const {
    selectedChatUserId: selectedUserId,
    message,
    setMessage,
  } = useChatUIControl();
  const sendMessage = useSendMessage();
  const chatMessageInputPlaceholder = useString(
    'chatMessageInputPlaceholder',
  )();
  return (
    <TextInput
      value={message}
      onChangeText={(text) => setMessage(text)}
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
      onSubmitEditing={() => {
        if (!selectedUserId) {
          sendMessage(MESSAGE_TYPE.group, message);
          setMessage('');
        } else {
          sendMessage(MESSAGE_TYPE.private, message, selectedUserId);
          setMessage('');
        }
      }}
      placeholder={chatMessageInputPlaceholder}
      placeholderTextColor={$config.PRIMARY_FONT_COLOR}
      autoCorrect={false}
    />
  );
};

/**
 * Input component for the Chat interface
 */
const ChatInput = () => {
  const {primaryColor} = useContext(ColorContext);
  const {ChatInputComponent, ChatAfterView, ChatBeforeView} = useFpe((data) => {
    let components: {
      ChatInputComponent: React.ComponentType;
      ChatBeforeView: React.ComponentType;
      ChatAfterView: React.ComponentType;
    } = {
      ChatInputComponent: ChatTextInput,
      ChatAfterView: React.Fragment,
      ChatBeforeView: React.Fragment,
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
          data?.components?.videoCall?.chat?.chatInput &&
          typeof data?.components?.videoCall?.chat?.chatInput === 'object'
        ) {
          if (
            data?.components?.videoCall?.chat?.chatInput?.after &&
            isValidReactComponent(
              data?.components?.videoCall?.chat?.chatInput?.after,
            )
          ) {
            components.ChatAfterView =
              data?.components?.videoCall?.chat?.chatInput?.after;
          }
          if (
            data?.components?.videoCall?.chat?.chatInput?.before &&
            isValidReactComponent(
              data?.components?.videoCall?.chat?.chatInput?.before,
            )
          ) {
            components.ChatBeforeView =
              data?.components?.videoCall?.chat?.chatInput?.before;
          }
        }
      }
    }
    return components;
  });

  return (
    <View style={[style.inputView, {borderColor: primaryColor, height: 40}]}>
      <>
        <ChatBeforeView />
        <ChatInputComponent />
        <ChatAfterView />
      </>
      <ChatSendButton />
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
