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
import {View, StyleSheet, Image} from 'react-native';
import {MaxVideoView} from '../../../agora-rn-uikit';
import PreCallLocalMute from './LocalMute';
import {ToggleState, LocalContext} from '../../../agora-rn-uikit';
//@ts-ignore
import imgUrl from '../../assets/avatar.png';
import {useRender} from 'customization-api';

const VideoPreview: React.FC = () => {
  const {renderList, activeUids} = useRender();
  const local = useContext(LocalContext);
  const isVideoEnabled = local.video === ToggleState.enabled;

  const [maxUid] = activeUids;

  if (!maxUid) {
    return null;
  }

  console.log(renderList[maxUid]);
  return (
    <View style={styles.container}>
      {!isVideoEnabled && (
        <Image
          source={{uri: imgUrl}}
          style={styles.avatar}
          resizeMode="contain"
        />
      )}

      <MaxVideoView user={renderList[maxUid]} key={maxUid} />
      <PreCallLocalMute />
    </View>
  );
};
export default VideoPreview;

const styles = StyleSheet.create({
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
