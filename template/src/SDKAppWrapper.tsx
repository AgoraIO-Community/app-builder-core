import React, {useEffect, useState} from 'react';
import useJoinMeeting from './utils/useJoinMeeting';
import {fpeConfig, FpeProvider, FpeApiInterface} from 'fpe-api';
import {installFPE as createFPE} from 'fpe-api/install';
import SDKEvents from './utils/SdkEvents';
import App from './App';

export interface AppBuilderSdkApiInterface {
  addFPE: (fpe: FpeApiInterface) => void;
  createFPE: (fpe: FpeApiInterface) => FpeApiInterface;
  joinMeeting: (joinPhrase: string) => void;
}

export const AppBuilderSdkApi: AppBuilderSdkApiInterface = {
  addFPE: (fpeConfig: FpeApiInterface) => {
    SDKEvents.emit('addFpe', fpeConfig);
  },
  joinMeeting: (joinPhrase: string) => {
    SDKEvents.emit('join', joinPhrase);
  },
  createFPE,
};

const SDKAppWrapper = () => {
  const [fpe, setFpe] = useState(fpeConfig);
  const useJoin = useJoinMeeting();
  useEffect(() => {
    SDKEvents.on('addFpe', (sdkFpeConfig) => {
      console.log('DEBUG(aditya)-SDKEvents: addFpe event called');
      setFpe(sdkFpeConfig);
    });
    // Join event consumed in Create.tsx
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
