import React, {useEffect, useState} from 'react';
import {NetworkQualityProvider} from '../../components/NetworkQualityContext';
import VideoArrayRenderer from './VideoArrayRenderer';
import CustomUserContextHolder from './CustomUserContextHolder';
import useCustomLayout from './CustomLayout';
import {isArray, isValidElementType} from '../../utils/common';
import {useLayout} from '../../utils/useLayout';

const VideoComponent = () => {
  const [layout, setLayoutIndex] = useState(0);
  const fpeLayouts = useCustomLayout();
  const {activeLayoutName} = useLayout();
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
  return (
    <CustomUserContextHolder>
      <NetworkQualityProvider>
        <VideoArrayRenderer>
          {(minVideoArray: React.FC[], maxVideoArray: React.FC[]) => {
            if (
              fpeLayouts &&
              fpeLayouts[layout] &&
              isValidElementType(fpeLayouts[layout].component)
            ) {
              const CurrentLayout = fpeLayouts[layout].component;
              return (
                <CurrentLayout
                  minVideoArray={minVideoArray}
                  maxVideoArray={maxVideoArray}
                />
              );
            } else {
              return <></>;
            }
          }}
        </VideoArrayRenderer>
      </NetworkQualityProvider>
    </CustomUserContextHolder>
  );
};
export default VideoComponent;
