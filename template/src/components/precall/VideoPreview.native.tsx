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

import {useRender, useRtc} from 'customization-api';
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {MaxVideoView} from '../../../agora-rn-uikit';
import PreCallLocalMute from './LocalMute';
import {ImageIcon as UiKitImageIcon} from '../../../agora-rn-uikit';

const VideoPreview: React.FC = () => {
  const rtc = useRtc();
  rtc?.RtcEngine?.startPreview();

  const {renderList, activeUids} = useRender();
  const [maxUid] = activeUids;

  if (!maxUid) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={{flex: 1}}>
        <MaxVideoView
          user={renderList[maxUid]}
          key={maxUid}
          fallback={Fallback}
          containerStyle={{
            width: '100%',
            height: '100%',
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        />
      </View>
      <PreCallLocalMute isMobileView={true} />
    </View>
  );
};
export default VideoPreview;

const Fallback = () => {
  return (
    <View style={styles.fallbackRootContainer}>
      <View style={styles.avatar}>
        {/*TODO fix ttf file <ImageIcon name="profile" customSize={{width: 100, height: 100}} /> */}
        <UiKitImageIcon name={'profile'} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    justifyContent: 'space-between',
  },
  avatar: {
    height: 100,
    width: 100,
  },
  fallbackRootContainer: {
    flex: 1,
    backgroundColor: $config.VIDEO_AUDIO_TILE_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
});
