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

type meetingData = Partial<MeetingInfoContextInterface['data']>;

// Hard defined since its an api.
export interface AppBuilderSdkApiInterface {
  customize: (customization: CustomizationApiInterface) => Promise<void>;
  joinRoom: (roomDetails: string | meetingData) => Promise<meetingData>;
  joinPrecall: (
    roomDetails: string | meetingData,
  ) => Promise<[meetingData, () => void]>;
  setMicrophone: (deviceId: deviceId) => Promise<void>;
  setCamera: (deviceId: deviceId) => Promise<void>;
  setSpeaker: (deviceId: deviceId) => Promise<void>;
  muteAudio: (state: boolean) => Promise<void>;
  muteVideo: (state: boolean) => Promise<void>;
  createCustomization: (
    customization: CustomizationApiInterface,
  ) => CustomizationApiInterface;
  customEvents: typeof customEvents;
  on: <T extends keyof userEventsMapInterface>(
    userEventName: T,
    cb: userEventsMapInterface[T],
  ) => Unsubscribe;
}

export const AppBuilderSdkApi: AppBuilderSdkApiInterface = {
  customize: async (customization) => {
    return await SDKMethodEventsManager.emit('customize', customization);
  },
  customEvents: customEvents,
  joinRoom: async (roomDetails) => {
    return await SDKMethodEventsManager.emit('join', roomDetails, true);
  },
  joinPrecall: async (roomDetails) => {
    const t = await SDKMethodEventsManager.emit('join', roomDetails);
    return t as unknown as [MeetingInfoContextInterface['data'], () => {}];
  },
  setMicrophone: async (deviceId) => {
    return await SDKMethodEventsManager.emit('microphoneDevice', deviceId);
  },
  setSpeaker: async (deviceId) => {
    return await SDKMethodEventsManager.emit('speakerDevice', deviceId);
  },
  setCamera: async (deviceId) => {
    return await SDKMethodEventsManager.emit('cameraDevice', deviceId);
  },
  muteAudio: async (state) => {
    return await SDKMethodEventsManager.emit('muteAudio', state);
  },
  muteVideo: async (state) => {
    return await SDKMethodEventsManager.emit('muteVideo', state);
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
