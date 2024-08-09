import {
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  StyleProp,
  TextStyle,
} from 'react-native';
import React from 'react';
import ThemeConfig from '../../../theme';

interface Props {
  option: {
    label: string;
    value: string;
  };
  checked: boolean;
  onChange: (option: string) => void;
  labelStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}
export default function RadioButton(props: Props) {
  const {option, checked, onChange, disabled, labelStyle = {}} = props;
  return (
    <View>
      <TouchableOpacity
        id={option.value}
        style={[style.optionsContainer, disabled && style.disabledContainer]}
        onPress={() => !disabled && onChange(option.value)}>
        <View
          style={[
            style.radioCircle,
            checked && style.radioFilled,
            disabled && style.disabledCircle,
          ]}
        />
        <Text style={[style.optionText, labelStyle]}>{option.label}</Text>
      </TouchableOpacity>
    </View>
  );
}

const style = StyleSheet.create({
  optionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  radioCircle: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledCircle: {
    // borderColor: $config.FONT_COLOR,
  },
  radioFilled: {
    height: 14,
    width: 14,
    borderRadius: 7,
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
  optionText: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.normal,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    lineHeight: 24,
    marginLeft: 10,
  },
});
