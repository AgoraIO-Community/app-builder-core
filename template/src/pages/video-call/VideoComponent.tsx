import React, {useContext, useEffect, useState} from 'react';
import {View, StyleSheet, Pressable, Text} from 'react-native';
import useLayoutsData from './useLayoutsData';
import {isArray, isDesktop, isValidReactComponent} from '../../utils/common';
import {useLayout} from '../../utils/useLayout';
import {useContent} from 'customization-api';
import {getGridLayoutName} from './DefaultLayouts';
import {DispatchContext} from '../../../agora-rn-uikit';
import MeetingInfoGridTile from '../../components/meeting-info-invite/MeetingInfoGridTile';

const VideoComponent = () => {
  const {dispatch} = useContext(DispatchContext);
  const [layout, setLayoutIndex] = useState(0);
  const layoutsData = useLayoutsData();
  const {currentLayout, setLayout} = useLayout();
  const {activeUids, pinnedUid} = useContent();

  useEffect(() => {
    if (activeUids && activeUids.length === 1) {
      if (pinnedUid) {
        dispatch({type: 'UserPin', value: [0]});
      }
      const gridLayoutName = getGridLayoutName();
      if (currentLayout !== gridLayoutName && layoutsData?.length <= 2) {
        setLayout(gridLayoutName);
      }
    }
  }, [activeUids]);

  useEffect(() => {
    if (isArray(layoutsData)) {
      let index = layoutsData.findIndex((item) => item.name === currentLayout);
      if (index >= 0) {
        setLayoutIndex(index);
      }
    }
  }, [currentLayout]);

  if (
    layoutsData &&
    layoutsData[layout] &&
    isValidReactComponent(layoutsData[layout].component)
  ) {
    const CurrentLayout = layoutsData[layout].component;
    return (
      <View style={{flex: 1, flexDirection: 'row'}}>
        <CurrentLayout renderData={activeUids} />
        {activeUids.length === 1 && <MeetingInfoGridTile />}
      </View>
    );
  } else {
    return <></>;
  }
};
export default VideoComponent;
