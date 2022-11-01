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
import {primaryButton, primaryButtonText} from '../../theme.json';
import ColorContext from '../components/ColorContext';

export interface PrimaryButtonProps extends PressableProps {
  text?: string;
  icon?: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export default function PrimaryButton(props: PrimaryButtonProps) {
  const {primaryColor} = useContext(ColorContext);
  const {children, icon, textStyle, containerStyle, ...otherProps} = props;
  return (
    <Pressable
      style={[
        styles.container,
        {backgroundColor: props.disabled ? '#BABABA' : primaryColor},
        containerStyle ? containerStyle : {},
      ]}
      {...otherProps}>
      {icon && <Image style={styles.icon} source={{uri: icon}} />}
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
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 12,
    minWidth: 250,
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Source Sans Pro',
  },
});
