import {Text, View, StyleSheet, ViewStyle} from 'react-native';
import React from 'react';

import ThemeConfig from '../../../src/theme';

interface TranscriptTextProps {
  user: string;
  value: string;
  containerStyle?: ViewStyle;
  nameContainerStyle?: ViewStyle;
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const suffix = h >= 12 ? 'PM' : 'AM';
  const H = h % 12 || 12;
  return `${H}:${m} ${suffix}`;
}

export const TranscriptText = ({
  user,
  value,
  containerStyle = {},
  nameContainerStyle = {},
}: TranscriptTextProps) => {
  const [name, time] = (user || '').split(':');
  const t = formatTime(Number(time));

  return (
    <View key={user} style={[styles.textContainer, containerStyle]}>
      {name ? (
        <View style={[styles.nameContainer, nameContainerStyle]}>
          <Text style={styles.name}>
            {' '}
            {name} : {time && t}
          </Text>
        </View>
      ) : (
        <></>
      )}
      {value ? <Text style={styles.text}>{value}</Text> : <></>}
    </View>
  );
};

const styles = StyleSheet.create({
  nameContainer: {
    padding: 4,
    backgroundColor: $config.VIDEO_AUDIO_TILE_AVATAR_COLOR,
    borderRadius: ThemeConfig.BorderRadius.medium,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  name: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: ThemeConfig.FontSize.medium,
    fontWeight: '600',
    color: $config.HARD_CODED_BLACK_COLOR,
  },
  text: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
    color: $config.FONT_COLOR,
  },
  textContainer: {
    marginVertical: 5,
  },
});
