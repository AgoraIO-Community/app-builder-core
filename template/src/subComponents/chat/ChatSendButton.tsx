import React from 'react';
import {StyleSheet} from 'react-native';
import {
  ChatMessageType,
  useChatConfigure,
} from '../../components/chat/chatConfigure';
import IconButton from '../../../src/atoms/IconButton';
import {useChatUIControls} from '../../components/chat-ui/useChatUIControls';
import {useChatMessages} from '../../components/chat-messages/useChatMessages';
import {useRoomInfo} from 'customization-api';

export interface ChatSendButtonProps {
  render?: (onPress: () => void) => JSX.Element;
}

const ChatSendButton = (props: ChatSendButtonProps) => {
  const {sendChatSDKMessage, sendGroupChatSDKMessage} = useChatConfigure();
  const {
    privateChatUser: selectedUserId,
    message,
    setMessage,
    inputActive,
  } = useChatUIControls();
  const {sendChatMessage} = useChatMessages();

  const {data} = useRoomInfo();

  const onPress = () => {
    if (message.length === 0) return;
    const groupID = data.chat.group_id;
    if (!selectedUserId) {
      // sendChatMessage(message); for native
      //  send group msg
      const option = {
        chatType: 'groupChat',
        type: ChatMessageType.Txt,
        from: data.uid.toString(),
        to: groupID,
        msg: message,
      };
      sendGroupChatSDKMessage(option);
      setMessage && setMessage('');
    } else {
      //  sendChatMessage(message, selectedUserId); for native
      //send  peer msg
      const option = {
        chatType: 'singleChat',
        type: ChatMessageType.Txt,
        from: data.uid.toString(),
        to: selectedUserId.toString(),
        msg: message,
      };
      sendChatSDKMessage(option);
      setMessage && setMessage('');
    }
  };
  return props?.render ? (
    props.render(onPress)
  ) : (
    <IconButton
      hoverEffect={true}
      hoverEffectStyle={{
        backgroundColor: $config.ICON_BG_COLOR,
        borderRadius: 24,
      }}
      iconProps={{
        iconType: 'plain',
        iconContainerStyle: {
          padding: 4,
        },
        iconSize: 24,
        name: 'chat_send',
        tintColor: inputActive
          ? $config.SECONDARY_ACTION_COLOR
          : $config.SEMANTIC_NEUTRAL,
      }}
      onPress={onPress}
    />
  );
};

const styles = StyleSheet.create({});

export default ChatSendButton;
