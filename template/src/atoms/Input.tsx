import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  Platform,
  TextStyle,
} from 'react-native';
import {textInput} from '../../theme.json';
import React from 'react';
import Spacer from './Spacer';

interface InputProps extends TextInputProps {
  helpText?: string;
  label?: string;
  labelStyle?: TextStyle;
  autoFocus?: boolean;
}
const Input = (props: InputProps) => {
  const {style, labelStyle, helpText, label, autoFocus, ...otherProps} = props;
  const [isFocussed, setIsFocussed] = React.useState(() =>
    autoFocus ? true : false,
  );
  return (
    <>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <Spacer size={8} />
      <TextInput
        style={[
          styles.input,
          style,
          {borderColor: isFocussed ? $config.PRIMARY_COLOR : '#666666'},
        ]}
        placeholderTextColor="rgba(126, 126, 126, 0.5)"
        autoCorrect={false}
        autoFocus
        {...otherProps}
        // onFocus={() => setIsFocussed(true)}
        // onBlur={() => setIsFocussed(false)}
      />
      {/* {helpText && <Text style={styles.helpText}>{props.helpText}</Text>} */}
    </>
  );
};

export default Input;

const styles = StyleSheet.create({
  input: {
    height: 60,
    width: '100%',
    borderWidth: 1,
    paddingVertical: 21,
    paddingHorizontal: 16,
    borderColor: '#CCCCCC',
    color: '#2B2C33',
    fontWeight: '600',
    fontFamily: 'Source Sans Pro',
    fontSize: 18,
    borderRadius: 8,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  label: {
    fontWeight: '600',
    fontSize: 18,
    color: '#040405',
    fontFamily: 'Source Sans Pro',
  },
  helpText: {
    color: $config.PRIMARY_FONT_COLOR,
    fontFamily: 'Source Sans Pro',
  },
});
