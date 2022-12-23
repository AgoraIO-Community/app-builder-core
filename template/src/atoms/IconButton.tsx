import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import ImageIcon, {ImageIconProps} from './ImageIcon';
import {isWeb} from '../utils/common';
import ToolTip from './Tooltip';
import ThemeConfig from '../theme';

export interface BtnTextProps {
  textStyle?: TextStyle;
  textColor?: string;
  text?: string;
}

export interface IconButtonProps {
  onPress?: TouchableOpacityProps['onPress'];
  disabled?: boolean;
  containerStyle?: ViewStyle;
  btnTextProps?: BtnTextProps;
  iconProps: ImageIconProps;
  toolTipMessage?: string;
  isToolTipVisible?: boolean;
  setToolTipVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  isOnActionSheet?: boolean;
  hoverEffect?: boolean;
  hoverEffectStyle?: ViewStyle;
}

const IconButton = (props: IconButtonProps) => {
  return (
    <TouchableOpacity
      style={
        !props.isOnActionSheet && [
          styles.containerStyle,
          props?.containerStyle,
          props?.hoverEffect && props?.isToolTipVisible
            ? props?.hoverEffectStyle
            : {},
        ]
      }
      onPress={props.onPress}
      disabled={props.disabled}>
      <ImageIcon {...props.iconProps} isHovered={props?.isToolTipVisible} />
      {props?.btnTextProps?.text ? (
        <Text
          style={[
            styles.btnTextStyle,
            props?.btnTextProps?.textColor
              ? {color: props.btnTextProps.textColor}
              : {},
            props?.btnTextProps.textStyle,
          ]}>
          {props.btnTextProps.text}
        </Text>
      ) : (
        <></>
      )}
    </TouchableOpacity>
  );
};

const PlatformWrapper = ({children, ...props}) => {
  return isWeb() ? (
    <div
      onMouseEnter={() => {
        props?.setIsHovered(true);
      }}
      onMouseLeave={() => {
        props?.setIsHovered(false);
      }}>
      {children}
    </div>
  ) : (
    children
  );
};

const IconButtonWithToolTip = (props: IconButtonProps) => {
  const [isHovered, setIsHovered] = React.useState(false);
  if (props?.toolTipMessage) {
    return (
      <ToolTip
        toolTipMessage={props.toolTipMessage}
        renderContent={(isToolTipVisible, setToolTipVisible) => {
          return (
            <IconButton
              {...props}
              isToolTipVisible={isToolTipVisible}
              setToolTipVisible={setToolTipVisible}
            />
          );
        }}></ToolTip>
    );
  }
  return (
    <PlatformWrapper isHovered={isHovered} setIsHovered={setIsHovered}>
      <IconButton
        {...props}
        isToolTipVisible={isHovered}
        setToolTipVisible={setIsHovered}
      />
    </PlatformWrapper>
  );
};

export default IconButtonWithToolTip;

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  btnTextStyle: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: ThemeConfig.FontSize.tiny,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 5,
  },
});
