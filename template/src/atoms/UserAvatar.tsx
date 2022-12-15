import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import ThemeConfig from '../theme';

function getInitials(name: string) {
  if (name && name?.length) {
    return name[0].toUpperCase();
  }
  return 'U';
}

const UserAvatar = ({name, containerStyle, textStyle}) => {
  return (
    <View
      style={[
        containerStyle,
        {
          alignSelf: 'center',
          alignContent: 'center',
          justifyContent: 'center',
        },
      ]}>
      <Text
        style={[
          textStyle,
          {
            fontFamily: ThemeConfig.FontFamily.sansPro,
            alignSelf: 'center',
            textAlign: 'center',
          },
        ]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

export default UserAvatar;

const styles = StyleSheet.create({});
