import React from 'react';
import {Image, StyleSheet} from 'react-native';

/**
 * A translucent watermark image that can added in various parts of the the application.
 * Not in use at the moment
 */
const Watermark = () => {
  return (
    // <View>
    <Image
      source={{uri: $config.logo}}
      style={styles.image}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  image: {
    position: 'absolute',
    bottom: '2%',
    left: '3%',
    width: 90,
    height: 30,
    zIndex: 100,
    opacity: 0.5,
  },
});

export default Watermark;
