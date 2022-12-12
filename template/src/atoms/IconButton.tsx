import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  Text,
  View,
} from 'react-native';
import ImageIcon, {ImageIconProps} from './ImageIcon';
import CustomIcon from '../atoms/CustomIcon';
import {isWeb} from '../utils/common';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';

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
    <PlatformWrapper onPress={props.onPress} disabled={props.disabled}>
      <View style={props.style}>
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
      </View>
    </PlatformWrapper>
  );
};

const PlatformWrapper = ({children, ...props}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  return isWeb() ? (
    <div
      style={{
        backgroundColor: isHovered
          ? $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['10%']
          : 'transparent',

        cursor: isHovered ? 'pointer' : 'auto',
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 8,
        paddingBottom: 8,
        borderRadius: 8,
      }}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      onClick={(e) => {
        e.preventDefault();
        props?.disabled ? () => {} : props?.onPress && props.onPress();
      }}>
      {children}
    </div>
  ) : (
    <TouchableOpacity {...props}>{children}</TouchableOpacity>
  );
};

export default IconButton;
