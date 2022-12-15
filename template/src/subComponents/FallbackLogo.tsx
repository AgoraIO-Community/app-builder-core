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
import {Image, Text, View, StyleSheet} from 'react-native';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import UserAvatar from '../atoms/UserAvatar';

export default function FallbackLogo(name: string, isActiveSpeaker?: boolean) {
  return (
    <View style={[styles.container]}>
      <View
        style={[
          styles.activeSpeakerBg,
          {
            backgroundColor: isActiveSpeaker
              ? $config.PRIMARY_ACTION_BRAND_COLOR +
                hexadecimalTransparency['15%']
              : 'transparent',
          },
        ]}>
        <UserAvatar
          name={name}
          containerStyle={[
            styles.avatarBg,
            {
              backgroundColor: isActiveSpeaker
                ? $config.PRIMARY_ACTION_BRAND_COLOR
                : $config.SEMANTIC_NETRUAL,
            },
          ]}
          textStyle={styles.textStyle}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: $config.VIDEO_AUDIO_TILE_COLOR,
    justifyContent: 'center',
    borderRadius: 8,
  },
  activeSpeakerBg: {
    width: 140,
    height: 140,
    borderRadius: 80,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  avatarBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  textStyle: {
    fontSize: 32,
    lineHeight: 32,
    fontWeight: '600',
    color: $config.PRIMARY_ACTION_TEXT_COLOR,
  },
});
