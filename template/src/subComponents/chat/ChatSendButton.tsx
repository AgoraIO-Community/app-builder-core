import React from 'react';
import {StyleSheet,View} from 'react-native';
import {useChatConfigure} from '../../components/chat/chatConfigure';
import IconButton from '../../../src/atoms/IconButton';
import {useChatUIControls} from '../../components/chat-ui/useChatUIControls';
import {useRoomInfo} from 'customization-api';
import {ChatMessageType} from '../../components/chat/useSDKChatMessages';


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

  const onPress = () => {
    if (message.length === 0) return;
    const groupID = data.chat.group_id;

    const option = {
      chatType: selectedUserId ? 'singleChat' :'groupChat',
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
   <View>
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
    </View>
  
  );
};

const styles = StyleSheet.create({});

export default ChatSendButton;
