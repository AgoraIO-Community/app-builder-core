import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import ImageIcon from '../../atoms/ImageIcon';
import ThemeConfig from '../../theme';
import {AnnouncementMessage} from '../../components/chat-messages/useChatMessages';

export default function ChatAnnouncementView({
  message,
  announcement,
}: {
  message: string;
  announcement: AnnouncementMessage;
}) {
  return (
    <View style={style.announcementView}>
      <ImageIcon
        iconSize={20}
        iconType="plain"
        name="announcement"
        tintColor={'#099DFD'}
      />
      <View style={style.announcementMessage}>
        <Text style={style.announcementMessageHeader}>
          Message from host: {announcement.sender}
        </Text>
        <Text style={style.announcementMessageBody}>{message}</Text>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  announcementView: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginRight: 12,
    marginLeft: 12,
    marginBottom: 4,
    marginTop: 16,
    gap: 6,
  },
  announcementMessage: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  announcementMessageHeader: {
    fontSize: ThemeConfig.FontSize.tiny,
    fontStyle: 'normal',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    color: '#099DFD',
    fontWeight: '700',
    lineHeight: 14,
  },
  announcementMessageBody: {
    fontSize: ThemeConfig.FontSize.tiny,
    fontStyle: 'italic',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    color: '#099DFD',
    fontWeight: '400',
    lineHeight: 14,
  },
});
