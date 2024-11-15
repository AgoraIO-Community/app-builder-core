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

import React, {SetStateAction, useState} from 'react';
import {createHook} from 'customization-implementation';
import useLayoutsData from '../pages/video-call/useLayoutsData';
import {isArray} from './common';

export interface LayoutContextInterface {
  currentLayout: string;
  setLayout: React.Dispatch<SetStateAction<string>>;
}

const LayoutContext = React.createContext<LayoutContextInterface>({
  currentLayout: '',
  setLayout: () => {},
});

interface LayoutProviderProps {
  children: React.ReactNode;
}
const LayoutProvider = (props: LayoutProviderProps) => {
  const layouts = useLayoutsData();
  const defaultLayoutName = isArray(layouts) ? layouts[0].name : '';
  const [currentLayout, setLayout] = useState(defaultLayoutName);

  const value = {currentLayout, setLayout};
  return (
    <LayoutContext.Provider value={value}>
      {props.children}
    </LayoutContext.Provider>
  );
};
/**
 * The Layout app state governs the video call screen content display layout.
 */
const useLayout = createHook(LayoutContext);

export {LayoutProvider, useLayout};
