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
import {ChatEmojiPicker, ChatEmojiButton} from './chat/ChatEmoji';

import {
  ChatType,
  useChatUIControls,
} from '../components/chat-ui/useChatUIControls';
import {useContent, useRoomInfo, useUserName} from 'customization-api';
import ImageIcon from '../atoms/ImageIcon';
import ThemeConfig from '../theme';
import {BottomSheetTextInput} from '@gorhom/bottom-sheet';
import {
  groupChatInputPlaceHolderText,
  privateChatInputPlaceHolderText,
} from '../language/default-labels/videoCallScreenLabels';
import ChatSendButton from './chat/ChatSendButton';
import {ChatAttachmentButton} from './chat/ChatAttachment';
import {useChatConfigure} from '../components/chat/chatConfigure';
import {ChatMessageType} from '../components/chat/useSDKChatMessages';

export interface ChatSendButtonProps {
  render?: (onPress: () => void) => JSX.Element;
}
const ChatPanel = () => {
  return (
    <View style={style.chatPanelContainer}>
      <View style={style.chatPanel}>
        <ChatAttachmentButton />
        <ChatEmojiButton />
      </View>
      <ChatSendButton />
    </View>
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
  const {privateChatUser, message, setMessage, chatType, inputActive} =
    useChatUIControls();
 
  const {defaultContent} = useContent();
  const {sendChatSDKMessage, sendGroupChatSDKMessage} = useChatConfigure();
  const {data} = useRoomInfo();
  const [name] = useUserName();
  const groupChatInputPlaceHolder = useString(groupChatInputPlaceHolderText);
  const privateChatInputPlaceHolder = useString(
    privateChatInputPlaceHolderText,
  );

  const chatMessageInputPlaceholder =
    chatType === ChatType.Private
      ? privateChatInputPlaceHolder(defaultContent[privateChatUser]?.name)
      : groupChatInputPlaceHolder(name);
  const onChangeText = (text: string) => setMessage(text);
  const onSubmitEditing = () => {
    if (message.length === 0) return;
    const groupID = data.chat.group_id;
   
     const option = {
        chatType:  privateChatUser ? 'singleChat': 'groupChat',
        type: ChatMessageType.TXT,
        from: data.uid.toString(),
        to: privateChatUser ? privateChatUser.toString() : groupID,
        msg: message,
      };
      sendChatSDKMessage(option);
      setMessage('');
    
  };
  const {setInputActive} = useChatUIControls();

  return props?.render ? (
    props.render(
      message,
      onChangeText,
      onSubmitEditing,
      chatMessageInputPlaceholder,
    )
  ) : (

    <BottomSheetTextInput
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
        flex: 2,
        alignSelf: 'center',
        fontFamily: ThemeConfig.FontFamily.sansPro,
        fontWeight: '400',
        backgroundColor:"red"
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
export const ChatInput = () => {
  const {inputActive, showEmojiPicker} = useChatUIControls();
  return (
    <View
    style={[
      {flex: 1},
      showEmojiPicker
        ? {backgroundColor: 'transparent'}
        : {backgroundColor: $config.CARD_LAYER_1_COLOR},
      // inputActive ? style.inputActiveView : {},
    ]}>
    {showEmojiPicker && <ChatEmojiPicker />}
    <View style={style.inputView}>
      <ChatTextInput />
      <ChatPanel />
    </View>
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
  chatPanelContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
  },
  chatPanel: {
    flexDirection: 'row',
  },
});
export default ChatInput;
