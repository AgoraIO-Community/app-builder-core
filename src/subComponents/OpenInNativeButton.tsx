import React from 'react';
import {View, TouchableOpacity, Text, Platform, StyleSheet} from 'react-native';

const OpenInNativeButton = () => {
  const openInNative = () => {};

  return Platform.OS === 'web' ? (
    <View>
      <TouchableOpacity style={style.btn} onPress={() => openInNative()}>
        <Text style={style.btnText}>Open in App</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <></>
  );
};

const style = StyleSheet.create({
  btn: {
    backgroundColor: '#fff',
    width: 110,
    height: 30,
    borderWidth: 2,
    borderColor: '#099DFD',
    // marginTop: 5,
    // marginRight: 10,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: '#099DFD',
  },
});

export default OpenInNativeButton;
