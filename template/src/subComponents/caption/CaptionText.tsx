import {
  Text,
  View,
  StyleSheet,
  LayoutChangeEvent,
  TextStyle,
} from 'react-native';
import React from 'react';

import ThemeConfig from '../../../src/theme';
import {useCaption} from './useCaption';
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
  const {selectedTranslationLanguage} = useCaption();

  const LINE_HEIGHT = isMobile ? MOBILE_LINE_HEIGHT : DESKTOP_LINE_HEIGHT;

  // Check if translation is being shown
  const hasTranslation =
    selectedTranslationLanguage && translations?.length > 0;
  const MAX_SOURCE_LINES = hasTranslation ? 2 : MAX_CAPTIONS_LINES_ALLOWED;

  // callback triggers whenever source text reaches next line
  const handleSourceTextLayout = (event: LayoutChangeEvent) => {
    let textHeight = event.nativeEvent.layout.height; // height of source text only

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

    const currentLines = Math.floor((textHeight + delta) / LINE_HEIGHT); // calculate numberOfLines for source
    const currentSourceLines = Math.min(currentLines, MAX_SOURCE_LINES);

    // Total lines = source lines + (1 if translation shown, 0 otherwise)
    const currentAllowedLines = hasTranslation
      ? currentSourceLines + 1
      : currentSourceLines;

    if (isActiveSpeaker) {
      setActiveLinesAvailable(currentAllowedLines);
    } else {
      setInActiveLinesAvaialble(currentAllowedLines);
    }
  };

  /**
   * Line allocation:
   * - When translation is OFF: up to 3 lines for source text
   * - When translation is ON: 2 lines for source + 1 line for translation = 3 total
   *
   * Total 5 lines (2-nameTags, 3-captions) => 1/5 = 0.2 flex for 1 line
   * activeSpeaker Container will take flex depending on number of lines taken + 1 (name tag)
   * prevSpeaker Container will take 1 - flex, calculated in prev step
   * If activeSpeaker has three lines, then it will take entire space with flex:1 and prevSpeaker flex:0
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
            height:
              (isActiveSpeaker
                ? activelinesAvailable
                : Math.min(
                    inActiveLinesAvailable,
                    MAX_CAPTIONS_LINES_ALLOWED - activelinesAvailable,
                  )) * LINE_HEIGHT,
          },
        ]}>
        {/* Wrapper for both source and translation - positioned at bottom */}
        <View style={styles.textWrapper}>
          {/* Original Transcription */}
          <Text
            onLayout={handleSourceTextLayout}
            numberOfLines={MAX_SOURCE_LINES}
            ellipsizeMode="tail"
            style={[
              styles.captionText,
              styles.transcriptionText,
              isMobile
                ? styles.mobileCaptionFontSize
                : styles.desktopCaptionFontSize,
              isAndroid() && {lineHeight: MOBILE_LINE_HEIGHT - 2},
              captionTextStyle,
            ]}>
            <Text style={styles.languageLabel}>("English"): </Text>
            {/* original text */}
            {value}
          </Text>
          {/* Translation line - shown right below */}
          {selectedTranslationLanguage && translations?.length > 0 && (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.translationText,
                isMobile
                  ? styles.mobileCaptionFontSize
                  : styles.desktopCaptionFontSize,
                captionTextStyle,
                {marginTop: 2},
              ]}>
              <Text style={styles.languageLabel}>
                ({selectedTranslationLanguage}):{' '}
              </Text>
              {translations.find(t => t.lang === selectedTranslationLanguage)
                ?.text || ''}
            </Text>
          )}
        </View>
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
    overflow: 'hidden',
    position: 'relative',
  },

  textWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
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

  languageLabel: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
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
