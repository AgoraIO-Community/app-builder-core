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
import {deviceId} from './components/DeviceConfigure';

export const AppBuilderSdkApi = {
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
  setMicrophone: async (deviceId: deviceId) => {
    return await SDKMethodEventsManager.emit('microphoneDevice', deviceId);
  },
  setSpeaker: async (deviceId: deviceId) => {
    return await SDKMethodEventsManager.emit('speakerDevice', deviceId);
  },
  setCamera: async (deviceId: deviceId) => {
    return await SDKMethodEventsManager.emit('cameraDevice', deviceId);
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
