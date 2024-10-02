import {
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  StyleProp,
  TextStyle,
} from 'react-native';
import React from 'react';
import {
  hexadecimalTransparency,
  ThemeConfig,
  $config,
  ImageIcon,
} from 'customization-api';

interface Props {
  option: {
    label: string;
    value: string;
  };
  checked: boolean;
  onChange: (option: string) => void;
  labelStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  filledColor?: string;
  tickColor?: string;
}
export default function BaseRadioButton(props: Props) {
  const {
    option,
    checked,
    onChange,
    disabled,
    labelStyle = {},
    filledColor = '',
    tickColor = '',
  } = props;
  return (
    <TouchableOpacity
      id={option.value}
      style={[style.optionsContainer, disabled && style.disabledContainer]}
      onPress={() => !disabled && onChange(option.value)}>
      <View style={[style.radioCircle, disabled && style.disabledCircle]}>
        {checked && (
          <View
            style={[
              style.radioFilled,
              filledColor?.trim() ? {backgroundColor: filledColor} : {},
            ]}>
            <ImageIcon
              iconType="plain"
              name={'tick'}
              iconSize={9}
              tintColor={
                tickColor
                  ? tickColor?.trim()
                  : $config.PRIMARY_ACTION_BRAND_COLOR
              }
            />
          </View>
        )}
      </View>
      <Text style={[style.optionText, labelStyle]}>{option.label}</Text>
    </TouchableOpacity>
  );
}

const style = StyleSheet.create({
  optionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 12,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  radioCircle: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: $config.FONT_COLOR,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledCircle: {
    borderColor: $config.FONT_COLOR + hexadecimalTransparency['50%'],
  },
  radioFilled: {
    height: 22,
    width: 22,
    borderRadius: 12,
    backgroundColor: $config.FONT_COLOR,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
