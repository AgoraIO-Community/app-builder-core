import React, {useEffect, useState} from 'react';
import useLayoutsData from './useLayoutsData';
import {isArray, isValidReactComponent} from '../../utils/common';
import {useLayout} from '../../utils/useLayout';
import {useRender, useRtc} from 'customization-api';
import {getGridLayoutName} from './DefaultLayouts';

const VideoComponent = () => {
  const {dispatch} = useRtc();
  const [layout, setLayoutIndex] = useState(0);
  const layoutsData = useLayoutsData();
  const {currentLayout, setLayout} = useLayout();
  const {activeUids, pinnedUid} = useRender();

  useEffect(() => {
    if (activeUids && activeUids.length === 1) {
      if (pinnedUid) {
        dispatch({type: 'UserPin', value: [0]});
      }
      const gridLayoutName = getGridLayoutName();
      if (currentLayout !== gridLayoutName) {
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
    return <CurrentLayout renderData={activeUids} />;
  } else {
    return <></>;
  }
};
export default VideoComponent;
