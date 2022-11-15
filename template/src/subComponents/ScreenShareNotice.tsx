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

import {ImageIcon, PropsContext, UidType} from '../../agora-rn-uikit';
import React, {useContext} from 'react';
import {StyleSheet, View, Text, TouchableOpacity, Image} from 'react-native';
import {useString} from '../utils/useString';
import {useScreenshare} from './screenshare/useScreenshare';
/**
 *
 * @param uid - uid of the user
 * @returns This component display overlay message "Screen sharing is active now" if user started sharing the screen.
 * why its needed : To prevent screensharing tunneling effect
 *
 */
function ScreenShareNotice({uid}: {uid: UidType}) {
  //commented for v1 release
  // const screensharingActiveOverlayLabel = useString(
  //   'screensharingActiveOverlayLabel',
  // )();
  const {stopUserScreenShare} = useScreenshare();
  const screensharingActiveOverlayLabel = 'You are sharing your screen';
  const {rtcProps} = useContext(PropsContext);
  return uid === rtcProps?.screenShareUid ? (
    <View style={styles.screenSharingMessageContainer}>
      <Text style={styles.screensharingMessage}>
        {screensharingActiveOverlayLabel}
      </Text>
      <TouchableOpacity
        style={styles.btnContainer}
        onPress={() => stopUserScreenShare()}>
        <View style={styles.iconContainer}>
          <ImageIcon name={'closeRounded'} style={styles.iconStyle} />
        </View>
        <View style={styles.btnTextContainer}>
          <Text style={styles.btnText}>Stop Sharing</Text>
        </View>
      </TouchableOpacity>
    </View>
  ) : null;
}

const styles = StyleSheet.create({
  iconContainer: {
    marginVertical: 12,
    marginLeft: 16,
    marginRight: 12,
  },
  iconStyle: {
    width: 24,
    height: 24,
  },
  btnContainer: {
    alignSelf: 'center',
    backgroundColor: '#FF414D',
    borderRadius: 8,
    height: 40,
    maxWidth: 129,
    flexDirection: 'row',
  },
  btnTextContainer: {
    marginVertical: 12,
    marginRight: 16,
  },
  btnText: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  screenSharingMessageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 15,
  },
  screensharingMessage: {
    alignSelf: 'center',
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 32,
    lineHeight: 40,
    color: '#FFFFFF',
    paddingBottom: 24,
  },
});

export default ScreenShareNotice;
