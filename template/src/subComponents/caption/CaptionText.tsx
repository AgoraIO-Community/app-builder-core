import {Text, View, StyleSheet} from 'react-native';
import React from 'react';

import ThemeConfig from '../../../src/theme';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';
import {isMobileUA} from '../../utils/common';

interface CaptionTextProps {
  user: string;
  value: string;
  activeSpeakersCount: number;
  isActiveSpeaker?: boolean;
}

export const CaptionText = ({
  user,
  value,
  activeSpeakersCount,
  isActiveSpeaker = false,
}: CaptionTextProps) => {
  const isMobile = isMobileUA();
  const mobileCaptionHeight = activeSpeakersCount === 1 ? 90 : 45;
  const desktopCaptionHeight = activeSpeakersCount === 1 ? 108 : 54;
  // as user speaks continously previous captions should be hidden , new appended

  return (
    <View
      style={[
        isMobile ? styles.captionContainerMobile : styles.captionContainer,
        // {height: isMobile ? mobileCaptionHeight : desktopCaptionHeight},
        {borderColor: isActiveSpeaker ? 'blue' : 'yellow'},
      ]}>
      {/*  Name  Tag */}
      <View
        style={[
          isMobile ? styles.nameContainerMobileStyle : styles.nameContainer,
        ]}>
        <View style={styles.nameTagContainer}>
          <Text
            style={[
              styles.captionUserName,
              isMobile ? styles.mobileFontSize : styles.desktopFontSize,
            ]}
            numberOfLines={1}
            textBreakStrategy="simple"
            ellipsizeMode="tail">
            {user}
          </Text>
          <Text
            style={[
              styles.separator,
              isMobile ? styles.mobileFontSize : styles.desktopFontSize,
              {marginLeft: isMobile ? 4 : 8},
            ]}>
            {':'}
          </Text>
        </View>
      </View>

      {/* Caption Text */}
      <View
        style={[
          isMobile
            ? styles.captionTextContainerMobileStyle
            : styles.captionTextContainerStyle,
          // {height: '90%'},
          // {height: isMobile ? mobileCaptionHeight : desktopCaptionHeight},
        ]}>
        <Text
          style={[
            styles.captionText,
            isMobile ? styles.mobileFontSize : styles.desktopFontSize,
            {
              //  minHeight: isMobile ? mobileCaptionHeight : desktopCaptionHeight,
            },
          ]}>
          {value}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  captionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dotted',

    flex: 1,
  },
  captionContainerMobile: {
    marginRight: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dotted',
  },
  captionTextContainerStyle: {
    overflow: 'hidden',
    maxWidth: 1000,
    width: '85%',
    position: 'relative',
    paddingHorizontal: 4,
    height: '100%',
  },
  captionTextContainerMobileStyle: {
    overflow: 'hidden',
    position: 'relative',
    paddingHorizontal: 2,
    flex: 1,
    height: '100%',
  },
  captionTextContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  nameContainer: {
    paddingHorizontal: 4,
    flexDirection: 'row',
    // alignItems: 'center',
    width: '15%',
    justifyContent: 'flex-end',
    height: '100%',
    alignItems: 'flex-end',
  },
  nameContainerMobileStyle: {
    padding: 2,
    flexDirection: 'row',
    // alignItems: 'flex-start',
    width: 70,
    justifyContent: 'flex-end',
    height: '100%',
    alignItems: 'flex-end',
  },
  captionText: {
    position: 'absolute',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    color: $config.FONT_COLOR + hexadecimalTransparency['70%'],
    bottom: 0,
  },
  separator: {
    color: $config.FONT_COLOR,
    fontWeight: '700',
  },
  captionUserName: {
    fontWeight: '700',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    color: $config.FONT_COLOR,
    maxWidth: 200,
  },
  mobileFontSize: {
    fontSize: 16,
    lineHeight: 22,
  },
  desktopFontSize: {
    fontSize: 20,
    lineHeight: 28,
  },
  nameTagContainer: {
    flexDirection: 'row',
  },
});
