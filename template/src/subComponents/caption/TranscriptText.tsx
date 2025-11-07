import {Text, View, StyleSheet} from 'react-native';
import React from 'react';

import ThemeConfig from '../../../src/theme';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';
import {formatTime, getLanguageLabel} from './utils';
import {CaptionViewMode} from './useCaption';
import {useLocalUid} from '../../../agora-rn-uikit';

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
  transcriptViewMode?: CaptionViewMode;
  speakerUid?: string | number;
  localUserSpokenLanguage?: string;
}

export const TranscriptText = ({
  user,
  time,
  value,
  translations = [],
  searchQuery = '',
  selectedTranslationLanguage: storedTranslationLanguage,
  transcriptViewMode = 'translated',
  speakerUid,
  localUserSpokenLanguage,
}: TranscriptTextProps) => {
  const t = time ? formatTime(Number(time)) : '';

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

  const localUid = useLocalUid();
  const isLocalUser = localUid === speakerUid;
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
        {/* AllView */}
        {transcriptViewMode === 'original-and-translated' && (
          <>
            {/* Original Text  */}
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
            {/* Translated text */}
            {translationsParts.map((translation, translationIndex) => (
              <Text
                key={translation.lang}
                style={[styles.transciptText, styles.translationText]}>
                {/* lang code */}
                <Text style={styles.languageLabel}>
                  ({getLanguageLabel([translation.lang])}):{' '}
                </Text>
                {/* lang */}
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
          </>
        )}

        {/* Translated mode */}
        {transcriptViewMode === 'translated' && (
          <>
            {isLocalUser ? (
              <Text style={[styles.transciptText]}>
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
            ) : (
              <>
                {(() => {
                  const filteredTranslations = translationsParts.filter(
                    translation => translation.lang === localUserSpokenLanguage,
                  );
                  if (filteredTranslations.length === 0) {
                    return (
                      <Text
                        style={[
                          styles.transciptText,
                          styles.translationText,
                          {opacity: 0.6},
                        ]}>
                        Translation not found for{' '}
                        {getLanguageLabel([localUserSpokenLanguage])}
                      </Text>
                    );
                  }

                  return filteredTranslations.map(
                    (translation, translationIndex) => (
                      <Text
                        key={translation.lang}
                        style={[styles.transciptText, styles.translationText]}>
                        {/* lang code */}
                        <Text style={styles.languageLabel}>
                          ({getLanguageLabel([translation.lang])}):{' '}
                        </Text>
                        {/* lang */}
                        {translation.parts.map((part, index) =>
                          part.toLowerCase() === searchQuery.toLowerCase() &&
                          searchQuery !== '' ? (
                            <Text key={index} style={styles.highlightedText}>
                              {searchQuery ? part : part + ' '}
                            </Text>
                          ) : (
                            <Text key={index}>
                              {searchQuery ? part : part + ' '}
                            </Text>
                          ),
                        )}
                      </Text>
                    ),
                  );
                })()}
              </>
            )}
          </>
        )}
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
    marginTop: 8,
    fontWeight: '400',
    lineHeight: 24,
    fontSize: ThemeConfig.FontSize.normal,
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.medium,
  },
  languageLabel: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
  },
});
