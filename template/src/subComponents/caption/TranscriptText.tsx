import {Text, View, StyleSheet, ViewStyle, TextStyle} from 'react-native';
import React from 'react';

import ThemeConfig from '../../../src/theme';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';
import {isMobileUA} from '../../utils/common';
import {formatTime} from './utils';

interface TranscriptTextProps {
  user: string;
  time?: number;
  value: string;
  captionContainerStyle?: ViewStyle;
  captionStyle?: TextStyle;
  searchQuery?: string;
}

export const TranscriptText = ({
  user,
  time,
  value,
  searchQuery = '',
  captionContainerStyle = {},
  captionStyle = {},
}: TranscriptTextProps) => {
  const t = time ? formatTime(Number(time)) : '';
  const isTranscriptTxt = t.length > 0;

  const isMobile = isMobileUA();
  const regex = new RegExp(`(${searchQuery})`, 'gi');
  const parts = value.split(regex);

  return (
    <View
      key={user}
      style={
        isTranscriptTxt
          ? styles.transciptContainer
          : isMobile
          ? styles.captionContainerMobile
          : styles.captionContainer
      }>
      {(user && value && !isMobile) || (isMobile && isTranscriptTxt) ? (
        <Text
          style={[
            styles.name,
            isTranscriptTxt ? styles.transcriptName : styles.captionName,
          ]}>
          {user} {!isTranscriptTxt && ':'}
          {time && <Text style={styles.timestamp}>{t}</Text>}
        </Text>
      ) : (
        <></>
      )}
      {value ? (
        <View
          style={
            !isTranscriptTxt
              ? [
                  isMobile
                    ? styles.captionTextContainerMobileStyle
                    : styles.captionTextContainerStyle,
                  captionContainerStyle,
                ]
              : {}
          }>
          <Text
            style={[
              styles.text,
              isTranscriptTxt
                ? styles.transciptText
                : [styles.captionText, captionStyle],
            ]}>
            {isMobile && !isTranscriptTxt && (
              <Text
                style={[
                  styles.name,
                  isTranscriptTxt ? styles.transcriptName : styles.captionName,
                ]}>
                {user} {':'}
              </Text>
            )}
            {isTranscriptTxt ? (
              parts.map((part, index) =>
                part.toLowerCase() === searchQuery.toLowerCase() ? (
                  <Text key={index} style={styles.highlightedText}>
                    {part}
                  </Text>
                ) : (
                  <Text key={index}>{part}</Text>
                ),
              )
            ) : (
              <Text> {value} </Text>
            )}
          </Text>
        </View>
      ) : (
        <></>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  captionContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
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
    width: 1000,
    height: 80,
    lineHeight: 18,
    position: 'relative',
    textAlign: 'left',
  },
  captionTextContainerMobileStyle: {
    overflow: 'hidden',
    position: 'relative',
    flex: 1,
    flexWrap: 'wrap',
  },
  captionText: {
    fontSize: 20,
    lineHeight: 23,
    position: 'absolute',
    bottom: 0,
    minHeight: 80,
  },
  transciptContainer: {
    alignItems: 'flex-start',
    marginBottom: 24,
  },

  transciptText: {
    fontSize: 16,
    lineHeight: 22,
  },
  name: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    color: $config.FONT_COLOR,
  },
  transcriptName: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '600',
    marginBottom: 8,
  },
  captionName: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    marginRight: 8,
  },
  text: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    color: $config.FONT_COLOR + hexadecimalTransparency['70%'],
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
});
