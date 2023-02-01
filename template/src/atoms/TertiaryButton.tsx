import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import React, {useState} from 'react';
import ThemeConfig from '../theme';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import {isWebInternal} from '../utils/common';

interface ButtonProps extends TouchableOpacityProps {
  setRef?: (ref: any) => void;
  text?: string;
  children?: React.ReactNode;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const TertiaryButton = (props: ButtonProps) => {
  const {text, ...rest} = props;
  const [isHovered, setIsHovered] = useState();
  return (
    <PlatformWrapper setIsHovered={setIsHovered}>
      <TouchableOpacity
        ref={(ref) => props?.setRef && props.setRef(ref)}
        style={[
          styles.container,
          isHovered
            ? {
                backgroundColor:
                  $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['15%'],
              }
            : {},
          props?.containerStyle,
        ]}
        {...rest}>
        <Text style={[styles.text, props?.textStyle]}>{text}</Text>
      </TouchableOpacity>
    </PlatformWrapper>
  );
};
const PlatformWrapper = ({children, setIsHovered}) => {
  return isWebInternal() ? (
    <div
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}>
      {children}
    </div>
  ) : (
    children
  );
};
export default TertiaryButton;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: $config.SECONDARY_ACTION_COLOR,
    borderRadius: ThemeConfig.BorderRadius.small,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: $config.SECONDARY_ACTION_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: ThemeConfig.FontSize.small,
    fontWeight: '600',
  },
});
