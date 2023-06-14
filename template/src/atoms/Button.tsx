import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  Image,
  StyleSheet,
  TextProps,
} from 'react-native';
import ThemeConfig from '../theme';

type BadgeProps =
  | React.Component
  | {
      color: string;
      text: string;
    };

interface ButtonBase {
  icon?: string;
  text?: string;
  onClick: () => void;
  onHover?: () => void;
  tooltip?: boolean | string | React.ComponentType;
  showTooltip?: 'hover' | 'click';
  badge?: BadgeProps;
  color: string;
  backgroundColor: string;
  overlayType: 'display' | 'brighten' | 'fixed';
  disabled: boolean | ['onClick', 'onHover'];
}

interface RegularButton extends ButtonBase {
  variant: 'primary' | 'secondary';
  hideIconText?: never;
}

interface IconButton extends ButtonBase {
  variant: 'iconPrimary' | 'iconSecondary';
  hideIconText: boolean;
}

export type ButtonProps = IconButton | RegularButton;

const Button = (props: ButtonProps) => {
  const {icon, text, variant} = props;
  if (!icon && !text) {
    return null;
  }

  let style: TouchableOpacityProps['style'] = [];
  let textStyle: TextProps['style'] = [];
  if (variant === 'primary') {
    style.push(buttonStyles.primaryButtonContainer);
    textStyle.push(buttonStyles.primaryButtonText);
  }

  return (
    <TouchableOpacity style={style}>
      {icon ? <Image source={{uri: icon}}></Image> : <></>}
      {text ? <Text style={textStyle}>{text}</Text> : <></>}
    </TouchableOpacity>
  );
};

export default Button;

const buttonStyles = StyleSheet.create({
  primaryButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 52,
    paddingVertical: 18,
    borderRadius: ThemeConfig.BorderRadius.large,
    minWidth: 250,
  },
  primaryButtonText: {
    color: $config.PRIMARY_ACTION_TEXT_COLOR,
    fontSize: ThemeConfig.FontSize.medium,
    fontWeight: '700',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    textTransform: 'uppercase',
  },
});
