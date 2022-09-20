import React, {useEffect, useState} from 'react';
import useLayoutsData from './useLayoutsData';
import {isArray, isValidReactComponent} from '../../utils/common';
import {useLayout} from '../../utils/useLayout';
import {useRender} from 'customization-api';

const VideoComponent = () => {
  const [layout, setLayoutIndex] = useState(0);
  const layoutsData = useLayoutsData();
  const {currentLayout} = useLayout();
  const {renderPosition} = useRender();
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
    return <CurrentLayout renderData={renderPosition} />;
  } else {
    return <></>;
  }
};
export default VideoComponent;
