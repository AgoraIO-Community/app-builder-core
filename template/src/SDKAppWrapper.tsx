import React, {useEffect, useState} from 'react';
import {CustomizationApiInterface, customize} from 'customization-api';
import {
  customizationConfig,
  CustomizationProvider,
} from 'customization-implementation';
import SDKEvents from './utils/SdkEvents';
import {Unsubscribe} from 'nanoevents';
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
  'ready-to-join': (meetingTitle: string, devices: MediaDeviceInfo[]) => void;
  join: (
    meetingTitle: string,
    devices: MediaDeviceInfo[],
    isHost: boolean,
  ) => void;
}

export interface AppBuilderSdkApiInterface {
  customize: (customization: CustomizationApiInterface) => void;
  createCustomization: (
    customization: CustomizationApiInterface,
  ) => CustomizationApiInterface;
  join: (roomid: string) => Promise<void>;
  on: <T extends keyof userEventsMapInterface>(
    userEventName: T,
    callBack: userEventsMapInterface[T],
  ) => Unsubscribe;
}

let joinInit = false;

export const AppBuilderSdkApi: AppBuilderSdkApiInterface = {
  customize: (customization: CustomizationApiInterface) => {
    SDKEvents.emit('addFpe', customization);
  },
  join: (roomid: string) =>
    new Promise((resolve, reject) => {
      if (joinInit) {
        console.log('[SDKEvents] Join listener emitted preemptive');
        SDKEvents.emit('joinMeetingWithPhrase', roomid, resolve, reject);
      }
      SDKEvents.on('joinInit', () => {
        if (!joinInit) {
          console.log('[SDKEvents] Join listener emitted');
          SDKEvents.emit('joinMeetingWithPhrase', roomid, resolve, reject);
          joinInit = true;
        }
      });
    }),
  createCustomization: customize,
  on: (userEventName, cb) => {
    console.log('SDKEvents: Event Registered', userEventName);
    return SDKEvents.on(userEventName, cb);
  },
};

const SDKAppWrapper = () => {
  const [fpe, setFpe] = useState(customizationConfig);
  useEffect(() => {
    SDKEvents.on('addFpe', (sdkFpeConfig) => {
      console.log('SDKEvents: addFpe event called');
      setFpe(sdkFpeConfig);
    });
    SDKEvents.emit('addFpeInit');
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
