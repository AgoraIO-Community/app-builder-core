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
import {View, StyleSheet, ScrollView} from 'react-native';
import {isMobileUA, useIsSmall} from '../utils/common';
import CommonStyles from './CommonStyles';
import useCaptionWidth from '../subComponents/caption/useCaptionWidth';
import {CustomSidePanelHeader} from '../pages/video-call/SidePanelHeader';

export interface CustomSidePanelViewInterface {
  name: string;
  title?: string;
  content: React.ComponentType;
  headerRightSlot?: React.ReactNode;
  onClose?: () => void;
  showHeader?: boolean;
}

const CustomSidePanelView = (props: CustomSidePanelViewInterface) => {
  const {
    content: CustomSidePanelContent,
    showHeader = true,
    name,
    title,
    headerRightSlot,
    onClose,
  } = props;
  const {transcriptHeight} = useCaptionWidth();
  const isSmall = useIsSmall();

  return (
    <View
      testID="custom-side-panel"
      style={[
        isMobileUA()
          ? //mobile and mobile web
            CommonStyles.sidePanelContainerNative
          : isSmall()
          ? // desktop minimized
            CommonStyles.sidePanelContainerWebMinimzed
          : // desktop maximized
            CommonStyles.sidePanelContainerWeb,
        //@ts-ignore
        transcriptHeight && !isMobileUA() && {height: transcriptHeight},
      ]}>
      {showHeader && (
        <CustomSidePanelHeader
          name={name}
          title={title}
          headerRightSlot={headerRightSlot}
          onClose={onClose}
        />
      )}
      <ScrollView contentContainerStyle={[style.bodyContainer]}>
        {CustomSidePanelContent ? <CustomSidePanelContent /> : <></>}
      </ScrollView>
    </View>
  );
};

const style = StyleSheet.create({
  bodyContainer: {
    flex: 1,
  },
});

export default CustomSidePanelView;
