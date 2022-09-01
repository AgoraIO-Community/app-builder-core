import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import React from 'react';

interface IconProps {
  uri: string;
  onPress?: () => void;
  width?: number;
  height?: number;
}

const Icon = ({uri, onPress, width = 20, height = 20}: IconProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Image style={{width, height}} source={{uri: uri}} />
    </TouchableOpacity>
  );
};

export default Icon;

const styles = StyleSheet.create({});
