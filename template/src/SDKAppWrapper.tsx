import React, {useEffect, useState} from 'react';
import {CustomizationApiInterface, customize} from 'customization-api';
import {
  customizationConfig,
  CustomizationProvider,
} from 'customization-implementation';
import SDKEvents from './utils/SdkEvents';
import {Unsubscribe} from 'nanoevents';
import App from './App';
import AsyncStorage from '@react-native-community/async-storage';
import Loading from './subComponents/Loading';

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
  'server-token': (token: string) => void;
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
  ) => Unsubscribe;
}

let joinInit = false;

export const AppBuilderSdkApi: AppBuilderSdkApiInterface = {
  initialize: (options: OptionsInterface) =>
    new Promise((resolve, reject) => {
      SDKEvents.emit('appInit', options, resolve, reject);
    }),
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
  const [initialized, setInitialized] = React.useState(false);

  const setSdkToken = async (sdkToken: string) => {
    try {
      await AsyncStorage.setItem('SDK_TOKEN', sdkToken);
    } catch (e) {
      console.log('problem syncing the store', e);
    }
  };
  useEffect(() => {
    SDKEvents.on('appInit', async (options, resolve, reject) => {
      try {
        $config.ENABLE_TOKEN_AUTH && setSdkToken(options?.token);
        setInitialized(true);
        resolve(true);
      } catch (error) {
        setInitialized(false);
        reject(`Error initializing app builder ${error}`);
      }
    });
    SDKEvents.on('addFpe', (sdkFpeConfig) => {
      setFpe(sdkFpeConfig);
    });
    SDKEvents.emit('addFpeInit');
    // Join event consumed in Create.tsx
  }, []);

  return (
    <>
      {initialized ? (
        <CustomizationProvider value={fpe}>
          <App />
        </CustomizationProvider>
      ) : (
        <Loading text="Initializing..." />
      )}
    </>
  );
};

export default SDKAppWrapper;
