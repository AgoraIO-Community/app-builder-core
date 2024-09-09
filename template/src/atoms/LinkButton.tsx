import {StyleSheet, Text, TouchableOpacity, TextStyle} from 'react-native';
import React from 'react';
import ThemeConfig from '../theme';

interface LinkButtonProps {
  onPress: () => void;
  text: string;
  textStyle?: TextStyle;
}

const LinkButton = ({onPress, text, textStyle = {}}: LinkButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={[styles.text, textStyle]}> {text} </Text>
    </TouchableOpacity>
  );
};

export default LinkButton;

const styles = StyleSheet.create({
  text: {
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: ThemeConfig.FontSize.normal,
    lineHeight: ThemeConfig.FontSize.normal,
  },
});
