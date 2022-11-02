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
import {View, StyleSheet, Image, Text, TouchableOpacity} from 'react-native';
import {MaxVideoView} from '../../../agora-rn-uikit';
import PreCallLocalMute from './LocalMute';
import {LocalContext, PermissionState} from '../../../agora-rn-uikit';
//@ts-ignore
import imgUrl from '../../assets/avatar.png';
import {useRender} from 'customization-api';
import {usePreCall} from './usePreCall';

const Fallback = () => {
  const {isCameraAvailable} = usePreCall();
  const local = useContext(LocalContext);
  const requestCameraAndAudioPermission = () => {};
  return (
    <View style={styles.fallbackRootContainer}>
      {isCameraAvailable ||
      local.permissionStatus === PermissionState.NOT_REQUESTED ? (
        <Image
          source={{uri: imgUrl}}
          style={styles.avatar}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.fallbackContainer}>
          <Text style={styles.infoText1}>Can’t Find Your Camera</Text>
          <Text style={styles.infoText2}>
            Check your system settings to make sure that a camera is available.
            If not, plug one in and restart your browser.
          </Text>
          <TouchableOpacity
            style={{flex: 1, paddingBottom: 24}}
            onPress={() => {
              requestCameraAndAudioPermission();
            }}>
            <Text style={styles.retryBtn}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const VideoPreview: React.FC = () => {
  const {renderList, activeUids} = useRender();

  const [maxUid] = activeUids;

  if (!maxUid) {
    return null;
  }

  return (
    <View style={styles.container}>
      <MaxVideoView
        user={renderList[maxUid]}
        key={maxUid}
        fallback={Fallback}
      />
      <PreCallLocalMute />
    </View>
  );
};
export default VideoPreview;

const styles = StyleSheet.create({
  infoText1: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 25,
    textAlign: 'center',
    color: '#040405',
    paddingTop: 24,
    paddingBottom: 12,
  },
  infoText2: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    color: '#2B2C33',
    paddingHorizontal: 48,
  },
  fallbackRootContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackContainer: {
    flex: 1,
    maxHeight: '34%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryBtn: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 20,
    color: '#099DFD',
    paddingVertical: 32,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    position: 'relative',
  },
  avatar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 'auto',
    width: 100,
    height: 100,
    zIndex: 99,
  },
});
