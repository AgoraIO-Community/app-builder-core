import React from 'react';
import {Image, StyleSheet} from 'react-native';

/**
 * Displays the illustration.
 */
const Illustration = () => {
  return (
    <Image
      style={styles.illustration}
      resizeMode={'contain'}
      source={{
        uri:
          $config.illustration === ''
            ? 'https://gist.githubusercontent.com/EkaanshArora/59ae6969456f8e95f9752a4adf96bb44/raw/4c3831d115b4f9de0219e8658f049927b0ed9271/image.svg'
            : $config.illustration,
      }}
    />
  );
};

const styles = StyleSheet.create({
  illustration: {flex: 1},
});
export default Illustration;
