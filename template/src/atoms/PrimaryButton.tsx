/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React, {useContext} from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  Image,
  View,
  ViewStyle,
} from 'react-native';
import ThemeConfig from '../theme';
import {primaryButton, primaryButtonText} from '../../theme.json';
import {IconsInterface} from '../atoms/CustomIcon';
import ImageIcon from '../atoms/ImageIcon';

export interface PrimaryButtonProps extends PressableProps {
  text?: string;
  iconName?: keyof IconsInterface;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export default function PrimaryButton(props: PrimaryButtonProps) {
  const {children, iconName, textStyle, containerStyle, ...otherProps} = props;
  return (
    <Pressable
      style={[
        styles.container,
        props?.disabled
          ? {backgroundColor: $config.SEMANTIC_NETRUAL}
          : {backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR},
        containerStyle ? containerStyle : {},
      ]}
      {...otherProps}>
      {iconName && (
        <View>
          <ImageIcon
            name={iconName}
            tintColor={$config.PRIMARY_ACTION_TEXT_COLOR}
          />
        </View>
      )}
      {props.text && (
        <Text style={[styles.text, textStyle ? textStyle : {}]}>
          {props.text}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primaryButton,
  primaryButtonText,
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 52,
    paddingVertical: 18,
    borderRadius: 12,
    minWidth: 250,
  },
  text: {
    color: $config.PRIMARY_ACTION_TEXT_COLOR,
    fontSize: ThemeConfig.FontSize.medium,
    fontWeight: '700',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    paddingLeft: 8,
    textTransform: 'uppercase',
  },
});
