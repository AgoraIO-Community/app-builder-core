import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useChatConfigure} from '../../components/chat/chatConfigure';
import IconButton from '../../../src/atoms/IconButton';
import {
  UploadStatus,
  useChatUIControls,
} from '../../components/chat-ui/useChatUIControls';
import {useRoomInfo} from 'customization-api';
import {ChatMessageType} from '../../components/chat-messages/useChatMessages';
import {useString} from '../../utils/useString';
import {chatSendMessageBtnText} from '../../language/default-labels/videoCallScreenLabels';
import {isMobileUA, isWeb} from '../../utils/common';

export interface ChatSendButtonProps {
  render?: (onPress: () => void) => JSX.Element;
}

const ChatSendButton = (props: ChatSendButtonProps) => {
  const {sendChatSDKMessage} = useChatConfigure();
  const {
    privateChatUser: selectedUserId,
    message,
    setMessage,
    inputActive,
    uploadStatus,
    uploadedFiles,
    setUploadedFiles,
  } = useChatUIControls();

  const {data} = useRoomInfo();
  const isValidMsg =
    message.length > 0 ||
    (uploadedFiles.length > 0 && uploadStatus === UploadStatus.SUCCESS);

  const onPress = () => {
    if (!isValidMsg) return;
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
      chatType: selectedUserId ? 'singleChat' : 'groupChat',
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
    setUploadedFiles && setUploadedFiles(prev => []);
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
