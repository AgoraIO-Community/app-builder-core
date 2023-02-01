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

import React, {useContext, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {MaxVideoView} from '../../../agora-rn-uikit';
import PreCallLocalMute from './LocalMute';
import {
  LocalContext,
  PermissionState,
  ImageIcon as UiKitImageIcon,
} from '../../../agora-rn-uikit';
import {useRender} from 'customization-api';
import {usePreCall} from './usePreCall';
import ImageIcon from '../../atoms/ImageIcon';
import ThemeConfig from '../../theme';
import Spacer from '../../atoms/Spacer';
import {isMobileUA, isWebInternal, useResponsive} from '../../utils/common';

const Fallback = () => {
  const {isCameraAvailable, isMicAvailable} = usePreCall();
  const local = useContext(LocalContext);
  const requestCameraAndAudioPermission = () => {
    try {
      const URL =
        'https://support.google.com/chrome/answer/2693767?hl=en&co=GENIE.Platform%3DDesktop';
      if (isWebInternal()) {
        window.open(URL, '_blank');
      } else {
        Linking.openURL(URL);
      }
    } catch (error) {
      console.error(`Couldn't open the support url`);
    }
  };
  const styles = useStyles();
  return (
    <View style={styles.fallbackRootContainer}>
      {isCameraAvailable ||
      ($config.AUDIO_ROOM && isMicAvailable) ||
      local.permissionStatus === PermissionState.NOT_REQUESTED ||
      local.permissionStatus === PermissionState.REQUESTED ? (
        <View style={styles.avatar}>
          <UiKitImageIcon name={'profile'} />
        </View>
      ) : (
        <View style={styles.fallbackContainer}>
          <Text style={styles.infoText1}>
            Can’t Find Your{$config.AUDIO_ROOM ? ' Microphone' : ' Camera'}
          </Text>
          <Text style={styles.infoText2}>
            Check your system settings to make sure that a
            {$config.AUDIO_ROOM ? ' microphone' : ' camera'} is available. If
            not, plug one in and restart your browser.
          </Text>
          <Spacer size={33} />
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignSelf: 'center',
            }}
            onPress={() => {
              requestCameraAndAudioPermission();
            }}>
            <Text style={styles.retryBtn}>Learn More</Text>
            <Spacer horizontal={true} size={4} />
            <View style={{alignSelf: 'center'}}>
              <ImageIcon
                iconType="plain"
                name={'link-share'}
                tintColor={$config.PRIMARY_ACTION_BRAND_COLOR}
              />
            </View>
          </TouchableOpacity>
          <Spacer size={23} />
        </View>
      )}
    </View>
  );
};

const VideoPreview = () => {
  const {renderList, activeUids} = useRender();

  const [maxUid] = activeUids;

  if (!maxUid) {
    return null;
  }
  const styles = useStyles();
  return (
    <View style={[styles.container]}>
      <View
        style={{
          flex: 1,
        }}>
        <MaxVideoView
          user={renderList[maxUid]}
          key={maxUid}
          fallback={Fallback}
          containerStyle={{
            minHeight: 200,
            width: '100%',
            height: '100%',
            // borderTopLeftRadius: 4,
            // borderTopRightRadius: 4,
          }}
        />
      </View>
      <PreCallLocalMute isMobileView={isMobileUA() ? true : false} />
    </View>
  );
};
export default VideoPreview;

const useStyles = () => {
  const getResponsiveValue = useResponsive();
  return StyleSheet.create({
    infoText1: {
      fontFamily: ThemeConfig.FontFamily.sansPro,
      fontWeight: '700',
      fontSize: 20,
      textAlign: 'center',
      color: $config.FONT_COLOR,
      paddingTop: 24,
      paddingBottom: 12,
      paddingHorizontal: 10,
    },
    infoText2: {
      fontFamily: ThemeConfig.FontFamily.sansPro,
      fontWeight: '400',
      fontSize: ThemeConfig.FontSize.small,
      textAlign: 'center',
      color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.disabled,
      paddingHorizontal: getResponsiveValue(48),
    },
    fallbackRootContainer: {
      flex: 1,
      backgroundColor: $config.VIDEO_AUDIO_TILE_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
      // borderTopLeftRadius: 4,
      // borderTopRightRadius: 4,
    },
    fallbackContainer: {
      minHeight: 200,
      maxWidth: 440,
      backgroundColor: $config.CARD_LAYER_4_COLOR,
      borderRadius: ThemeConfig.BorderRadius.large,
      justifyContent: 'center',
      alignItems: 'center',
      margin: 40,
    },
    retryBtn: {
      fontFamily: ThemeConfig.FontFamily.sansPro,
      fontWeight: '600',
      fontSize: ThemeConfig.FontSize.normal,
      color: $config.PRIMARY_ACTION_BRAND_COLOR,
      alignSelf: 'center',
    },
    container: {
      flex: 1,
      position: 'relative',
      justifyContent: 'space-between',
      overflow: 'hidden',
    },
    avatar: {
      width: 100,
      height: 100,
      margin: 40,
    },
  });
};
