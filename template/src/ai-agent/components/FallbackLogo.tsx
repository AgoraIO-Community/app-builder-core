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
import {View, StyleSheet} from 'react-native';
import {UserAvatar} from 'customization-api';

export default function FallbackLogo(
  name: string,
  isActiveSpeaker?: boolean,
  hideAvatar?: boolean,
  isMax?: boolean,
  avatarSize?: number,
) {
  const iconSize = Math.min(avatarSize, 100);
  const textSize = Math.min(avatarSize * 0.35, 32);
  return (
    <View style={[styles.container]}>
      {!hideAvatar ? (
        <UserAvatar
          name={name}
          containerStyle={[
            {
              width: iconSize,
              height: iconSize,
              borderRadius: iconSize / 2,
            },

            {
              backgroundColor: isActiveSpeaker
                ? $config.PRIMARY_ACTION_BRAND_COLOR
                : $config.VIDEO_AUDIO_TILE_AVATAR_COLOR,
            },
          ]}
          textStyle={[
            styles.textStyle,
            {fontSize: textSize, lineHeight: textSize},
          ]}
        />
      ) : (
        <></>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: $config.VIDEO_AUDIO_TILE_COLOR,
    justifyContent: 'center',
  },
  avatarBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarBgSmall: {
    width: 60,
    height: 60,
  },
  avatarBgMobileUA: {
    width: 45,
    height: 45,
  },
  textStyle: {
    fontSize: 32,
    lineHeight: 32,
    fontWeight: '600',
    color: $config.CARD_LAYER_1_COLOR,
  },
});
