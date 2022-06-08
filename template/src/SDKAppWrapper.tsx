import React, {useEffect, useState} from 'react';
import {fpeConfig, FpeProvider, FpeApiInterface} from 'fpe-api';
import {installFPE as createFPE} from 'fpe-api/install';
import SDKEvents from './utils/SdkEvents';
import App from './App';

export interface AppBuilderSdkApiInterface {
  addFPE: (fpe: FpeApiInterface) => void;
  createFPE: (fpe: FpeApiInterface) => FpeApiInterface;
}
export const AppBuilderSdkApi: AppBuilderSdkApiInterface = {
  addFPE: (fpeConfig: FpeApiInterface) => {
    SDKEvents.emit('addFpe', fpeConfig);
  },
  createFPE,
};
const SDKAppWrapper = () => {
  const [fpe, setFpe] = useState(fpeConfig);
  useEffect(() => {
    SDKEvents.on('addFpe', (sdkFpeConfig) => {
      console.log('DEBUG(aditya)-SDKEvents: addFpe event called');
      setFpe(sdkFpeConfig);
    });
  }, []);
  return (
    <>
      <FpeProvider value={fpe}>
        <App />
      </FpeProvider>
    </>
  );
};

export default SDKAppWrapper;
