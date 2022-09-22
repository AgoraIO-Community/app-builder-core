import React, {useEffect, useState} from 'react';
import {
  CustomizationApiInterface,
  customize as createFPE,
} from 'customization-api';
import {
  customizationConfig,
  CustomizationProvider,
} from 'customization-implementation';
import SDKEvents from './utils/SdkEvents';
import App from './App';

export interface userEventsMapInterface {
  leave: () => void;
  create: (
    hostPhrase: string,
    attendeePhrase?: string,
    pstnNumer?: {
      number: string;
      pin: string;
    },
  ) => void;
  preJoin: (meetingTitle: string, devices: MediaDeviceInfo[]) => void;
  join: (
    meetingTitle: string,
    devices: MediaDeviceInfo[],
    isHost: boolean,
  ) => void;
}

export interface AppBuilderSdkApiInterface {
  addFPE: (fpe: CustomizationApiInterface) => void;
  createFPE: (fpe: CustomizationApiInterface) => CustomizationApiInterface;
  joinMeeting: (joinPhrase: string) => void;
  on: <T extends keyof userEventsMapInterface>(
    userEventName: T,
    callBack: userEventsMapInterface[T],
  ) => void;
}

export const AppBuilderSdkApi: AppBuilderSdkApiInterface = {
  addFPE: (fpeConfig: CustomizationApiInterface) => {
    SDKEvents.emit('addFpe', fpeConfig);
  },
  joinMeeting: (joinPhrase: string) => {
    SDKEvents.emit('joinMeetingWithPhrase', joinPhrase);
  },
  createFPE,
  on: (userEventName, cb) => {
    SDKEvents.on(userEventName, cb);
    console.log('SDKEvents: Event Registered', userEventName);
  },
};

const SDKAppWrapper = () => {
  const [fpe, setFpe] = useState(customizationConfig);
  useEffect(() => {
    SDKEvents.on('addFpe', (sdkFpeConfig) => {
      console.log('SDKEvents: addFpe event called');
      setFpe(sdkFpeConfig);
    });
    // Join event consumed in Create.tsx
  }, []);
  return (
    <>
      <CustomizationProvider value={fpe}>
        <App />
      </CustomizationProvider>
    </>
  );
};

export default SDKAppWrapper;
