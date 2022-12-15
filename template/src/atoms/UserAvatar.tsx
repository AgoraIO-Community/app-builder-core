import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import ThemeConfig from '../theme';

function getInitials(name: string) {
  const names = name.split(' ').map((v) => v.charAt(0));
  return names.join('');
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
        {name ? getInitials(name).toUpperCase() : 'U'}
      </Text>
    </View>
  );
};

export default UserAvatar;

const styles = StyleSheet.create({});
