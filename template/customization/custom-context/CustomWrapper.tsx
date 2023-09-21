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

export interface CustomWrapperContextInterface {
  hideSelfView: boolean;
  setHideSelfView: React.Dispatch<SetStateAction<boolean>>;
}

const CustomWrapperContext = React.createContext<CustomWrapperContextInterface>(
  {hideSelfView: false, setHideSelfView: () => {}},
);

interface CustomWrapperProviderProps {
  children: React.ReactNode;
}
const CustomWrapperProvider = (props: CustomWrapperProviderProps) => {
  const [hideSelfView, setHideSelfView] = useState(false);
  return (
    <CustomWrapperContext.Provider value={{hideSelfView, setHideSelfView}}>
      {props.children}
    </CustomWrapperContext.Provider>
  );
};

/**
 *
 */
const useCustomWrapper = createHook(CustomWrapperContext);

export {CustomWrapperProvider, useCustomWrapper};
