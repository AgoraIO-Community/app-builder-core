import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
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
  return (
    <View style={styles.container}>
      <View style={styles.pinUserContainer}>
        <ImageIcon
          iconType="plain"
          name="pin-filled"
          iconSize={20}
          iconContainerStyle={styles.pinIcon}
          tintColor={$config.FONT_COLOR + hexadecimalTransparency['40%']}
        />
        <Text style={styles.pinnedUser}> Pinned By {msgPinnedUser}</Text>
      </View>

      {isAttachMsg ? (
        <></>
      ) : (
        <Text
          style={styles.messageText}
          numberOfLines={1}
          ellipsizeMode={'tail'}>
          {pinnedMsg[0].msg}
        </Text>
      )}
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
});
