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
import {View, TouchableOpacity, StyleSheet, Text} from 'react-native';
import ColorContext from '../components/ColorContext';
import TextInput from '../atoms/TextInput';
import {useString} from '../utils/useString';
import {useChatMessages} from '../components/chat-messages/useChatMessages';
import {isValidReactComponent, isWebInternal} from '../utils/common';
import {useCustomization} from 'customization-implementation';
import {
  ChatType,
  useChatUIControls,
} from '../components/chat-ui/useChatUIControls';
import {useContent, useRoomInfo, useUserName} from 'customization-api';
import ImageIcon from '../atoms/ImageIcon';
import ThemeConfig from '../theme';
import EmojiPicker from 'emoji-picker-react';
import {ChatEmojiPicker, ChatEmojiButton} from './chat/ChatEmoji';
import {
  ChatMessageType,
  useChatConfigure,
} from '../components/chat/chatConfigure';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import {ChatAttachmentButton} from './chat/ChatAttachment';
import ChatSendButton from './chat/ChatSendButton';

// export interface ChatSendButtonProps {
//   render?: (onPress: () => void) => JSX.Element;
// }

// export const ChatSendButton = (props: ChatSendButtonProps) => {
//   const {sendChatSDKMessage, sendGroupChatSDKMessage} = useChatConfigure();
//   const {
//     privateChatUser: selectedUserId,
//     message,
//     setMessage,
//     inputActive,
//   } = useChatUIControls();
//   const {sendChatMessage} = useChatMessages();
//   const onPress = () => {
//     if (!selectedUserId) {
//       // sendChatMessage(message);
//       sendGroupChatSDKMessage(message);
//       setMessage && setMessage('');
//     } else {
//       //  sendChatMessage(message, selectedUserId);
//       //send chatSDK peer msg
//       sendChatSDKMessage(selectedUserId, message);
//       setMessage && setMessage('');
//     }
//   };
//   return props?.render ? (
//     props.render(onPress)
//   ) : (
//     <TouchableOpacity style={[style.chatInputButton]} onPress={onPress}>
//       <ImageIcon
//         iconType="plain"
//         tintColor={
//           inputActive
//             ? $config.PRIMARY_ACTION_BRAND_COLOR
//             : $config.SEMANTIC_NEUTRAL
//         }
//         name={'chat_send'}
//       />
//     </TouchableOpacity>
//   );
// };

const ChatUploadStatus = () => {
  return (
    <View style={style.chatStatusContainer}>
      <Text style={style.chatStatusText}>{'Uploading... Please wait'}</Text>
    </View>
  );
};

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
  let chatInputRef = useRef(null);
  const {privateChatUser, message, setMessage, inputActive, chatType} =
    useChatUIControls();
  const {sendChatMessage} = useChatMessages();
  const {defaultContent} = useContent();
  const {sendChatSDKMessage, sendGroupChatSDKMessage} = useChatConfigure();

  const {data} = useRoomInfo();
  //commented for v1 release
  // const chatMessageInputPlaceholder = useString(
  //   'chatMessageInputPlaceholder',
  // )();
  const [name] = useUserName();

  // const chatMessageInputPlaceholder =
  //   chatType === ChatType.Private
  //     ? `Private Message to ${defaultContent[privateChatUser]?.name}`
  //     : `Chat publicly as ${name}...`;
  const chatMessageInputPlaceholder = 'Type Message Here';
  const onChangeText = (text: string) => setMessage(text);
  const onSubmitEditing = () => {
    if (message.length === 0) return;
    const groupID = data.chat.group_id;
    if (!privateChatUser) {
      // group msg
      const option = {
        chatType: 'groupChat',
        type: ChatMessageType.Txt,
        from: data.uid.toString(),
        to: groupID,
        msg: message,
      };
      //sendChatMessage(message);
      sendGroupChatSDKMessage(option);
      setMessage('');
    } else {
      //  sendChatMessage(message, privateChatUser);
      //send chatSDK peer msg
      const option = {
        chatType: 'singleChat',
        type: ChatMessageType.Txt,
        from: data.uid.toString(),
        to: privateChatUser.toString(),
        msg: message,
      };
      sendChatSDKMessage(option);
      setMessage('');
    }
  };

  // with multiline textinput enter prints /n
  const handleKeyPress = ({nativeEvent}) => {
    if (nativeEvent.key === 'Enter' && !nativeEvent.shiftKey) {
      onSubmitEditing();
      nativeEvent.preventDefault();
    }
  };
  const {setInputActive} = useChatUIControls();

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
      setRef={ref => (chatInputRef.current = ref)}
      onFocus={() => setInputActive(true)}
      onBlur={() => setInputActive(false)}
      value={message}
      multiline={true}
      onChangeText={onChangeText}
      style={{
        height: 48,
        maxHeight: 92,
        width: 318,
        borderRadius: 8,
        borderWidth: 1,
        color: $config.FONT_COLOR,
        textAlign: 'left',
        padding: 12,
        paddingRight: 0,
        fontSize: ThemeConfig.FontSize.small,
        lineHeight: 17,
        alignSelf: 'center',
        fontFamily: ThemeConfig.FontFamily.sansPro,
        fontWeight: '400',
        borderColor: $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['8%'],
        backgroundColor: $config.CARD_LAYER_2_COLOR,
      }}
      blurOnSubmit={false}
      onSubmitEditing={onSubmitEditing}
      placeholder={chatMessageInputPlaceholder}
      placeholderTextColor={$config.FONT_COLOR + hexadecimalTransparency['40%']}
      autoCorrect={false}
      onKeyPress={handleKeyPress}
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
    flexDirection: 'column',
    borderTopWidth: 1,
    borderTopColor: 'transparent',
    paddingHorizontal: 12,
  },
  chatInputButton: {
    flex: 0.1,
    borderBottomRightRadius: 12,
    alignSelf: 'center',
    marginRight: 16,
  },
  emojiPicker: {
    width: '100%',
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
  chatStatusContainer: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderColor: 'yellow',
  },
  chatStatusText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 12,
    lineHeight: 14.5,
    fontStyle: 'italic',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisOpacity.medium,
  },
});
export default ChatInput;
