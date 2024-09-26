import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useChatConfigure} from '../../components/chat/chatConfigure';
import IconButton from '../../../src/atoms/IconButton';
import {
  MIN_HEIGHT,
  UploadStatus,
  useChatUIControls,
  MAX_TEXT_MESSAGE_SIZE,
} from '../../components/chat-ui/useChatUIControls';
import {useRoomInfo} from 'customization-api';
import {
  ChatMessageType,
  SDKChatType,
} from '../../components/chat-messages/useChatMessages';
import {useString} from '../../utils/useString';
import {
  chatSendMessageBtnText,
  chatSendErrorTextSizeToastHeading,
  chatSendErrorTextSizeToastSubHeading,
} from '../../language/default-labels/videoCallScreenLabels';
import {isMobileUA, isWeb} from '../../utils/common';
import Toast from '../../../react-native-toast-message';

export interface ChatSendButtonProps {
  render?: (onPress: () => void) => JSX.Element;
}

export const handleChatSend = ({
  sendChatSDKMessage,
  selectedUserId,
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

  const sendTextMessage = () => {
    const option = {
      chatType: selectedUserId
        ? SDKChatType.SINGLE_CHAT
        : SDKChatType.GROUP_CHAT,
      type: ChatMessageType.TXT,
      msg: message,
      from: data.uid.toString(),
      to: selectedUserId ? selectedUserId.toString() : groupID,
      ext: {
        from_platform: isWeb() ? 'web' : 'native',
      },
    };
    sendChatSDKMessage(option);
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

      const option = {
        chatType: selectedUserId
          ? SDKChatType.SINGLE_CHAT
          : SDKChatType.GROUP_CHAT,
        type: msgType as ChatMessageType,
        from: data.uid.toString(),
        to: selectedUserId ? selectedUserId.toString() : groupID,
        ext: {
          file_length,
          file_ext,
          file_url,
          file_name,
          from_platform: isWeb() ? 'web' : 'native',
          msg: uploadedFiles.length === 1 ? message : '',
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
  setInputHeight && setInputHeight(MIN_HEIGHT);
  setUploadedFiles && setUploadedFiles(prev => []);
  isWeb() && setShowEmojiPicker(false);
};

const ChatSendButton = (props: ChatSendButtonProps) => {
  const {sendChatSDKMessage} = useChatConfigure();
  const {setShowEmojiPicker} = useChatUIControls();
  const {
    privateChatUser: selectedUserId,
    message,
    setMessage,
    inputActive,
    uploadStatus,
    uploadedFiles,
    setUploadedFiles,
    setInputHeight,
    _resetTextareaHeight,
  } = useChatUIControls();

  const {data} = useRoomInfo();
  const isAllFilesUploaded =
    uploadedFiles.length > 0 &&
    uploadedFiles.every(file => file.upload_status === UploadStatus.SUCCESS);

  const isValidMsg = message.length > 0 || isAllFilesUploaded;
  const toastHeadingSize = useString(chatSendErrorTextSizeToastHeading)();
  const errorSubHeadingSize = useString(chatSendErrorTextSizeToastSubHeading);
  const groupID = data.chat.group_id;

  const onPress = () =>
    handleChatSend({
      sendChatSDKMessage,
      selectedUserId,
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
        toolTipMessage={
          isMobileUA() || !isValidMsg
            ? null
            : useString(chatSendMessageBtnText)()
        }
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
