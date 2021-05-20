import React, {useContext} from 'react';
import {TextInputProps, StyleSheet, TextInput} from 'react-native';
import {textInput} from '../../theme.json';
import ColorContext from '../components/ColorContext';

const PrimaryButton = (props: TextInputProps) => {
  const {primaryColor} = useContext(ColorContext);
  const {style, ...otherProps} = props;
  return (
    <TextInput
      style={[{borderColor: primaryColor}, styles.textInput, style]}
      placeholderTextColor={textInput.color + '70'}
      {...otherProps}
      autoCorrect={false}
    />
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  textInput,
});
