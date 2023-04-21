import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

import Caption from './Caption';
import {useCaptionToggle} from './useCaptionToggle';

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
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
