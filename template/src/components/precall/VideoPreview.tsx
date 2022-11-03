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

import {useRender} from 'customization-api';
import React from 'react';
import {View} from 'react-native';
import {MaxVideoView} from '../../../agora-rn-uikit';

const VideoPreview: React.FC = () => {
  const {renderList, activeUids} = useRender();

  const [maxUid] = activeUids;

  if (!maxUid) {
    return null;
  }

  return (
    <View style={{borderRadius: 10, flex: 1}}>
      <MaxVideoView user={renderList[maxUid]} key={maxUid} />
    </View>
  );
};
export default VideoPreview;
