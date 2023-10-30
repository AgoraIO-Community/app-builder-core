import React, {useContext, useEffect, useRef, useState} from 'react';
import useLayoutsData from './useLayoutsData';
import {isArray, isValidReactComponent} from '../../utils/common';
import {useLayout} from '../../utils/useLayout';
import {useContent} from 'customization-api';
import {getGridLayoutName} from './DefaultLayouts';
import {DispatchContext} from '../../../agora-rn-uikit';

const VideoComponent = () => {
  const {dispatch} = useContext(DispatchContext);
  const [layout, setLayoutIndex] = useState(0);
  const layoutsData = useLayoutsData();
  const {currentLayout, setLayout} = useLayout();
  const {activeUids, pinnedUid} = useContent();
  const currentLayoutRef = useRef(currentLayout);
  const gridLayoutName = getGridLayoutName();
  useEffect(() => {
    if (activeUids && activeUids.length === 1) {
      if (pinnedUid) {
        dispatch({type: 'UserPin', value: [0]});
        dispatch({type: 'UserSecondaryPin', value: [0]});
      }
      if (currentLayoutRef.current != gridLayoutName) {
        setLayout(gridLayoutName);
      }
    }
  }, [activeUids]);

  useEffect(() => {
    currentLayoutRef.current = currentLayout;
    if (isArray(layoutsData)) {
      let index = layoutsData.findIndex(item => item.name === currentLayout);
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
