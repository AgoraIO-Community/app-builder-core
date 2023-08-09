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
import {isMobileUA} from '../../utils/common';
import Avatar from '../../atoms/Avatar';

const waveHandEmoji = '👋';

export default function MeetingInfoGridTile() {
  const isMobile = isMobileUA();
  const copyInviteButton = isMobile ? 'COPY INVITE' : 'COPY INVITATION';
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
                  isMobile ? null : (
                    <Avatar
                      name={waveHandEmoji}
                      containerStyle={style.avatarContainerStyle}
                      textStyle={style.avatarTextStyle}
                    />
                  )
                }>
                <>
                  <View style={style.flexRow}>
                    {isMobile && (
                      <Text style={{marginRight: 5}}>{waveHandEmoji}</Text>
                    )}
                    <Text style={style.heading} numberOfLines={1}>
                      Welcome {username}
                    </Text>
                  </View>
                  {isMobile && <Spacer size={10} />}
                  <View style={{flexDirection: 'row'}}>
                    <Text style={[style.subheading, {flexShrink: 1}]}>
                      {isMobile
                        ? `No one else has joined yet, invite others ?`
                        : `No one else has joined yet`}
                    </Text>
                  </View>
                </>
              </MeetingInfoCardHeader>
              {isMobile ? <Spacer size={20} /> : <Spacer size={40} />}
              {!isMobile && (
                <MeetingInfoLinks variant="secondary" size="tiny" />
              )}
              <View style={{width: isMobile ? 200 : '100%'}}>
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
                  {...(isMobile && {iconName: 'share', iconSize: 20})}
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
  },
  inviteTile: {
    flex: 1,
    width: '100%',
    height: '100%',
    paddingHorizontal: isMobileUA() ? 0 : 35,
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
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
  avatarContainerStyle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: $config.VIDEO_AUDIO_TILE_AVATAR_COLOR,
  },
  avatarTextStyle: {
    fontSize: ThemeConfig.FontSize.large + 4,
    lineHeight: 12,
    fontWeight: '400',
    textAlignVertical: 'center',
  },
});
