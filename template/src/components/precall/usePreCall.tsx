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
import React, {createContext} from 'react';
import {createHook} from 'customization-implementation';
import {ApolloError} from '@apollo/client';

export interface PreCallContextInterface {
  callActive: boolean;
  setCallActive: React.Dispatch<React.SetStateAction<boolean>>;
  error?: ApolloError;
}

const PreCallContext = createContext<PreCallContextInterface>({
  callActive: false,
  setCallActive: () => {},
});

interface PreCallProviderProps {
  value: PreCallContextInterface;
  children: React.ReactNode;
}

const PreCallProvider = (props: PreCallProviderProps) => {
  return (
    <PreCallContext.Provider value={{...props.value}}>
      {props.children}
    </PreCallContext.Provider>
  );
};
const usePreCall = createHook(PreCallContext);

export {PreCallProvider, usePreCall};
