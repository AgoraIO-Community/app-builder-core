import React, {useEffect, useState} from 'react';
import useCustomLayout from './CustomLayout';
import {isArray, isValidReactComponent} from '../../utils/common';
import {useLayout} from '../../utils/useLayout';
import {useRender} from 'customization-api';

const VideoComponent = () => {
  const [layout, setLayoutIndex] = useState(0);
  const fpeLayouts = useCustomLayout();
  const {currentLayout} = useLayout();
  const {renderPosition} = useRender();
  useEffect(() => {
    if (isArray(fpeLayouts)) {
      let index = fpeLayouts.findIndex((item) => item.name === currentLayout);
      if (index >= 0) {
        setLayoutIndex(index);
      }
    }
  }, [currentLayout]);

  if (
    fpeLayouts &&
    fpeLayouts[layout] &&
    isValidReactComponent(fpeLayouts[layout].component)
  ) {
    const CurrentLayout = fpeLayouts[layout].component;
    return <CurrentLayout renderData={renderPosition} />;
  } else {
    return <></>;
  }
};
export default VideoComponent;
