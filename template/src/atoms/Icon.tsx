import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import React from 'react';

interface IconProps {
  uri: string;
  onPress?: () => void;
  width?: number;
  height?: number;
  label?: string;
}

const Icon = ({uri, onPress, width = 20, height = 20, label}: IconProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Image
        style={{width, height, tintColor: $config.PRIMARY_COLOR}}
        source={{uri: uri}}
      />
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

export default Icon;

const styles = StyleSheet.create({
  label: {
    color: $config.PRIMARY_COLOR,
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Source Sans Pro',
  },
  container: {
    flexDirection: 'column',
    alignItems: 'center',
  },
});
