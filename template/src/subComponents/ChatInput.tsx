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
import React, {useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import TextInput from '../atoms/TextInput';
import {useString} from '../utils/useString';
import {isWeb, isWebInternal} from '../utils/common';
import {
  ChatType,
  UploadStatus,
  useChatUIControls,
  MIN_HEIGHT,
  MAX_HEIGHT,
  LINE_HEIGHT,
  MAX_TEXT_MESSAGE_SIZE,
} from '../components/chat-ui/useChatUIControls';
import {useContent, useRoomInfo, useUserName} from 'customization-api';
import ImageIcon from '../atoms/ImageIcon';
import ThemeConfig from '../theme';
import {ChatEmojiPicker, ChatEmojiButton} from './chat/ChatEmoji';
import {useChatConfigure} from '../components/chat/chatConfigure';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import {ChatAttachmentButton} from './chat/ChatAttachment';
import ChatSendButton from './chat/ChatSendButton';
import {
  ChatMessageType,
  SDKChatType,
} from '../components/chat-messages/useChatMessages';
import {
  groupChatLiveInputPlaceHolderText,
  groupChatMeetingInputPlaceHolderText,
  privateChatInputPlaceHolderText,
  chatSendErrorTextSizeToastHeading,
  chatSendErrorTextSizeToastSubHeading,
} from '../language/default-labels/videoCallScreenLabels';
import ChatUploadStatus from './chat/ChatUploadStatus';
import {AttachmentBubble} from './ChatBubble';
import IconButton from '../atoms/IconButton';
import Toast from '../../react-native-toast-message';

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
  const {
    privateChatUser,
    message,
    setMessage,
    inputActive,
    setInputActive,
    chatType,
    uploadStatus,
    uploadedFiles,
    setUploadedFiles,
    inputHeight,
    setInputHeight,
  } = useChatUIControls();
  const {defaultContent} = useContent();
  const {sendChatSDKMessage, uploadAttachment} = useChatConfigure();

  React.useEffect(() => {
    if (message.length === 0) {
      setInputHeight(MIN_HEIGHT);
    }
  }, [message]);

  useEffect(() => {
    setTimeout(() => {
      if (isWebInternal()) {
        chatInputRef?.current?.focus();
      }
    });
  }, []);

  const {data} = useRoomInfo();
  const [name] = useUserName();
  const toastHeadingSize = useString(chatSendErrorTextSizeToastHeading)();
  const errorSubHeadingSize = useString(chatSendErrorTextSizeToastSubHeading);

  const isUploadStatusShown =
    uploadStatus === UploadStatus.IN_PROGRESS ||
    uploadStatus === UploadStatus.FAILURE;

  const groupChatInputPlaceHolder = $config.EVENT_MODE
    ? useString(groupChatLiveInputPlaceHolderText)
    : useString(groupChatMeetingInputPlaceHolderText);
  const privateChatInputPlaceHolder = useString(
    privateChatInputPlaceHolderText,
  );

  const chatMessageInputPlaceholder =
    chatType === ChatType.Private
      ? privateChatInputPlaceHolder(defaultContent[privateChatUser]?.name)
      : groupChatInputPlaceHolder(name);

  const onChangeText = (text: string) => {
    setMessage(text);
  };
  const onSubmitEditing = () => {
    if (message.length === 0) return;
    const groupID = data.chat.group_id;

    if (message.length >= MAX_TEXT_MESSAGE_SIZE * 1024) {
      Toast.show({
        leadingIconName: 'alert',
        type: 'error',
        text1: toastHeadingSize,
        text2: errorSubHeadingSize(MAX_TEXT_MESSAGE_SIZE.toString()),
        visibilityTime: 3000,
        primaryBtn: null,
        secondaryBtn: null,
      });
      return;
    }

    const option = {
      chatType: privateChatUser
        ? SDKChatType.SINGLE_CHAT
        : SDKChatType.GROUP_CHAT,
      type: ChatMessageType.TXT,
      from: data.uid.toString(),
      to: privateChatUser ? privateChatUser.toString() : groupID,
      msg: message,
    };
    sendChatSDKMessage(option);
    setInputHeight(MIN_HEIGHT);
    setMessage('');
  };

  // with multiline textinput enter prints /n
  const handleKeyPress = ({nativeEvent}) => {
    if (nativeEvent.key === 'Enter' && !nativeEvent.shiftKey) {
      onSubmitEditing();
      nativeEvent.preventDefault();
    }
  };

  const handleContentSizeChange = e => {
    const contentHeight = e.nativeEvent.contentSize.height;
    const lines = Math.floor((contentHeight - 24) / LINE_HEIGHT);
    const newHeight = lines < 5 ? LINE_HEIGHT * lines + 24 + 2 : MAX_HEIGHT; // Assuming lineHeight is LINE_HEIGHT
    setInputHeight(newHeight);
  };

  const handleUploadRetry = () => {
    uploadAttachment(uploadedFiles[0]);
  };

  return props?.render ? (
    props.render(
      message,
      onChangeText,
      onSubmitEditing,
      chatMessageInputPlaceholder,
    )
  ) : (
    <>
      {uploadedFiles.length > 0 ? (
        <View
          style={[
            style.attachmentContainer,
            isUploadStatusShown
              ? {
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  borderTopWidth: 0,
                }
              : {borderRadius: 8, borderTopWidth: 1},
          ]}>
          {uploadedFiles.map((file, index) => (
            <AttachmentBubble
              key={index}
              fileName={file.file_name}
              fileExt={file.file_ext}
              isFullWidth={true}
              fileType={file.file_type}
              secondaryComponent={
                uploadStatus === UploadStatus.IN_PROGRESS ? (
                  <ActivityIndicator />
                ) : uploadStatus === UploadStatus.FAILURE ? (
                  <TouchableOpacity onPress={handleUploadRetry}>
                    <Text style={style.btnRetry}>{'Retry'}</Text>
                  </TouchableOpacity>
                ) : uploadStatus === UploadStatus.SUCCESS ? (
                  <View>
                    <IconButton
                      hoverEffect={true}
                      hoverEffectStyle={{
                        backgroundColor:
                          $config.CARD_LAYER_5_COLOR +
                          hexadecimalTransparency['20%'],
                        borderRadius: 20,
                      }}
                      iconProps={{
                        iconType: 'plain',
                        iconSize: 20,
                        iconContainerStyle: {
                          padding: 2,
                        },
                        name: 'close',
                        tintColor: $config.SECONDARY_ACTION_COLOR,
                      }}
                      onPress={() => {
                        setUploadedFiles(prev => []);
                      }}
                    />
                  </View>
                ) : null
              }
            />
          ))}
        </View>
      ) : (
        <TextInput
          setRef={ref => (chatInputRef.current = ref)}
          onFocus={() => setInputActive(true)}
          onBlur={() => setInputActive(false)}
          value={message}
          multiline={true}
          onChangeText={onChangeText}
          textAlignVertical="top"
          scrollEnabled={true}
          style={{
            color: $config.FONT_COLOR,
            textAlign: 'left',
            width: '100%',
            alignSelf: 'center',
            fontFamily: ThemeConfig.FontFamily.sansPro,
            fontWeight: '400',
            height: inputHeight,
            padding: 12,
            fontSize: ThemeConfig.FontSize.small,
            lineHeight: LINE_HEIGHT,
            borderWidth: 1,
            borderColor:
              $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['40%'],
            backgroundColor: $config.CARD_LAYER_2_COLOR,
            borderRadius: 8,
            borderTopRightRadius: isUploadStatusShown ? 0 : 8,
            borderTopLeftRadius: isUploadStatusShown ? 0 : 8,
            maxHeight: MAX_HEIGHT,
          }}
          blurOnSubmit={false}
          onSubmitEditing={onSubmitEditing}
          placeholder={chatMessageInputPlaceholder}
          placeholderTextColor={
            $config.FONT_COLOR + hexadecimalTransparency['40%']
          }
          autoCorrect={false}
          onKeyPress={handleKeyPress}
          onContentSizeChange={handleContentSizeChange}
        />
      )}
    </>
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
        <ChatUploadStatus />
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
  attachmentContainer: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 40,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['40%'],
    borderRadius: 8,
  },
  inputView: {
    flex: 1,
    flexDirection: 'column',
    borderTopWidth: 1,
    borderTopColor: 'transparent',
    paddingHorizontal: 12,
    paddingBottom: 8,
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
    paddingTop: 4,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
  },
  chatPanel: {
    flexDirection: 'row',
  },
  btnRetry: {
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 12,
    fontWeight: '600',
  },
});
export default ChatInput;
