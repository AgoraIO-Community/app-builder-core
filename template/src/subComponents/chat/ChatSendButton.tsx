import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useChatConfigure} from '../../components/chat/chatConfigure';
import IconButton from '../../../src/atoms/IconButton';
import {
  MIN_HEIGHT,
  UploadStatus,
  useChatUIControls,
  MAX_TEXT_MESSAGE_SIZE,
  ChatType,
} from '../../components/chat-ui/useChatUIControls';
import {useRoomInfo} from 'customization-api';
import {
  ChatMessageType,
  SDKChatType,
  useChatMessages,
} from '../../components/chat-messages/useChatMessages';
import {useString} from '../../utils/useString';
import {
  chatSendMessageBtnText,
  chatSendErrorTextSizeToastHeading,
  chatSendErrorTextSizeToastSubHeading,
} from '../../language/default-labels/videoCallScreenLabels';
import {isMobileUA, isWeb} from '../../utils/common';
import Toast from '../../../react-native-toast-message';
import {ChatMessageChatType} from 'react-native-agora-chat';

export interface ChatSendButtonProps {
  render?: (onPress: () => void) => JSX.Element;
}

export const handleChatSend = ({
  sendChatSDKMessage,
  selectedUserId,
  currentGroupChatId,
  chatType,
  message,
  setMessage,
  inputActive,
  uploadStatus,
  uploadedFiles,
  setUploadedFiles,
  setInputHeight,
  data,
  setShowEmojiPicker,
  toastHeadingSize,
  errorSubHeadingSize,
  _resetTextareaHeight,
  replyToMsgId,
  setReplyToMsgId,
  addMessageToStore,
  addMessageToPrivateStore,
  addMessageToBreakoutStore,
}) => {
  const isAllFilesUploaded =
    uploadedFiles.length > 0 &&
    uploadedFiles.every(file => file.upload_status === UploadStatus.SUCCESS);

  const isValidMsg = message.length > 0 || isAllFilesUploaded;

  const groupID = data.chat.group_id;

  if (!isValidMsg) return;
  _resetTextareaHeight();
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

  // Text message sent update sender side ui
  const sendTextMessage = () => {
    let chatSDKType, toId;

    if (chatType === ChatType.BreakoutGroupChat && currentGroupChatId) {
      // Breakout room message
      chatSDKType = SDKChatType.GROUP_CHAT;
      toId = currentGroupChatId;
    } else if (selectedUserId) {
      // Private message
      chatSDKType = SDKChatType.SINGLE_CHAT;
      toId = selectedUserId.toString();
    } else {
      // Group message
      chatSDKType = SDKChatType.GROUP_CHAT;
      toId = groupID;
    }

    const option = {
      chatType: chatSDKType,
      type: ChatMessageType.TXT,
      msg: message,
      from: data.uid.toString(),
      to: toId,
      ext: {
        from_platform: isWeb() ? 'web' : 'native',
        replyToMsgId: replyToMsgId,
      },
    };
    console.log('supriya-chatdetails option', option);
    const onProgress = (localMsgId: string, progress: number) => {
      console.warn('chat msg in progress', progress);
    };
    const onError = (localMsgId: string, error: any) => {
      console.warn('chat msg in error', error);
    };
    const onSuccess = (message: any) => {
      console.warn('chat msg in success', message);
      // Text message added here , attachments are added in ChatAttachment.native
      const messageData = {
        msg: option.msg.replace(/^(\n)+|(\n)+$/g, ''),
        createdTimestamp: message.localTime,
        msgId: message.msgId,
        isDeleted: false,
        type: message.body.type,
        replyToMsgId: message.attributes?.replyToMsgId,
      };
      console.warn('message data', messageData);
      // this is local user messages ui view
      if (chatType === ChatType.BreakoutGroupChat && currentGroupChatId) {
        addMessageToBreakoutStore(Number(message.from), messageData);
      } else if (message.chatType === ChatMessageChatType.PeerChat) {
        addMessageToPrivateStore(Number(message.to), messageData, true);
      } else {
        addMessageToStore(Number(message.from), messageData);
      }
    };
    sendChatSDKMessage(option, {onProgress, onError, onSuccess});
  };

  if (uploadedFiles.length > 0) {
    uploadedFiles.forEach(file => {
      // send all the attachment one by one
      const msgType = file.file_type;
      const {
        file_ext = '',
        file_length = 0,
        file_name = '',
        file_url = '',
      } = file;

      let fileChatSDKType, fileToId;

      if (chatType === ChatType.BreakoutGroupChat && currentGroupChatId) {
        // Breakout room file
        fileChatSDKType = SDKChatType.GROUP_CHAT;
        fileToId = currentGroupChatId;
      } else if (selectedUserId) {
        // Private file
        fileChatSDKType = SDKChatType.SINGLE_CHAT;
        fileToId = selectedUserId.toString();
      } else {
        // Group file
        fileChatSDKType = SDKChatType.GROUP_CHAT;
        fileToId = groupID;
      }

      const option = {
        chatType: fileChatSDKType,
        type: msgType as ChatMessageType,
        from: data.uid.toString(),
        to: fileToId,
        ext: {
          file_length,
          file_ext,
          file_url,
          file_name,
          from_platform: isWeb() ? 'web' : 'native',
          msg: uploadedFiles.length === 1 ? message : '',
          replyToMsgId: replyToMsgId,
        },
      };
      sendChatSDKMessage(option);
    });
    if (message && uploadedFiles.length > 1) {
      // separate msg when there are more attachments
      sendTextMessage();
    }
  } else {
    // send Text Message
    sendTextMessage();
  }

  setMessage && setMessage('');
  setReplyToMsgId('');
  setInputHeight && setInputHeight(MIN_HEIGHT);
  setUploadedFiles && setUploadedFiles(prev => []);
  isWeb() && setShowEmojiPicker(false);
};

