import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import ImageIcon from '../../../src/atoms/ImageIcon';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';
import ThemeConfig from '../../theme';
import {
  ChatMessageType,
  useChatMessages,
} from '../../../src/components/chat-messages/useChatMessages';
import {useContent, useLocalUid, UidType} from 'customization-api';
import {trimText} from '../../../src/utils/common';
import {formatAMPM} from '../../../src/utils';
import {useChatConfigure} from '../../components/chat/chatConfigure';

interface PinnedMessageProps {
  pinMsgId: string;
  pinnedByUser: UidType;
}

const PinnedMessage: React.FC<PinnedMessageProps> = ({
  pinMsgId,
  pinnedByUser,
}) => {
  const {messageStore} = useChatMessages();
  const localUid = useLocalUid();
  const {defaultContent} = useContent();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMoreIcon, setShowMoreIcon] = useState(false);
  const {unPinMessage} = useChatConfigure();

  const pinnedMsg = messageStore.filter(msg => msg.msgId === pinMsgId);
  if (pinnedMsg.length === 0) return null;
  const name =
    localUid === pinnedMsg[0]?.uid
      ? 'You'
      : trimText(defaultContent[pinnedMsg[0]?.uid]?.name);
  const msgPinnedUser =
    localUid === pinnedByUser
      ? 'You'
      : trimText(defaultContent[pinnedByUser]?.name);
  let time = formatAMPM(new Date(pinnedMsg[0]?.createdTimestamp));
  const isAttachMsg = pinnedMsg[0].type !== ChatMessageType.TXT;
  const fileExt = pinnedMsg[0].ext;
  const fileName = pinnedMsg[0].fileName;

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };
  const handleTextLayout = e => {
    let textHeight = e.nativeEvent.layout?.height;
    if (textHeight > 23) {
      setShowMoreIcon(true);
    } else {
      setShowMoreIcon(false);
    }
  };

  const handleMessageUnpin = () => {
    unPinMessage(pinMsgId);
  };

  return (
    <View
      style={[styles.container, {overflow: isExpanded ? 'scroll' : 'hidden'}]}>
      <View style={styles.pinUserContainer}>
        <Pressable onPress={handleMessageUnpin}>
          <ImageIcon
            iconType="plain"
            name="unpin-filled"
            iconSize={20}
            tintColor={$config.FONT_COLOR + hexadecimalTransparency['40%']}
          />
        </Pressable>
        <Text style={styles.pinnedUser}> Pinned By {msgPinnedUser}</Text>
      </View>

      <View style={styles.msgContainer}>
        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            alignItems: 'flex-start',
            width: '90%',
          }}>
          {isAttachMsg && (
            <ImageIcon
              base64={true}
              iconSize={20}
              iconType="plain"
              name={
                fileExt === 'pdf'
                  ? 'chat_attachment_pdf'
                  : fileExt === 'doc' || fileExt === 'docx'
                  ? 'chat_attachment_doc'
                  : pinnedMsg[0].type === ChatMessageType.IMAGE
                  ? 'chat_attachment_image'
                  : 'chat_attachment_unknown'
              }
              tintColor={$config.SEMANTIC_NEUTRAL}
            />
          )}
          {/* Hidden Text to Measure */}
          <Text
            style={[styles.messageText, {position: 'absolute', opacity: 0}]}
            numberOfLines={0}
            onLayout={handleTextLayout}>
            {isAttachMsg
              ? pinnedMsg[0].msg
                ? pinnedMsg[0].msg
                : fileName
              : pinnedMsg[0].msg}
          </Text>
          <Text
            style={styles.messageText}
            numberOfLines={isExpanded ? 0 : 1}
            ellipsizeMode={'tail'}>
            {isAttachMsg
              ? pinnedMsg[0].msg
                ? pinnedMsg[0].msg
                : fileName
              : pinnedMsg[0].msg}
          </Text>
        </View>

        {showMoreIcon && (
          <Pressable onPress={toggleExpanded}>
            <ImageIcon
              iconType="plain"
              name={isExpanded ? 'arrow-up' : 'arrow-down'}
              iconSize={20}
              tintColor={$config.SECONDARY_ACTION_COLOR}
            />
          </Pressable>
        )}
      </View>

      <Text style={styles.user}>
        {name} <Text style={styles.pinnedUser}>sent at {time}</Text>
      </Text>
    </View>
  );
};

export default PinnedMessage;

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    margin: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_1_COLOR,
    flexDirection: 'column',
    gap: 4,
    alignItems: 'flex-start',
    maxHeight: 120,
  },
  pinIcon: {
    transform: [{rotate: '-45deg'}],
  },
  pinnedUser: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 12,
    color: $config.FONT_COLOR + hexadecimalTransparency['40%'],
  },
  pinUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  user: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    color: $config.FONT_COLOR + hexadecimalTransparency['70%'],
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 12,
  },
  messageText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    color: $config.FONT_COLOR,
  },
  msgContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
});
