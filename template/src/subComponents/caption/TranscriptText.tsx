import {Text, View, StyleSheet, ViewStyle, TextStyle} from 'react-native';
import React from 'react';

import ThemeConfig from '../../../src/theme';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';

interface TranscriptTextProps {
  user: string;
  value: string;
  captionContainerStyle?: ViewStyle;
  captionStyle?: TextStyle;
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const s = d.getSeconds().toString().padStart(2, '0');
  const suffix = h >= 12 ? 'PM' : 'AM';
  const H = h % 12 || 12;
  return `${H}:${m}:${s} ${suffix}`;
}

export const TranscriptText = ({
  user,
  value,
  captionContainerStyle = {},
  captionStyle = {},
}: TranscriptTextProps) => {
  const [name, time] = (user || '').split(':');
  const t = time ? formatTime(Number(time)) : '';
  const isTranscriptTxt = t.length > 0;

  return (
    <View
      key={user}
      style={
        isTranscriptTxt ? styles.transciptContainer : styles.captionContainer
      }>
      {name && value ? (
        <Text
          style={[
            styles.name,
            isTranscriptTxt ? styles.transcriptName : styles.captionName,
          ]}>
          {name} {!isTranscriptTxt && ':'}{' '}
          {time && <Text style={styles.timestamp}>{t}</Text>}
        </Text>
      ) : (
        <></>
      )}
      {value ? (
        <View
          style={
            !isTranscriptTxt
              ? [styles.captionTextContainerStyle, captionContainerStyle]
              : {}
          }>
          <Text
            style={[
              styles.text,
              isTranscriptTxt
                ? styles.transciptText
                : [styles.captionText, captionStyle],
            ]}>
            {value}
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

  captionTextContainerStyle: {
    overflow: 'hidden',
    maxWidth: 1000,
    width: 1000,
    height: 80,
    lineHeight: 18,
    position: 'relative',
    textAlign: 'left',
  },
  captionText: {
    fontSize: 18,
    lineHeight: 23,
    position: 'absolute',
    bottom: 0,
    minHeight: 80,
  },
  transciptContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
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
  },
  captionName: {
    fontSize: 18,
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
    color: $config.FONT_COLOR + hexadecimalTransparency['40%'],
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
  },
});
