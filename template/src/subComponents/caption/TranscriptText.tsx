import {Text, View, StyleSheet} from 'react-native';
import React from 'react';

import ThemeConfig from '../../../src/theme';

export const TranscriptText = ({
  user,
  value,
  containerStyle = {},
  nameContainerStyle = {},
}) => {
  const name = user?.split(':')[0] || '';
  return (
    <View key={user} style={[styles.textContainer, containerStyle]}>
      {name ? (
        <View style={[styles.nameContainer, nameContainerStyle]}>
          <Text style={styles.name}> {name} :</Text>
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