const ChatSendButton = (props: ChatSendButtonProps) => {
  const {sendChatSDKMessage} = useChatConfigure();
  const {setShowEmojiPicker} = useChatUIControls();
  const {addMessageToPrivateStore, addMessageToStore, addMessageToBreakoutStore} = useChatMessages();
  const {
    privateChatUser: selectedUserId,
    currentGroupChatId,
    chatType,
    message,
    setMessage,
    inputActive,
    uploadStatus,
    uploadedFiles,
    setUploadedFiles,
    setInputHeight,
    _resetTextareaHeight,
    replyToMsgId,
    setReplyToMsgId,
  } = useChatUIControls();

  const {data} = useRoomInfo();
  const isAllFilesUploaded =
    uploadedFiles.length > 0 &&
    uploadedFiles.every(file => file.upload_status === UploadStatus.SUCCESS);

  const isValidMsg = message.length > 0 || isAllFilesUploaded;
  const toastHeadingSize = useString(chatSendErrorTextSizeToastHeading)();
  const errorSubHeadingSize = useString(chatSendErrorTextSizeToastSubHeading);
  const groupID = data.chat.group_id;
  const sendMessageBtnText = useString(chatSendMessageBtnText)();

  const onPress = () =>
    handleChatSend({
      sendChatSDKMessage,
      selectedUserId,
      currentGroupChatId,
      chatType,
      message,
      setMessage,
      inputActive,
      uploadStatus,
      uploadedFiles,
      setUploadedFiles,
      setInputHeight,
      data,
      setShowEmojiPicker,
      toastHeadingSize,
      errorSubHeadingSize,
      _resetTextareaHeight,
      replyToMsgId,
      setReplyToMsgId,
      addMessageToPrivateStore,
      addMessageToStore,
      addMessageToBreakoutStore,
    });

  return props?.render ? (
    props.render(onPress)
  ) : (
    <View style={styles.containerBtn}>
      <IconButton
        hoverEffect={true}
        hoverEffectStyle={
          isValidMsg
            ? {
                backgroundColor: $config.ICON_BG_COLOR,
                borderRadius: 24,
              }
            : {}
        }
        disabled={!isValidMsg}
        toolTipMessage={isMobileUA() || !isValidMsg ? null : sendMessageBtnText}
        iconProps={{
          iconType: 'plain',
          iconContainerStyle: {
            backgroundColor: isValidMsg
              ? $config.PRIMARY_ACTION_BRAND_COLOR
              : 'transparent',
            borderRadius: 30,
            paddingVertical: 2,
            paddingLeft: 8,
            paddingRight: 4,
          },
          iconSize: 24,
          name: isValidMsg ? 'chat_send_fill' : 'chat_send',
          tintColor: isValidMsg
            ? $config.SECONDARY_ACTION_COLOR
            : $config.SEMANTIC_NEUTRAL,
        }}
        onPress={onPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  containerBtn: {
    padding: 2,
  },
});

export default ChatSendButton;
