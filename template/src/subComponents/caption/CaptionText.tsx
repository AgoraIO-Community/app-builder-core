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
import {getUserTranslatedText, getLanguageLabel, LanguageType} from './utils';

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
  speakerUid?: string | number;
  userLocalUid?: string | number;
  spokenLanguageCode?: LanguageType;
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
  const {globalSttState, captionViewMode, selectedTranslationLanguageRef} =
    useCaption();

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

  // Get the appropriate source text for display based on viewer's language preferences
  const globalSourceLanguage = globalSttState?.globalSpokenLanguage;
  // const localUserText = value;
  // const remoteUserTranslatedText: {
  //   text: string,
  //   langcode: LanguageType
  // } = () => {
  //   const matchingTranslation = translations.find(
  //     t => t.lang === viewerSourceLanguage,
  //   );
  //   if (matchingTranslation?.text) {
  //     return matchingTranslation.text;
  //   }
  //   return value;
  // };

  // If translation is selected then show both local and remote in that translated language
  const displayTranslatedViewText = getUserTranslatedText(
    value,
    translations,
    globalSourceLanguage,
    selectedTranslationLanguageRef.current,
  );
  // const displayTranslatedViewText = {
  //   value,
  //   langCode: getLanguageLabel([globalSourceLanguage]) || '',
  // };

  /**
   * ROBUST TEXT EXTRACTION LOGIC
   * Problem: value and translationText contain FULL accumulated text (can be 1000+ chars)
   * Solution: Extract only the latest portion that fits in allocated lines
   * - With translation: 2 lines source (~100-120 chars) + 1 line translation (~50-75 chars)
   * - Without translation: 3 lines source (~150-180 chars)
   */
  const getLatestTextPortion = (text: string, maxChars: number) => {
    if (!text || text.length <= maxChars) {
      return text;
    }

    // Take last maxChars, try to find sentence boundary for cleaner cut
    const portion = text.slice(-maxChars);
    const sentenceMatch = portion.match(/[.!?]\s+/);

    // If we find a sentence boundary after position 10, start from there
    if (sentenceMatch && sentenceMatch.index > 10) {
      return portion.slice(sentenceMatch.index + sentenceMatch[0].length);
    }

    // Otherwise just return the last maxChars
    return portion;
  };

  // Adjust char limits based on mobile vs desktop (mobile has smaller font)
  const sourceCharLimit =
    captionViewMode === 'original-and-translated'
      ? isMobile
        ? 50
        : 70 // 1 line for source when showing original + translation below
      : isMobile
      ? 150
      : 180; // 3 lines for source in translated mode (uses full space)

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
        {/* Combined source and translation text */}
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
          {/* View mode when "Original and Translated" is selected - show original on top*/}
          {selectedTranslationLanguageRef.current &&
            captionViewMode === 'original-and-translated' && (
              <>
                <Text style={styles.languageLabel}>
                  ({getLanguageLabel([globalSourceLanguage])}){' '}
                </Text>
                {getLatestTextPortion(value, sourceCharLimit)}
                {'\n'}
              </>
            )}

          {/* Default view when view mode is : translated */}
          <Text style={styles.languageLabel}>
            ({displayTranslatedViewText.langLabel}){' '}
          </Text>
          {getLatestTextPortion(
            displayTranslatedViewText.value,
            sourceCharLimit,
          )}
        </Text>
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

  captionText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    color: $config.FONT_COLOR,
    position: 'absolute',
    bottom: 0,
  },

  transcriptionText: {
    marginBottom: 2,
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
