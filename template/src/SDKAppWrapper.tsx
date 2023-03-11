import React from 'react';
import {
  CustomizationApiInterface,
  customize,
  MeetingInfoContextInterface,
  customEvents,
} from 'customization-api';
import {CustomizationProvider} from 'customization-implementation';
import SDKEvents, {userEventsMapInterface} from './utils/SdkEvents';
import SDKMethodEventsManager from './utils/SdkMethodEvents';
import App from './App';
import SdkApiContextProvider from './components/SdkApiContext';
import {Unsubscribe} from 'nanoevents';

// type makeAsync<T extends (...p: any) => void> = (
//   ...p: Parameters<T>
// ) => PromiseLike<ReturnType<T>>;
//
// type takeOnlyFirstParam<T extends (...p: any) => void> = (
//   p: Parameters<T>[0],
// ) => ReturnType<T>;

export interface SdkMethodEvents {
  customize: (customization: CustomizationApiInterface) => void;
  join(
    roomid: string | Partial<MeetingInfoContextInterface['data']>,
    skipPrecall?: boolean,
  ): MeetingInfoContextInterface['data'];
  'login':(token:string) => Promise<void>
  'logout':() => Promise<void>
}

// interface AppBuilderSdkApiInterface {
//   customize: makeAsync<SdkMethodEvents['customize']>;
//   joinRoom: makeAsync<takeOnlyFirstParam<SdkMethodEvents['join']>>;
//   joinPrecall: makeAsync<takeOnlyFirstParam<SdkMethodEvents['join']>>;
//   createCustomization: (
//     customization: CustomizationApiInterface,
//   ) => CustomizationApiInterface;
//   on: <T extends keyof userEventsMapInterface>(
//     userEventName: T,
//     callBack: userEventsMapInterface[T],
//   ) => Unsubscribe;
// }

export const AppBuilderSdkApi = {
  login: async (token: string) => {
    return await SDKMethodEventsManager.emit('login', token);
  },
  logout: async () => {
    return await SDKMethodEventsManager.emit('logout');
  },
  customize: async (customization: CustomizationApiInterface) => {
    return await SDKMethodEventsManager.emit('customize', customization);
  },
  customEvents: customEvents,
  join: async (roomDetails: string) => {
    await SDKMethodEventsManager.emit('join', roomDetails, false);
  },
  joinRoom: async (
    roomDetails: string | Partial<MeetingInfoContextInterface['data']>,
  ) => {
    return await SDKMethodEventsManager.emit('join', roomDetails, true);
  },
  joinPrecall: async (
    roomDetails: string | Partial<MeetingInfoContextInterface['data']>,
  ) => {
    const t = await SDKMethodEventsManager.emit('join', roomDetails);
    return t as unknown as [MeetingInfoContextInterface['data'], () => {}];
  },
  createCustomization: customize,
  on: <T extends keyof userEventsMapInterface>(
    userEventName: T,
    cb: userEventsMapInterface[T],
  ): Unsubscribe => {
    console.log('SDKEvents: Event Registered', userEventName);
    return SDKEvents.on(userEventName, cb);
  },
};

const SDKAppWrapper = () => {
  return (
    <SdkApiContextProvider>
      <CustomizationProvider>
        <App />
      </CustomizationProvider>
    </SdkApiContextProvider>
  );
};

export default SDKAppWrapper;
