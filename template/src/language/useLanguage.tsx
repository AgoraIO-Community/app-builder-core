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
import React, { createContext, useContext, useEffect, useState } from 'react';
import {createHook} from 'fpe-api';
import { DEFAULT_LANGUAGE_CODE } from './index';
import StorageContext from '../components/StorageContext';

export interface LanguageContextInterface {
  languageCode: string;
  setLanguageCode: (code: string) => void;
}

export interface LanguagePropsInterface {
  children: React.ReactNode;
}

const LanguageContext: React.Context<LanguageContextInterface> = createContext({
  languageCode: DEFAULT_LANGUAGE_CODE,
  setLanguageCode: () => { },
  children: null
} as LanguageContextInterface);

const LanguageProvider = (props: LanguagePropsInterface) => {

  const {store, setStore} = useContext(StorageContext);
  const [languageCode, setLanguageCodeLocal] = useState(store.selectedLanguageCode || DEFAULT_LANGUAGE_CODE);

  useEffect(() => {
    if(setStore){
      setStore((prevState) => {
        return {
          ...prevState,
          selectedLanguageCode: languageCode
        }
      });
    } 
  }, [languageCode])
  
  const setLanguageCode = (langCode: string) => {
    setLanguageCodeLocal(langCode);
  }

  return (
    <LanguageContext.Provider
      value={{ languageCode, setLanguageCode }}
    >
      {true ? props.children : <></>}
    </LanguageContext.Provider>
  );
};
const useLanguage = createHook(LanguageContext);

export { LanguageProvider, useLanguage };