import React from 'react';
import {Image} from 'react-native';
import images from '../assets/images';

const Watermark = () => {
  return (
    // <View>
    <Image
      source={{uri: images.logo}}
      style={{
        position: 'absolute',
        bottom: 30,
        left: 30,
        width: 90,
        height: 30,
        zIndex: 100,
        opacity: 0.5,
      }}
      resizeMode="contain"
    />
  );
};

export default Watermark;
