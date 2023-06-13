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
import React, {
  createContext,
  useState,
} from 'react';
import {createHook} from 'customization-implementation';
import useVirtualBackground from '../../utils/useVirtualBackground';
import { useRtc } from 'customization-api';
import { VirtualBackgroundSource } from 'react-native-agora';

export interface VirtualBackgroundInterface {
  isEnabled: boolean;
  setVirtualBackground: (enabled: boolean, backgroundSource: VirtualBackgroundSource) => void;
}

const VirtualBackgroundContext = createContext<VirtualBackgroundInterface>({
  isEnabled: false,
  setVirtualBackground: ()=>{},
});

interface VirtualBackgroundProviderProps {
  children: React.ReactNode;
}

const VirtualBackgroundProvider = (props: VirtualBackgroundProviderProps) => {
  const {RtcEngineUnsafe} = useRtc();
  const [isEnabled, setIsEnabled] = useState(false);
  const setVirtualBackground = async (enabled: boolean, backgroundSource: VirtualBackgroundSource) => {
    // if(RtcEngineUnsafe === undefined) return;
    await RtcEngineUnsafe.enableVirtualBackground(enabled, {
      backgroundSourceType: backgroundSource.backgroundSourceType,
      source: backgroundSource.source,
      blur_degree: backgroundSource.blur_degree,
      color: backgroundSource.color,
    });
    setIsEnabled(enabled);
  };
  return (
    <VirtualBackgroundContext.Provider value={{isEnabled, setVirtualBackground}}>
      {props.children}
    </VirtualBackgroundContext.Provider>
  );
};

const useVirtualBackgroundContext = createHook(VirtualBackgroundContext);

export {useVirtualBackgroundContext, VirtualBackgroundProvider};
