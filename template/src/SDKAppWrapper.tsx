import React from 'react';
import {CustomizationApiInterface, customize} from 'customization-api';
import {
  CustomizationProvider,
} from 'customization-implementation';
import SDKEvents, {userEventsMapInterface} from './utils/SdkEvents';
import SDKMethodEventsManager from './utils/SdkMethodEvents';
import {Unsubscribe} from 'nanoevents';
import App from './App';
import SdkApiContextProvider from './components/SdkApiContext';

type makeAsync<T extends (...p: any) => void> = (
  ...p: Parameters<T>
) => PromiseLike<ReturnType<T>>;

export interface SdkMethodEvents {
  customize: (customization: CustomizationApiInterface) => void;
  join: (roomid: string) => void;
}

type AppBuilderSdkEventMethods = {
  [K in keyof SdkMethodEvents]: makeAsync<SdkMethodEvents[K]>;
};

type AppBuilderSdkApiInterface =
  | {
      createCustomization: (
        customization: CustomizationApiInterface,
      ) => CustomizationApiInterface;
      on: <T extends keyof userEventsMapInterface>(
        userEventName: T,
        callBack: userEventsMapInterface[T],
      ) => Unsubscribe;
    }
  | AppBuilderSdkEventMethods;

export const AppBuilderSdkApi: AppBuilderSdkApiInterface = {
  customize: async (customization: CustomizationApiInterface) => {
    return await SDKMethodEventsManager.emit('customize', customization);
  },
  join: async (roomid: string) => {
    return await SDKMethodEventsManager.emit('join', roomid);
  },
  createCustomization: customize,
  on: (userEventName, cb) => {
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
