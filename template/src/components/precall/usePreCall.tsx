/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React, {createContext, useContext, useEffect} from 'react';
import {createHook} from 'customization-implementation';
import {ApolloError} from '@apollo/client';
import {SdkApiContext} from '../SdkApiContext';
import {useMeetingInfo} from '../meeting-info/useMeetingInfo';
import SDKEvents from '../../utils/SdkEvents';
import DeviceContext from '../DeviceContext';

export interface PreCallContextInterface {
  callActive: boolean;
  setCallActive: React.Dispatch<React.SetStateAction<boolean>>;
  error?: ApolloError;
  isCameraAvailable?: boolean;
  setCameraAvailable: React.Dispatch<React.SetStateAction<boolean>>;
  isMicAvailable?: boolean;
  setMicAvailable: React.Dispatch<React.SetStateAction<boolean>>;
  isSpeakerAvailable?: boolean;
  setSpeakerAvailable: React.Dispatch<React.SetStateAction<boolean>>;
  isPermissionRequested: boolean;
  setIsPermissionRequested: React.Dispatch<React.SetStateAction<boolean>>;
}

const PreCallContext = createContext<PreCallContextInterface>({
  callActive: false,
  setCallActive: () => {},
  isCameraAvailable: false,
  isMicAvailable: false,
  isSpeakerAvailable: false,
  setCameraAvailable: () => {},
  setMicAvailable: () => {},
  setSpeakerAvailable: () => {},
  isPermissionRequested: false,
  setIsPermissionRequested: () => {},
});

interface PreCallProviderProps {
  value: PreCallContextInterface;
  children: React.ReactNode;
}

const PreCallProvider = (props: PreCallProviderProps) => {
  const {join, enterRoom} = useContext(SdkApiContext);
  const meetingInfo = useMeetingInfo();
  const {deviceList} = useContext(DeviceContext);

  useEffect(() => {
    if (join.phrase) {
      //@ts-ignore
      join?.promise?.res([
        meetingInfo.data,
        () => {
          return new Promise((res, rej) => {
            enterRoom.set({res, rej});
            props.value.setCallActive(true);
          });
        },
      ]);
    }

    SDKEvents.emit('ready-to-join', meetingInfo.data.meetingTitle, deviceList);
  }, []);

  return (
    <PreCallContext.Provider value={{...props.value}}>
      {props.children}
    </PreCallContext.Provider>
  );
};
const usePreCall = createHook(PreCallContext);

export {PreCallProvider, usePreCall};
