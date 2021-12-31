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
import React, { createContext, useContext, useState } from 'react';
import { RtcContext } from '../../agora-rn-uikit';
import useMount from './useMount';
import icons from '../assets/icons';

/**
 * Network Icons container object with color and string mapping to network quality stat [ 0 - 8]
 * 0 - Loading
 * 1 - Excellent
 * 2 - Good
 * 3 - Bad
 * 4 - Bad
 * 5 - Very Bad
 * 6 - Very Bad
 * 7 - Unsupported
 * 8 - Unsupported
 */
export const networkIconsObject: {
  [key: number]: {
    icon: string;
    tint: string;
    text: string;
  };
} = {
  0: {
    icon: icons.networkIcons['Loading'],
    tint: 'primary',
    text: 'Loading',
  },
  1: {
    icon: icons.networkIcons['Excellent'],
    tint: '#2BD900',
    text: 'Excellent',
  },
  2: {
    icon: icons.networkIcons['Good'],
    tint: '#FFEE00',
    text: 'Good',
  },
  3: {
    icon: icons.networkIcons['Bad'],
    tint: '#F8AA00',
    text: 'Bad',
  },
  4: {
    icon: icons.networkIcons['Bad'],
    tint: '#F8AA00',
    text: 'Bad',
  },
  5: {
    icon: icons.networkIcons['VeryBad'],
    tint: 'red',
    text: 'VeryBad',
  },
  6: {
    icon: icons.networkIcons['VeryBad'],
    tint: 'red',
    text: 'VeryBad',
  },
  7: {
    icon: icons.networkIcons['Unsupported'],
    tint: 'primary',
    text: 'Unknown',
  },
  8: {
    icon: icons.networkIcons['Unsupported'],
    tint: 'primary',
    text: 'Unknown',
  },
};

const initNewtorkQualityStats: { [key in string | number]: number } = {
  local: 0,
};

const NetworkQualityContext = createContext(initNewtorkQualityStats);

export default NetworkQualityContext;

export const NetworkQualityConsumer = NetworkQualityContext.Consumer;

export const NetworkQualityProvider: React.FC = (props) => {
  const [networkQualityStats, setNetworkQualityStats] = useState(
    initNewtorkQualityStats,
  );
  const { RtcEngine } = useContext(RtcContext);

  useMount(() => {
    function handleNetworkQuality(
      uid: number | string,
      downlinkQuality: number,
      // Currently unused , potential use might be to take weighted average
      // of this alongside the downlink quality.
      uplinkQuality: number,
    ) {
      setNetworkQualityStats((prevNetworkQualityStats) => {
        const updatedNetworkQualityStats = { ...prevNetworkQualityStats };
        updatedNetworkQualityStats[uid === 0 ? 'local' : uid] = downlinkQuality;
        return updatedNetworkQualityStats;
      });
    }

    RtcEngine.addListener('NetworkQuality', handleNetworkQuality);
  });

  return (
    <NetworkQualityContext.Provider value={networkQualityStats}>
      {props.children}
    </NetworkQualityContext.Provider>
  );
};
