import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

function getInitials(name: string) {
  const arr = name.split(' ');
  const len = arr.length;
  if (len > 1) {
    return arr[0][0] + arr[len - 1][0];
  } else {
    return arr[0][0];
  }
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
            fontFamily: 'Source Sans Pro',
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
