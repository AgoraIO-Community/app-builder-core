import React from 'react';
import {View, StyleSheet, Text, ScrollView} from 'react-native';
import MeetingInfo from './MeetingInfo';
import MeetingInfoCardHeader from './MeetingInfoCardHeader';
import MeetingInfoLinks from './MeetingInfoLinks';
import ThemeConfig from '../../theme';
import Spacer from '../../atoms/Spacer';
import TertiaryButton from '../../atoms/TertiaryButton';
import {SHARE_LINK_CONTENT_TYPE, useShareLink} from '../useShareLink';
import ImageIcon from '../../atoms/ImageIcon';
import useGetName from '../../utils/useGetName';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';

export default function MeetingInfoGridTile() {
  const copyInviteButton = 'COPY INVITATION';
  const {copyShareLinkToClipboard} = useShareLink();
  const username = useGetName();

  return (
    <View style={style.root}>
      <ScrollView contentContainerStyle={style.scroll}>
        <View style={style.inviteContainerTile}>
          <View style={style.inviteTile}>
            <MeetingInfo padding="dense" margin="dense">
              <MeetingInfoCardHeader
                avatar={
                  <ImageIcon
                    iconType="plain"
                    name="person"
                    iconSize={56}
                    tintColor={'#099DFD'}
                  />
                }>
                <Text style={style.heading} numberOfLines={1}>
                  Welcome {username}
                </Text>
                <Text style={style.subheading} numberOfLines={1}>
                  No one else has joined yet
                </Text>
              </MeetingInfoCardHeader>
              <MeetingInfoLinks variant="secondary" size="tiny" />
              <View style={{flex: 1}}>
                <Spacer size={20} />
                <TertiaryButton
                  text={copyInviteButton}
                  containerStyle={{
                    width: '100%',
                    height: 48,
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: ThemeConfig.BorderRadius.medium,
                  }}
                  onPress={() => {
                    copyShareLinkToClipboard(
                      SHARE_LINK_CONTENT_TYPE.MEETING_INVITE,
                    );
                  }}
                />
              </View>
            </MeetingInfo>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const style = StyleSheet.create({
  root: {
    flex: 1,
    marginLeft: 30,
    flexShrink: 0,
  },
  scroll: {
    flexGrow: 1,
    padding: 4,
  },
  inviteContainerTile: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: $config.VIDEO_AUDIO_TILE_COLOR,
    borderRadius: ThemeConfig.BorderRadius.small,
    overflowY: 'auto',
  },
  inviteTile: {
    flex: 1,
    overflowY: 'auto',
  },
  heading: {
    fontSize: ThemeConfig.FontSize.tiny,
    fontWeight: '400',
    lineHeight: ThemeConfig.FontSize.normal,
    color: $config.FONT_COLOR + hexadecimalTransparency['70%'],
    fontFamily: ThemeConfig.FontFamily.sansPro,
    paddingVertical: 2,
  },
  subheading: {
    fontSize: ThemeConfig.FontSize.large,
    fontWeight: '600',
    lineHeight: ThemeConfig.FontSize.large,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    paddingVertical: 2,
  },
});
