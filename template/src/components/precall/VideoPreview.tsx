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

import {useFpe} from 'fpe-api';
import React from 'react';
import {View} from 'react-native';
import {isValidReactComponent} from '../../utils/common';
import {MaxVideoView} from '../../../agora-rn-uikit';
import useUserList from '../../utils/useUserList';

const VideoPreview: React.FC = () => {
  const {VideoPreviewAfterView, VideoPreviewBeforeView} = useFpe((data) => {
    let components: {
      VideoPreviewAfterView: React.ComponentType;
      VideoPreviewBeforeView: React.ComponentType;
    } = {
      VideoPreviewAfterView: React.Fragment,
      VideoPreviewBeforeView: React.Fragment,
    };
    if (
      data?.components?.precall &&
      typeof data?.components?.precall === 'object'
    ) {
      if (
        data?.components?.precall?.preview &&
        typeof data?.components?.precall?.preview === 'object'
      ) {
        if (
          data?.components?.precall?.preview?.before &&
          isValidReactComponent(data?.components?.precall?.preview?.before)
        ) {
          components.VideoPreviewBeforeView =
            data?.components?.precall?.preview?.before;
        }
        if (
          data?.components?.precall?.preview?.after &&
          isValidReactComponent(data?.components?.precall?.preview?.after)
        ) {
          components.VideoPreviewAfterView =
            data?.components?.precall?.preview?.after;
        }
      }
    }
    return components;
  });
  const {renderList, renderPosition} = useUserList();

  const [maxUid] = renderPosition;

  if (!maxUid) {
    return null;
  }

  return (
    <>
      <VideoPreviewBeforeView />
      <View style={{borderRadius: 10, flex: 1}}>
        <MaxVideoView uid={maxUid} user={renderList[maxUid]} key={maxUid} />
      </View>
      <VideoPreviewAfterView />
    </>
  );
};
export default VideoPreview;
