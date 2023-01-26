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
import React, {useState} from 'react';
import {Image, Text, View, StyleSheet, Dimensions} from 'react-native';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import UserAvatar from '../atoms/UserAvatar';
import AnimatedRings from '../atoms/AnimatedRings';
import {useLayout, useRender} from 'customization-api';
import {
  getGridLayoutName,
  getPinnedLayoutName,
} from '../pages/video-call/DefaultLayouts';

export default function FallbackLogo(
  name: string,
  isActiveSpeaker?: boolean,
  hideAvatar?: boolean,
  isMax?: boolean,
) {
  const {activeUids} = useRender();
  const {currentLayout} = useLayout();

  return (
    <View style={[styles.container]}>
      {!hideAvatar ? (
        // <View
        //   style={[
        //     styles.activeSpeakerBg,
        //     (currentLayout === getGridLayoutName() && activeUids.length > 9) ||
        //     (currentLayout === getPinnedLayoutName() && !isMax)
        //       ? styles.activeSpeakerBgSmall
        //       : {},
        //     {
        //       backgroundColor: isActiveSpeaker
        //         ? $config.PRIMARY_ACTION_BRAND_COLOR +
        //           hexadecimalTransparency['15%']
        //         : 'transparent',
        //     },
        //   ]}>
        <UserAvatar
          name={name}
          containerStyle={[
            styles.avatarBg,
            (currentLayout === getGridLayoutName() && activeUids.length > 9) ||
            (currentLayout === getPinnedLayoutName() && !isMax)
              ? styles.avatarBgSmall
              : {},
            {
              backgroundColor: isActiveSpeaker
                ? $config.PRIMARY_ACTION_BRAND_COLOR
                : $config.VIDEO_AUDIO_TILE_AVATAR_COLOR,
            },
          ]}
          textStyle={styles.textStyle}
        />
      ) : (
        //</View>
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
  activeSpeakerBg: {
    width: 140,
    height: 140,
    borderRadius: 80,
    alignSelf: 'center',
    justifyContent: 'center',
    color: $config.VIDEO_AUDIO_TILE_COLOR,
  },
  activeSpeakerBgSmall: {
    width: 80,
    height: 80,
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
  textStyle: {
    fontSize: 32,
    lineHeight: 32,
    fontWeight: '600',
    color: $config.CARD_LAYER_1_COLOR,
  },
});
