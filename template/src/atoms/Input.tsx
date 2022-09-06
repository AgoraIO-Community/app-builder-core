import {StyleSheet, Text, TextInput, TextInputProps, View} from 'react-native';
import {textInput} from '../../theme.json';
import React from 'react';

interface InputProps extends TextInputProps {
  helpText?: string;
  label?: string;
}
const Input = (props: InputProps) => {
  const {style, helpText, label, ...otherProps} = props;
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[style, styles.input]}
        placeholderTextColor="#BCBCBC"
        autoCorrect={false}
        {...otherProps}
        autoFocus
      />
      {helpText && <Text style={styles.helpText}>{props.helpText}</Text>}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    height: 60,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    paddingVertical: 21,
    paddingHorizontal: 16,
    borderColor: '#CCCCCC',
    color: '#2B2C33',
    fontWeight: '600',
    fontFamily: 'Source Sans Pro',
    fontSize: 18,
    borderRadius: 8,
  },
  label: {
    fontWeight: '600',
    fontSize: 18,
    color: '#040405',
    fontFamily: 'Source Sans Pro',
  },
  helpText: {
    color: '#CCCCCC',
    fontFamily: 'Source Sans Pro',
  },
});
