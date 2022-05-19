import React, {useEffect, useState} from 'react';
import {fpeConfig, FpeProvider} from 'fpe-api';
import {SDKEvents} from './utils/SdkEvents';
import App from './App';

const SDKAppWrapper = () => {
  const [fpe, setFpe] = useState(fpeConfig);
  useEffect(() => {
    SDKEvents.on('addFpe', (sdkFpeConfig) => {
      console.log('DEBUG(aditya)-SDKEvents: event called');
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
