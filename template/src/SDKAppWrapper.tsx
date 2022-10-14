import React, {useEffect, useState} from 'react';
import {CustomizationApiInterface, customize} from 'customization-api';
import AsyncStorage from '@react-native-community/async-storage';
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
  'ready-to-join': (meetingTitle: string, devices: MediaDeviceInfo[]) => void;
  join: (
    meetingTitle: string,
    devices: MediaDeviceInfo[],
    isHost: boolean,
  ) => void;
}

export interface OptionsInterface {
  token: string;
}

export interface AppBuilderSdkApiInterface {
  customize: (customization: CustomizationApiInterface) => void;
  initialize: (options: OptionsInterface) => void;
  createCustomization: (
    customization: CustomizationApiInterface,
  ) => CustomizationApiInterface;
  join: (roomid: string) => Promise<void>;
  on: <T extends keyof userEventsMapInterface>(
    userEventName: T,
    callBack: userEventsMapInterface[T],
  ) => void;
}

export const AppBuilderSdkApi: AppBuilderSdkApiInterface = {
  initialize: (options: OptionsInterface) => {
    SDKEvents.emit('appInit', options);
  },
  customize: (customization: CustomizationApiInterface) => {
    SDKEvents.emit('addFpe', customization);
  },
  join: (roomid: string) =>
    new Promise((resolve, reject) => {
      SDKEvents.emit('joinMeetingWithPhrase', roomid, resolve, reject);
    }),
  createCustomization: customize,
  on: (userEventName, cb) => {
    SDKEvents.on(userEventName, cb);
    console.log('SDKEvents: Event Registered', userEventName);
  },
};

const SDKAppWrapper = () => {
  const [fpe, setFpe] = useState(customizationConfig);
  const [initialized, setInitialized] = React.useState(false);

  useEffect(() => {
    SDKEvents.on('addFpe', (sdkFpeConfig) => {
      setFpe(sdkFpeConfig);
    });
    SDKEvents.emit('addFpeInit');
    SDKEvents.on('appInit', async (options) => {
      try {
        if ($config.ENABLE_SDK_AUTHENTICATION) {
          await AsyncStorage.setItem('SDK_TOKEN', options?.token || null);
        }
        setInitialized(true);
      } catch (error) {
        // Error retrieving data
        setInitialized(false);
        console.log('Error initialize app builder app');
      }
    });
    // Join event consumed in Create.tsx
  }, []);

  return (
    <>
      {initialized ? (
        <CustomizationProvider value={fpe}>
          <App />
        </CustomizationProvider>
      ) : (
        <p>Loading</p>
      )}
    </>
  );
};

export default SDKAppWrapper;
