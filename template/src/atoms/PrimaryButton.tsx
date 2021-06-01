import React, {useContext} from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
} from 'react-native';
import {primaryButton, primaryButtonText} from '../../theme.json';
import ColorContext from '../components/ColorContext';

export interface ButtonProps extends PressableProps {
  text?: string;
}

export default function PrimaryButton(props: ButtonProps) {
  const {primaryColor} = useContext(ColorContext);
  const {children, ...otherProps} = props;
  return (
    <Pressable
      style={[
        styles.primaryButton,
        {backgroundColor: props.disabled ? primaryColor + '80' : primaryColor},
      ]}
      {...otherProps}>
      {props.text ? (
        <Text style={[styles.primaryButtonText as StyleProp<TextStyle>, {color: '#fff'}]}>
          {props.text}
        </Text>
      ) : (
        <></>
      )}
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primaryButton,
  primaryButtonText,
});
