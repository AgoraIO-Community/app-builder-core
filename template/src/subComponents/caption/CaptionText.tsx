import {Text, View, StyleSheet} from 'react-native';
import React from 'react';

import ThemeConfig from '../../../src/theme';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';
import {isMobileUA} from '../../utils/common';

interface CaptionTextProps {
  user: string;
  value: string;
  activeSpeakersCount: number;
}

export const CaptionText = React.memo(
  ({user, value, activeSpeakersCount}: CaptionTextProps) => {
    const isMobile = isMobileUA();

    return (
      <View
        style={[
          isMobile ? styles.captionContainerMobile : styles.captionContainer,
          activeSpeakersCount === 1 ? {height: 85} : {height: 30},
        ]}>
        {/*  Name  Tag */}
        <View style={styles.nameContainer}>
          <Text
            style={[styles.captionUserName]}
            numberOfLines={1}
            textBreakStrategy="simple"
            ellipsizeMode="tail">
            {user}
          </Text>
          <Text style={styles.separator}>{':'}</Text>
        </View>

        {/* Caption Text */}
        <View
          style={[
            isMobile
              ? styles.captionTextContainerMobileStyle
              : styles.captionTextContainerStyle,
            activeSpeakersCount === 1 ? {minHeight: 85} : {minHeight: 30},
          ]}>
          <Text
            style={[
              styles.captionText,
              activeSpeakersCount === 1
                ? {minHeight: 80, bottom: 0}
                : {minHeight: 30},
            ]}>
            {value}
          </Text>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  captionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    justifyContent: 'center',
  },
  captionContainerMobile: {
    marginRight: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  captionTextContainerStyle: {
    overflow: 'hidden',
    maxWidth: 1000,
    width: '85%',
    lineHeight: 28,
    position: 'relative',

    padding: 4,
  },
  captionTextContainerMobileStyle: {
    overflow: 'hidden',
    position: 'relative',
    flex: 1,
    flexWrap: 'wrap',
  },
  captionTextContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Aligns caption text to the right
  },
  nameContainer: {
    padding: 4,
    flexDirection: 'row',
  },
  captionText: {
    fontSize: 20,
    lineHeight: 28,
    position: 'absolute',

    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    color: $config.FONT_COLOR + hexadecimalTransparency['70%'],
  },
  separator: {
    color: $config.FONT_COLOR,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    marginLeft: 4,
  },
  captionUserName: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    color: $config.FONT_COLOR,
    maxWidth: 180, // for mobile verify
  },
});
