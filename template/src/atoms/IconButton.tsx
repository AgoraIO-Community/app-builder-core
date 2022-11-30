import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  Text,
} from 'react-native';
import ImageIcon, {ImageIconProps} from './ImageIcon';
import CustomIcon from '../atoms/CustomIcon';

export interface IconButtonProps {
  onPress?: TouchableOpacityProps['onPress'];
  style?: ViewStyle;
  styleText?: TextStyle;
  btnTextColor?: string;
  btnText?: string;
  disabled?: boolean;
  iconProps?: ImageIconProps;
}

const IconButton = (props: IconButtonProps) => {
  return (
    <TouchableOpacity
      style={props.style}
      disabled={props.disabled}
      onPress={props.onPress}>
      <ImageIcon {...props.iconProps} />
      {props?.btnText ? (
        <Text
          style={[
            {
              textAlign: 'center',
              marginTop: 5,
            },
            props?.btnTextColor ? {color: props.btnTextColor} : {},
            props?.styleText,
          ]}>
          {props.btnText}
        </Text>
      ) : (
        <></>
      )}
    </TouchableOpacity>
  );
};

export default IconButton;
