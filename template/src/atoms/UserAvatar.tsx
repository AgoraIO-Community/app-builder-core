import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import ThemeConfig from '../theme';

function getInitials(name: string) {
  let rgx = new RegExp(/(\p{L}{1})\p{L}+/, 'gu');
  let initials = [...name.matchAll(rgx)] || [];
  return (
    (initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')
  ).toUpperCase();
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
