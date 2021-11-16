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
    tint: 'primary',
    text: 'Excellent',
  },
  2: {
    icon: icons.networkIcons['Good'],
    tint: '#FFEE00',
    text: 'Good',
  },
  3: {
    icon: icons.networkIcons['Bad'],
    tint: 'orange',
    text: 'Bad',
  },
  4: {
    icon: icons.networkIcons['Bad'],
    tint: 'orange',
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

const initNewtorkQualityContextValue: {[key: string | number]: number} = {
  local: 0,
};

const networkQualityContext = createContext(initNewtorkQualityContextValue);

export default networkQualityContext;

export const NetworkQualityConsumer = networkQualityContext.Consumer;

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
    <networkQualityContext.Provider value={networkQualityStat}>
      {props.children}
    </networkQualityContext.Provider>
  );
};
