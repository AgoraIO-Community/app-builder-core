import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import ImageIcon from '../../../atoms/ImageIcon';
import {IconsInterface} from '../../../atoms/CustomIcon';
import hexadecimalTransparency from '../../../utils/hexadecimalTransparency';
import MeetingLink from '../../../atoms/MeetingLink';
import {
  SHARE_LINK_CONTENT_TYPE,
  useShareLink,
} from '../../../components/useShareLink';
import {isMobileUA, useIsDesktop} from '../../../utils/common';
import TertiaryButton from '../../../atoms/TertiaryButton';
import ThemeConfig from '../../../theme';

interface Feature {
  id: number;
  icon: keyof IconsInterface;
  tint: string;
  title: string;
  description: string;
}
const features: Feature[] = [
  {
    id: 1,
    icon: 'raise-hand',
    tint: $config.SEMANTIC_WARNING,
    title: 'Raise Your hand',
    description: `Let everyone know that you've something to say`,
  },
  {
    id: 2,
    icon: 'chat-filled',
    title: 'Chat with others',
    tint: $config.SEMANTIC_SUCCESS,
    description: `Message fellow attendees or the hosts`,
  },
  {
    id: 3,
    icon: 'screen-share',
    title: 'Present Your screen',
    tint: $config.PRIMARY_ACTION_BRAND_COLOR,
    description: `Be a presenter post the host’s approval`,
  },
  {
    id: 4,
    icon: 'celebration',
    title: 'Join in activities',
    tint: $config.SEMANTIC_ERROR,
    description: `Jam with everyone on a whiteboard`,
  },
];
function FeatureTile({feature}: {feature: Feature}) {
  const isDesktop = useIsDesktop();
  const isMobile = isMobileUA();
  return (
    <View
      style={[
        style.card,
        isDesktop() && !isMobile ? style.cardWeb : style.cardMobile,
      ]}>
      <View style={style.cardHeader}>
        <View style={style.cardHeaderAvatar}>
          <View style={style.cardHeaderAvatarIcon}>
            <ImageIcon
              iconSize={24}
              iconType="plain"
              name={feature.icon}
              tintColor={feature.tint}
            />
          </View>
        </View>
        <View style={style.cardHeaderContent}>
          <View>
            <Text style={style.cardTitle}>{feature.title}</Text>
          </View>
          <View style={{flexShrink: 1, paddingTop: 2}}>
            <Text style={style.cardDesc}>{feature.description}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function LiveStreamAttendeeLandingTile() {
  const isMobile = isMobileUA();
  const {copyShareLinkToClipboard, getShareLink} = useShareLink();

  return (
    <View style={style.tileBackdrop}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={style.tileContainer}>
          <View style={style.tile}>
            <View style={[style.tileSection, style.tileheader]}>
              <Text style={style.tileHeading}>
                Waiting for the host to join
              </Text>
            </View>
            <View style={[style.tileSection, style.tilebody]}>
              <View>
                <Text style={style.tileSubheading}>
                  Here's what you can do here :
                </Text>
              </View>
              <View style={style.tileSectionGrid}>
                {features.map((feature) => (
                  <FeatureTile key={feature.id} feature={feature} />
                ))}
              </View>
            </View>
            <View style={[style.tileSection]}>
              <View>
                {isMobile ? (
                  <>
                    <TertiaryButton
                      text="INVITE OTHER ATTENDEES"
                      containerStyle={{
                        width: '100%',
                        height: 48,
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        borderRadius: ThemeConfig.BorderRadius.medium,
                      }}
                      iconName="share"
                      iconSize={20}
                      iconColor={$config.SECONDARY_ACTION_COLOR}
                      onPress={() => {
                        copyShareLinkToClipboard(
                          SHARE_LINK_CONTENT_TYPE.ATTENDEE,
                        );
                      }}
                    />
                  </>
                ) : (
                  <>
                    <View>
                      <Text style={[style.cardTitle, {paddingBottom: 3}]}>
                        Invite other attendees
                      </Text>
                    </View>
                    <MeetingLink
                      styleProps={{
                        size: 'tiny',
                        variant: 'secondary',
                        linkFontSize: 'tiny',
                      }}
                      label=""
                      link={getShareLink(SHARE_LINK_CONTENT_TYPE.ATTENDEE)}
                      linkToCopy={SHARE_LINK_CONTENT_TYPE.ATTENDEE}
                    />
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const style = StyleSheet.create({
  tileBackdrop: {
    flex: 1,
    backgroundColor: $config.VIDEO_AUDIO_TILE_COLOR,
    justifyContent: 'center',
    marginHorizontal: 'auto',
    marginVertical: 4,
  },
  tileContainer: {
    maxWidth: 600,
    minWidth: 200,
    margin: 'auto',
    padding: 20,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: $config.CARD_LAYER_2_COLOR,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
  },
  tileSection: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  tileSectionGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tileheader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tilebody: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: $config.CARD_LAYER_2_COLOR,
  },
  tileHeading: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 20,
    color: $config.FONT_COLOR,
    fontFamily: 'Source Sans Pro',
  },
  tileSubheading: {
    color: $config.VIDEO_AUDIO_TILE_AVATAR_COLOR,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 14,
    fontFamily: 'Source Sans Pro',
  },
  // Feature card css
  card: {
    minHeight: 50,
    width: '100%',
    paddingTop: 16,
    paddingRight: 16,
  },
  cardWeb: {
    flexBasis: '50%',
  },
  cardMobile: {
    flexBasis: '100%%',
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardHeaderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    flexShrink: 0,
    backgroundColor:
      $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['10%'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardHeaderAvatarIcon: {
    flexShrink: 0,
  },
  cardHeaderContent: {
    flex: 1,
    marginTop: 2,
  },
  cardTitle: {
    color: $config.FONT_COLOR,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 12,
    fontFamily: 'Source Sans Pro',
  },
  cardDesc: {
    color: $config.FONT_COLOR + hexadecimalTransparency['70%'],
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    fontFamily: 'Source Sans Pro',
  },
});
