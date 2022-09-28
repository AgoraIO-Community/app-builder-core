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
import {Image, Text, View} from 'react-native';
import UserAvatar from '../atoms/UserAvatar';

export default function FallbackLogo(name: string) {
  const containerStyle = {
    backgroundColor: $config.PRIMARY_COLOR,
    width: 100,
    height: 100,
    borderRadius: 50,
  };
  const textStyle = {
    fontSize: 32,
    lineHeight: 32,
    fontWeight: 600,
    color: $config.SECONDARY_FONT_COLOR,
  };
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignContent: 'center',
        borderRadius: 12,
      }}>
      <UserAvatar
        name={name}
        containerStyle={containerStyle}
        textStyle={textStyle}
      />
    </View>
  );
}
