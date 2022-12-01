import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import React from 'react';
import ThemeConfig from '../theme';

interface ButtonProps extends TouchableOpacityProps {
  text?: string;
  children?: React.ReactNode;
  containerStyle?: ViewStyle;
}

const TertiaryButton = (props: ButtonProps) => {
  const {text, ...rest} = props;
  return (
    <TouchableOpacity
      style={[styles.container, props?.containerStyle]}
      {...rest}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

export default TertiaryButton;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: $config.SECONDARY_ACTION_COLOR,
    borderRadius: 4,
    justifyContent: 'center',
  },
  text: {
    color: $config.SECONDARY_ACTION_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 12,
    lineHeight: 12,
    fontWeight: '600',
  },
});
