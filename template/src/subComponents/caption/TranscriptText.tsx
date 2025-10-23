import {Text, View, StyleSheet} from 'react-native';
import React from 'react';

import ThemeConfig from '../../../src/theme';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';
import {formatTime} from './utils';

type TranslationItem = {
  lang: string;
  text: string;
  isFinal: boolean;
};

interface TranscriptTextProps {
  user: string;
  time: number;
  value: string;
  translations?: TranslationItem[];
  searchQuery?: string;
  selectedTranslationLanguage?: string;
}

export const TranscriptText = ({
  user,
  time,
  value,
  translations = [],
  searchQuery = '',
  selectedTranslationLanguage: storedTranslationLanguage,
}: TranscriptTextProps) => {
  const t = time ? formatTime(Number(time)) : '';

  // For search highlighting
  //  text to display based on stored translation language
  // const getDisplayText = () => {
  //   if (!storedTranslationLanguage) {
  //     return value; // no translation selected, show original
  //   }

  //   // find translation for the stored language
  //   const currentTranslation = translations.find(
  //     t => t.lang === storedTranslationLanguage,
  //   );
  //   if (currentTranslation?.text) {
  //     return currentTranslation.text;
  //   }

  //   // if stored language not available, show original
  //   return value;
  // };

  // const displayText = getDisplayText();
  const regex = searchQuery ? new RegExp(`(${searchQuery})`, 'gi') : ' ';
  const originalParts = value.split(regex);

  // Prepare all translations with their parts for search highlighting
  const translationsParts = translations.map(trans => ({
    lang: trans.lang,
    parts: trans.text.split(regex),
  }));

  return (
    <View key={user} style={styles.transcriptTextContainer}>
      <View style={styles.nameTimeContainer}>
        <Text
          numberOfLines={1}
          textBreakStrategy="simple"
          ellipsizeMode="tail"
          style={[styles.transcriptName]}>
          {user}
        </Text>
        <Text style={styles.timestamp}>{t}</Text>
      </View>

      <View>
        {/* Original Text */}
        <Text style={[styles.transciptText]}>
          {/* If substring matches search query then highlight it */}
          {originalParts.map((part, index) =>
            part.toLowerCase() === searchQuery.toLowerCase() &&
            searchQuery !== '' ? (
              <Text key={index} style={styles.highlightedText}>
                {searchQuery ? part : part + ' '}
              </Text>
            ) : (
              <Text key={index}>{searchQuery ? part : part + ' '}</Text>
            ),
          )}
        </Text>

        {/* All Translations */}
        {translationsParts.map((translation, translationIndex) => (
          <Text
            key={translation.lang}
            style={[styles.transciptText, styles.translationText]}>
            {translation.parts.map((part, index) =>
              part.toLowerCase() === searchQuery.toLowerCase() &&
              searchQuery !== '' ? (
                <Text key={index} style={styles.highlightedText}>
                  {searchQuery ? part : part + ' '}
                </Text>
              ) : (
                <Text key={index}>{searchQuery ? part : part + ' '}</Text>
              ),
            )}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nameTimeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
    justifyContent: 'flex-start',
  },

  transcriptTextContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },

  transciptText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    color: $config.FONT_COLOR + hexadecimalTransparency['70%'],
  },

  transcriptName: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    color: $config.FONT_COLOR,
    maxWidth: 160,
  },

  timestamp: {
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 8,
    color: $config.FONT_COLOR + hexadecimalTransparency['40%'],
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
  },
  highlightedText: {
    backgroundColor: $config.SEMANTIC_NEUTRAL,
  },
  translationText: {
    fontStyle: 'italic',
    opacity: 0.8,
    marginTop: 4,
  },
});
