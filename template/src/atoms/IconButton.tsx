import React from 'react';
import {
  ViewStyle,
  TextStyle,
  Text,
  StyleSheet,
  Pressable,
  PressableProps,
  TouchableOpacity,
} from 'react-native';
import ImageIcon, {ImageIconProps} from './ImageIcon';
import {isMobileUA, isWebInternal} from '../utils/common';
import ToolTip from './Tooltip';
import ThemeConfig from '../theme';

export interface BtnTextProps {
  textStyle?: TextStyle;
  textColor?: string;
  text?: string;
}

export interface IconButtonProps {
  setRef?: (ref: any) => void;
  onPress?: PressableProps['onPress'];
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
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  isClickable?: boolean;
}

const IconButton = (props: IconButtonProps) => {
  return (
    <ButtonWrapper {...props}>
      <ImageIcon {...props.iconProps} isHovered={props?.isToolTipVisible} />
      {props?.btnTextProps?.text ? (
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
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
    </ButtonWrapper>
  );
};

const ButtonWrapper = ({children, ...props}) => {
  const isMobileView = isMobileUA();
  return isMobileView ? (
    <TouchableOpacity
      ref={(ref) => props?.setRef && props.setRef(ref)}
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
      {children}
    </TouchableOpacity>
  ) : (
    <Pressable
      ref={(ref) => props?.setRef && props.setRef(ref)}
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
      {children}
    </Pressable>
  );
};

const PlatformWrapper = ({children, ...props}) => {
  return isWebInternal() ? (
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
  const {placement = 'top', isClickable = false} = props;
  if (props?.toolTipMessage) {
    return (
      <ToolTip
        isClickable={isClickable}
        toolTipMessage={props.toolTipMessage}
        placement={placement}
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
    marginTop: 4,
  },
});
