import React from 'react';
import {Image, Text, View} from 'react-native';

export default function FallbackLogo(name: string) {
  console.log('!', name);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignContent: 'center',
        borderRadius: 15,
      }}>
      {/* <Image
        source={{uri: $config.logo}}
        style={{
          height: '15%',
        }}
        resizeMode="contain"
      /> */}
      <View
        style={{
          width: 80,
          height: 80,
          backgroundColor: $config.primaryColor,
          alignSelf: 'center',
          alignContent: 'center',
          justifyContent: 'center',
          borderRadius: 10,
          shadowColor: $config.primaryColor,
          shadowRadius: 20,
        }}>
        <Text
          style={{
            color: $config.secondaryFontColor,
            fontSize: 20,
            alignSelf: 'center',
            textAlign: 'center',
          }}>
          {name ? name[0] : 'U'}
        </Text>
      </View>
    </View>
  );
}
