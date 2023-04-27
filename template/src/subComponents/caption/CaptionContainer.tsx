import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

import Caption from './Caption';
import {useCaptionToggle} from './useCaptionToggle';
import ThemeConfig from '../../../src/theme';

const CaptionContainer = () => {
  const [captions, setCaptions] = React.useState([]); // to hold records of captions for transcript purposes.
  const {isCaptionON} = useCaptionToggle();

  return isCaptionON ? (
    <View style={styles.container}>
      <Caption />
    </View>
  ) : null;
};

export default CaptionContainer;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    minHeight: 80,
    marginHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderRadius: ThemeConfig.BorderRadius.small,
  },
});
