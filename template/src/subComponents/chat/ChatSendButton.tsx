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
  } = useChatUIControls();

  const {data} = useRoomInfo();
  const isValidMsg =
    message.length > 0 ||
    (uploadedFiles.length > 0 && uploadStatus === UploadStatus.SUCCESS);
  const toastHeadingSize = useString(chatSendErrorTextSizeToastHeading)();
  const errorSubHeadingSize = useString(chatSendErrorTextSizeToastSubHeading);

  const onPress = () => {
    if (!isValidMsg) return;
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
    const groupID = data.chat.group_id;
    const msgType =
      uploadedFiles.length > 0
        ? uploadedFiles[0].file_type
        : ChatMessageType.TXT;

    const {
      file_ext = '',
      file_length = 0,
      file_name = '',
      file_url = '',
    } = uploadedFiles[0] || {};

    const option = {
      chatType: selectedUserId
        ? SDKChatType.SINGLE_CHAT
        : SDKChatType.GROUP_CHAT,
      type: msgType as ChatMessageType,
      msg: msgType === ChatMessageType.TXT ? message : '', // currenlt not supporting combinarion msg (file+txt)
      from: data.uid.toString(),
      to: selectedUserId ? selectedUserId.toString() : groupID,
      ext: {
        file_length,
        file_ext,
        file_url,
        file_name,
        from_platform: isWeb() ? 'web' : 'native',
      },
    };
    sendChatSDKMessage(option);
    setMessage && setMessage('');
    setInputHeight && setInputHeight(MIN_HEIGHT);
    setUploadedFiles && setUploadedFiles(prev => []);
    isWeb() && setShowEmojiPicker(false);
  };
  return props?.render ? (
    props.render(onPress)
  ) : (
    <View style={styles.containerBtn}>
      <IconButton
        hoverEffect={true}
        hoverEffectStyle={{
          backgroundColor: $config.ICON_BG_COLOR,
          borderRadius: 24,
        }}
        toolTipMessage={
          isMobileUA() ? null : useString(chatSendMessageBtnText)()
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
