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

import React, {SetStateAction} from 'react';
import {createHook} from 'fpe-implementation';

export interface SidePanelContextInterface {
  sidePanel: string;
  setSidePanel: React.Dispatch<SetStateAction<string>>;
}

const SidePanelContext = React.createContext<SidePanelContextInterface>({
  sidePanel: '',
  setSidePanel: () => {},
});

interface SidePanelProviderProps {
  value: SidePanelContextInterface;
  children: React.ReactNode;
}
const SidePanelProvider = (props: SidePanelProviderProps) => {
  return (
    <SidePanelContext.Provider value={{...props.value}}>
      {props.children}
    </SidePanelContext.Provider>
  );
};

const useSidePanel = createHook(SidePanelContext);

export {SidePanelProvider, useSidePanel};
