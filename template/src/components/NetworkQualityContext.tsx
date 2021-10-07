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
import React, {createContext, useContext, useEffect, useState} from 'react';
import RtcContext from '../../agora-rn-uikit/src/RtcContext';
import useMount from './useMount';
import icons from '../assets/icons';

export const networkIconsObject: {
  [key: number]: {
    icon: string;
    tint: string;
  };
} = {
  0: {
    icon: icons.networkIcons['Loading'],
    tint: 'primary',
  },
  1: {
    icon: icons.networkIcons['Excellent'],
    tint: 'primary',
  },
  2: {
    icon: icons.networkIcons['Good'],
    tint: '#FFEE00',
  },
  3: {
    icon: icons.networkIcons['Bad'],
    tint: 'orange',
  },
  4: {
    icon: icons.networkIcons['Bad'],
    tint: 'orange',
  },
  5: {
    icon: icons.networkIcons['VeryBad'],
    tint: 'red',
  },
  6: {
    icon: icons.networkIcons['VeryBad'],
    tint: 'red',
  },
  7: {
    icon: icons.networkIcons['Unsupported'],
    tint: 'primary',
  },
  8: {
    icon: icons.networkIcons['Unsupported'],
    tint: 'primary',
  },
};

const initNewtorkQualityContextValue: {[key: string | number]: number} = {
  local: 0,
};

const NetworkQualityContext = createContext(initNewtorkQualityContextValue);

export default NetworkQualityContext;

export const NetworkQualityConsumer = NetworkQualityContext.Consumer;

export const NetworkQualityProvider = (props) => {
  const [networkQualityStat, setNetworkQualityStats] = useState(
    initNewtorkQualityContextValue,
  );
  const {RtcEngine} = useContext(RtcContext);

  useMount(() => {
    function handleNetworkQuality(
      uid: number | string,
      downlinkQuality: number,
      uplinkQuality: number,
    ) {
      setNetworkQualityStats((prevNetworkQualityStats) => {
        const newNetworkQualityStats = {...prevNetworkQualityStats};
        newNetworkQualityStats[uid === 0 ? 'local' : uid] = downlinkQuality;
        return newNetworkQualityStats;
      });
    }

    RtcEngine.addListener('NetworkQuality', handleNetworkQuality);

    // return () => {
    //   RtcEngine.removeListener('NetworkQuality', handleNetworkQuality);
    // };
  });

  return (
    <NetworkQualityContext.Provider value={networkQualityStat}>
      {props.children}
    </NetworkQualityContext.Provider>
  );
};
