/* eslint-disable react-native/no-inline-styles */
import React, {useContext} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';

export default function OpenInNativeButton() {
  const openInNative = () => {};

  return (
    <View>
      <TouchableOpacity
        style={{
          backgroundColor: '#fff',
          width: 110,
          height: 30,
          borderWidth: 2,
          borderColor: '#099DFD',
          // marginTop: 5,
          // marginRight: 10,
        }}
        onPress={() => openInNative()}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            textAlign: 'center',
            color: '#099DFD',
          }}>
          Open in App
        </Text>
      </TouchableOpacity>
    </View>
  );
}
