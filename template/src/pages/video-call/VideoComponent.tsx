import React, {useEffect, useState} from 'react';
import useCustomLayout from './CustomLayout';
import {isArray, isValidReactComponent} from '../../utils/common';
import {useLayout} from '../../utils/useLayout';
import {useRenderContext} from 'fpe-api';

const VideoComponent = () => {
  const [layout, setLayoutIndex] = useState(0);
  const fpeLayouts = useCustomLayout();
  const {activeLayoutName} = useLayout();
  const {renderPosition} = useRenderContext();
  useEffect(() => {
    if (isArray(fpeLayouts)) {
      let index = fpeLayouts.findIndex(
        (item) => item.name === activeLayoutName,
      );
      if (index >= 0) {
        setLayoutIndex(index);
      }
    }
  }, [activeLayoutName]);

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
