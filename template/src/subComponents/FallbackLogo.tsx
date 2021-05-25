import React from 'react';
import {Image, View} from 'react-native';

export default function FallbackLogo() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignContent: 'center',
      }}>
      <Image
        source={{uri: $config.logo}}
        style={{
          height: '15%',
        }}
        resizeMode="contain"
      />
    </View>
  );
}
