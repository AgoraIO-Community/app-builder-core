import {
  Text,
  View,
  StyleSheet,
  LayoutChangeEvent,
  TextStyle,
} from 'react-native';
import React from 'react';

import ThemeConfig from '../../../src/theme';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';
import {isAndroid, isMobileUA} from '../../utils/common';

type TranslationItem = {
  lang: string;
  text: string;
  isFinal: boolean;
};

interface CaptionTextProps {
  user: string;
  value: string;
  translations?: TranslationItem[];
  activeSpeakersCount: number;
  isActiveSpeaker?: boolean;
  activelinesAvailable?: number;
  setActiveLinesAvailable?: React.Dispatch<React.SetStateAction<number>>;
  inActiveLinesAvailable?: number;
  setInActiveLinesAvaialble?: React.Dispatch<React.SetStateAction<number>>;
  captionUserStyle?: TextStyle;
  captionTextStyle?: TextStyle;
}

const DESKTOP_LINE_HEIGHT = 28;
const MOBILE_LINE_HEIGHT = 21;
const MAX_CAPTIONS_LINES_ALLOWED = 3;

// Language name mapping for display
const LANGUAGE_LABELS: {[key: string]: string} = {
  'hi-IN': 'Hindi',
  'fr-FR': 'French',
  'ru-RU': 'Russian',
  'zh-HK': 'Chinese',
  'en-US': 'English',
};

// Colors for different translation lines
const TRANSLATION_COLORS: {[key: string]: string} = {
  'hi-IN': '#FF6B6B',
  'fr-FR': '#4ECDC4', 
  'ru-RU': '#45B7D1',
  'zh-HK': '#96CEB4',
  'en-US': '#FECA57',
};

const CaptionText = ({
  user,
  value,
  translations = [],
  activeSpeakersCount,
  isActiveSpeaker = false,
  activelinesAvailable,
  setActiveLinesAvailable,
  inActiveLinesAvailable,
  setInActiveLinesAvaialble,
  captionUserStyle = {},
  captionTextStyle = {},
}: CaptionTextProps) => {
  const isMobile = isMobileUA();

  const LINE_HEIGHT = isMobile ? MOBILE_LINE_HEIGHT : DESKTOP_LINE_HEIGHT;

  // callback triggers whenevere captions reaches next line
  const handleTextLayout = (event: LayoutChangeEvent) => {
    let textHeight = event.nativeEvent.layout.height; // height of the <Text>

    /* safari at only zoom level 85% gives value as 27,54,81... for lineHeight instead of 28,56,84... */
    /* IOS,Androis gives 21.33 instead of 21 */
    /* so added the threshold of 1 in isDiffLineHeight */

    const lineHeightOffset = textHeight % LINE_HEIGHT;
    const isDiffLineHeight = lineHeightOffset > 1;
    const isLineHeightGreater = lineHeightOffset < 15;
    const delta = isDiffLineHeight
      ? isLineHeightGreater
        ? -lineHeightOffset
        : LINE_HEIGHT - lineHeightOffset
      : 0;

    const currentLines = Math.floor((textHeight + delta) / LINE_HEIGHT); // calculate numberOfLines
    const currentAllowedLines = Math.min(
      currentLines,
      MAX_CAPTIONS_LINES_ALLOWED,
    );

    if (isActiveSpeaker) {
      setActiveLinesAvailable(currentAllowedLines);
    } else {
      setInActiveLinesAvaialble(currentAllowedLines);
    }
  };

  /**
   * Total 5 lines (2-nameTags, MAX_CAPTIONS_LINES_ALLOWED-captions) => 1/5 = 0.2 flex for 1 line
   * activeSpeaker Container will take flex depending on number of lines taken + 1 (name tag)
   * prevSpeaker Conatiner will take 1 - flex , calculated in prev step
   * If activeSpaker has three lines , then it will take entire space with flex:1 and preSpeaker flex:0
   *
   */

  return (
    <View
      style={[
        styles.captionContainer,
        {borderColor: isActiveSpeaker ? 'yellow' : 'white'},
        {
          flex:
            activeSpeakersCount === 1
              ? 1
              : isActiveSpeaker
              ? activelinesAvailable === MAX_CAPTIONS_LINES_ALLOWED
                ? 1
                : (activelinesAvailable + 1) * 0.2
              : activelinesAvailable === MAX_CAPTIONS_LINES_ALLOWED
              ? 0
              : 1 - (activelinesAvailable + 1) * 0.2,
        },
        !isActiveSpeaker && activelinesAvailable === 3 && {height: 0},
      ]}>
      <Text
        style={[
          styles.captionUserName,
          isMobile ? styles.mobileNameFontSize : styles.desktopNameFontSize,
          captionUserStyle,
        ]}
        numberOfLines={1}
        textBreakStrategy="simple"
        ellipsizeMode="tail">
        {user}
      </Text>
      <View
        style={[
          styles.captionTextContainerStyle,
          {
            minHeight:
              (isActiveSpeaker
                ? activelinesAvailable
                : Math.min(
                    inActiveLinesAvailable,
                    MAX_CAPTIONS_LINES_ALLOWED - activelinesAvailable,
                  )) * LINE_HEIGHT,
          },
        ]}>
        {/* Transcription */}
        {value ? (
          <Text
            onLayout={handleTextLayout}
            style={[
              styles.captionText,
              styles.transcriptionText,
              isMobile
                ? styles.mobileCaptionFontSize
                : styles.desktopCaptionFontSize,
              isAndroid() && {lineHeight: MOBILE_LINE_HEIGHT - 2},
              captionTextStyle,
            ]}>
            {value}
          </Text>
        ) : null}
        
        {/* Translations */}
        {translations.map((translation, index) => {
          const langLabel = LANGUAGE_LABELS[translation.lang] || translation.lang;
          const color = TRANSLATION_COLORS[translation.lang] || '#888888';
          const opacity = translation.isFinal ? 1 : 0.7;
          
          return (
            <Text
              key={`${translation.lang}-${index}`}
              style={[
                styles.translationText,
                isMobile
                  ? styles.mobileCaptionFontSize
                  : styles.desktopCaptionFontSize,
                isAndroid() && {lineHeight: MOBILE_LINE_HEIGHT - 2},
                {
                  color: color,
                  opacity: opacity,
                  marginTop: 2,
                },
              ]}>
              ({langLabel}) {translation.text}
            </Text>
          );
        })}
      </View>
    </View>
  );
};

export default CaptionText;

const styles = StyleSheet.create({
  captionContainer: {
    alignItems: 'flex-start',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 620,
    justifyContent: 'flex-end',
    borderStyle: 'dotted',
  },

  captionTextContainerStyle: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },

  captionText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    color: $config.FONT_COLOR,
  },

  transcriptionText: {
    marginBottom: 2,
  },

  translationText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '300',
    color: $config.FONT_COLOR,
    marginTop: 1,
  },

  captionUserName: {
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    color: $config.FONT_COLOR + hexadecimalTransparency['70%'],
    fontSize: ThemeConfig.FontSize.medium,
    maxWidth: 200,
  },
  mobileNameFontSize: {
    fontSize: 16,
    lineHeight: 19,
  },
  desktopNameFontSize: {
    fontSize: 18,
    lineHeight: 22,
  },
  mobileCaptionFontSize: {
    fontSize: 16,
    lineHeight: MOBILE_LINE_HEIGHT,
  },
  desktopCaptionFontSize: {
    fontSize: 24,
    lineHeight: DESKTOP_LINE_HEIGHT,
  },
});
