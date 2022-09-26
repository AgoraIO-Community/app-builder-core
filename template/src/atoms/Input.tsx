import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  Platform,
} from 'react-native';
import {textInput} from '../../theme.json';
import React from 'react';

interface InputProps extends TextInputProps {
  helpText?: string;
  label?: string;
  labelStyle?: {};
  autoFocus?: boolean;
}
const Input = (props: InputProps) => {
  const {style, labelStyle, helpText, label, autoFocus, ...otherProps} = props;
  const [isFocussed, setIsFocussed] = React.useState(() =>
    autoFocus ? true : false,
  );
  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          style,
          {borderColor: isFocussed ? $config.PRIMARY_COLOR : '#666666'},
        ]}
        placeholderTextColor="#BABABA"
        autoCorrect={false}
        autoFocus
        {...otherProps}
        // onFocus={() => setIsFocussed(true)}
        // onBlur={() => setIsFocussed(false)}
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
