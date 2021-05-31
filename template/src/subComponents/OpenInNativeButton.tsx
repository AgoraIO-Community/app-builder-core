import React, {useContext} from 'react';
import {View, TouchableOpacity, Text, Platform, StyleSheet} from 'react-native';
import ColorContext from '../components/ColorContext';

/**
 * A component to open the meeting using a native application.
 * This component will be rendered only on web
 * WIP. Need to implement deeplinks on native apps.
 */
const OpenInNativeButton = () => {
  const {primaryColor} = useContext(ColorContext);
  const openInNative = () => {};

  return Platform.OS === 'web' ? (
    <View>
      <TouchableOpacity
        style={[style.btn, {borderColor: primaryColor}]}
        onPress={() => openInNative()}>
        <Text style={[style.btnText, {color: primaryColor}]}>Open in App</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <></>
  );
};

const style = StyleSheet.create({
  btn: {
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    width: 110,
    height: 30,
    borderWidth: 2,
    borderColor: $config.PRIMARY_COLOR,
    // marginTop: 5,
    // marginRight: 10,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: $config.PRIMARY_COLOR,
  },
});

export default OpenInNativeButton;
