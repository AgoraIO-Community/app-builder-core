import React, {useEffect, useState} from 'react';
import {fpeConfig, FpeProvider, FpeApiInterface} from 'fpe-api';
import {installFPE as createFPE} from 'fpe-api/install';
import SDKEvents from './utils/SdkEvents';
import App from './App';

export interface userEventsMapInterface {
  leave: () => void;
  create: (
    hostPhrase: string,
    attendeePhrase?: string,
    pstnNumer?: string,
  ) => void;
  preJoin: (meetingTitle: string, devices: MediaDeviceInfo[]) => void;
  join: (
    meetingTitle: string,
    devices: MediaDeviceInfo[],
    isHost: boolean,
  ) => void;
}

export interface AppBuilderSdkApiInterface {
  addFPE: (fpe: FpeApiInterface) => void;
  createFPE: (fpe: FpeApiInterface) => FpeApiInterface;
  joinMeeting: (joinPhrase: string) => void;
  on: <T extends keyof userEventsMapInterface>(
    userEventName: T,
    callBack: userEventsMapInterface[T],
  ) => void;
  off: (userEventName: keyof userEventsMapInterface) => void;
}

export const AppBuilderSdkApi: AppBuilderSdkApiInterface = {
  addFPE: (fpeConfig: FpeApiInterface) => {
    SDKEvents.emit('addFpe', fpeConfig);
  },
  joinMeeting: (joinPhrase: string) => {
    SDKEvents.emit('joinMeetingWithPhrase', joinPhrase);
  },
  createFPE,
  on: (userEventName, cb) => {
    SDKEvents.on(userEventName, cb);
  },
  off: (userEventName) => {
    SDKEvents.off(userEventName);
  },
};

const SDKAppWrapper = () => {
  const [fpe, setFpe] = useState(fpeConfig);
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
