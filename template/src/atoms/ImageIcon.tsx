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
import React from 'react';
import {ViewStyle, View, StyleSheet} from 'react-native';
import CustomIcon, {IconsInterface} from '../atoms/CustomIcon';
import {ImageIcon as UIKitImageIcon} from '../../agora-rn-uikit';
export interface ImageIconProps {
  tintColor?: string;
  name: keyof IconsInterface;
  iconSize?: number;
  iconContainerStyle?: ViewStyle;
  iconBackgroundColor?: string;
  base64?: boolean;
  base64TintColor?: string;
  iconType?: 'round' | 'plain';
}

const ImageIcon = (props: ImageIconProps) => {
  const {
    name,
    iconSize = 24,
    tintColor,
    base64 = false,
    base64TintColor = '',
    iconType = 'round',
  } = props;
  return (
    <View
      style={[
        styles.iconContainerStyle,
        iconType === 'round'
          ? props?.iconBackgroundColor
            ? {backgroundColor: props.iconBackgroundColor}
            : {}
          : {backgroundColor: 'transparent', borderRadius: 0, padding: 0},
        props?.iconContainerStyle,
      ]}>
      {base64 ? (
        <UIKitImageIcon
          tintColor={base64TintColor}
          name={name}
          style={{width: iconSize, height: iconSize}}
        />
      ) : (
        <CustomIcon name={name} color={tintColor} size={iconSize} />
      )}
    </View>
  );
};

export default ImageIcon;

const styles = StyleSheet.create({
  iconContainerStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignSelf: 'center',
    padding: 12,
    borderRadius: 50,
    backgroundColor: $config.ICON_BG_COLOR,
  },
});
