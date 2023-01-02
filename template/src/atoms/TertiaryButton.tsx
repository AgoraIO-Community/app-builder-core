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
import {isWeb} from 'customization-api';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';

interface ButtonProps extends TouchableOpacityProps {
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
  return isWeb() ? (
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
    borderRadius: 4,
    justifyContent: 'center',
  },
  text: {
    color: $config.SECONDARY_ACTION_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: ThemeConfig.FontSize.small,
    fontWeight: '600',
    textAlign: 'center',
  },
});
