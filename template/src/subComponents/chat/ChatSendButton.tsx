import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useChatConfigure} from '../../components/chat/chatConfigure';
import IconButton from '../../../src/atoms/IconButton';
import {useChatUIControls} from '../../components/chat-ui/useChatUIControls';
import {useRoomInfo} from 'customization-api';
import {ChatMessageType} from '../../components/chat-messages/useChatMessages';

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
  } = useChatUIControls();

  const {data} = useRoomInfo();
  const isValidMsg = message.length > 0;

  const onPress = () => {
    if (message.length === 0) return;
    const groupID = data.chat.group_id;

    const option = {
      chatType: selectedUserId ? 'singleChat' : 'groupChat',
      type: ChatMessageType.TXT,
      from: data.uid.toString(),
      to: selectedUserId ? selectedUserId.toString() : groupID,
      msg: message,
    };
    sendChatSDKMessage(option);
    setMessage && setMessage('');
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
          name: 'chat_send',
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
