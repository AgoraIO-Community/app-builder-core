/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Image} from 'react-native';
import images from '../assets/images';

export default function Logo() {
  return (
    <View>
      <Image
        source={{uri: images.logo}}
        style={{
          width: 90,
          height: 30,
        }}
        resizeMode="contain"
      />
    </View>
  );
}
