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
import {View} from 'react-native';
import {isMobileUA, isWebInternal, useIsSmall} from '../../utils/common';
import CommonStyles from '../CommonStyles';
import {getGridLayoutName} from '../../pages/video-call/DefaultLayouts';
import useCaptionWidth from '../../subComponents/caption/useCaptionWidth';

import {useLayout} from '../../utils/useLayout';
import {useSidePanel} from '../../utils/useSidePanel';
import {SidePanelType} from '../../subComponents/SidePanelEnum';

import BreakoutRoomView from './ui/BreakoutRoomView';

const BreakoutRoomPanel = () => {
  const {setSidePanel} = useSidePanel();
  const isSmall = useIsSmall();
  const {currentLayout} = useLayout();
  const {transcriptHeight} = useCaptionWidth();

  return (
    <View
      testID="videocall-breakout-room"
      style={[
        isMobileUA()
          ? //mobile and mobile web
            CommonStyles.sidePanelContainerNative
          : isSmall()
          ? // desktop minimized
            CommonStyles.sidePanelContainerWebMinimzed
          : // desktop maximized
            CommonStyles.sidePanelContainerWeb,
        isWebInternal() && !isSmall() && currentLayout === getGridLayoutName()
          ? {marginTop: 4}
          : {},
        //@ts-ignore
        transcriptHeight && !isMobileUA() && {height: transcriptHeight},
      ]}>
      <BreakoutRoomView
        closeSidePanel={() => {
          setSidePanel(SidePanelType.None);
        }}
      />
    </View>
  );
};

export default BreakoutRoomPanel;
