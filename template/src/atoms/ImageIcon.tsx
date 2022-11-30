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
import CustomIcon, {IconsInterface} from '../atoms/CustomIcon';

export interface ImageIconProps {
  tintColor?: string;
  customSize?: {
    width: number | string;
    height: number | string;
  };
  name: keyof IconsInterface;
  iconSize?: 'normal' | 'medium' | 'small';
}

const ImageIcon = (props: ImageIconProps) => {
  const {name, iconSize = 'normal', customSize, tintColor} = props;
  let iconSizeLocal = {width: 24, height: 24};
  if (iconSize === 'medium') {
    iconSizeLocal = {
      width: 20,
      height: 20,
    };
  } else if (iconSize === 'small') {
    iconSizeLocal = {
      width: 16,
      height: 16,
    };
  } else {
  }
  return (
    <CustomIcon
      name={name}
      color={tintColor}
      size={customSize?.width ? customSize.width : iconSizeLocal.width}
    />
  );
};

export default ImageIcon;
