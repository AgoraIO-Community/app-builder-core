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

import React, {SetStateAction, useEffect, useContext} from 'react';
import {SidePanelType} from '../../subComponents/SidePanelEnum';
import {createHook} from 'fpe-implementation';
import SDKEvents from '../../utils/SdkEvents';
import {RtcContext} from '../../../agora-rn-uikit';

export interface VideoCallContextInterface {
  sidePanel: SidePanelType;
  activeLayoutName: string;
  isHost: boolean;
  title: string;
  setSidePanel: React.Dispatch<SetStateAction<SidePanelType>>;
  setActiveLayoutName: React.Dispatch<SetStateAction<string>>;
  callActive: boolean;
}

const VideoCallContext = React.createContext<VideoCallContextInterface>({
  sidePanel: SidePanelType.None,
  activeLayoutName: '',
  isHost: false,
  title: '',
  setSidePanel: () => {},
  setActiveLayoutName: () => {},
  callActive: false,
});

interface VideoCallProviderProps {
  value: VideoCallContextInterface;
  children: React.ReactNode;
}
const VideoCallProvider = (props: VideoCallProviderProps) => {
  const rtc = useContext(RtcContext);

  useEffect(() => {
    if (props.value.callActive)
      new Promise((res) =>
        rtc.RtcEngine.getDevices(function (devices: MediaDeviceInfo[]) {
          res(devices);
        }),
      ).then((devices: MediaDeviceInfo[]) => {
        SDKEvents.emit('join', props.value.title, devices, props.value.isHost);
      });
  }, [props.value.callActive]);
  return (
    <VideoCallContext.Provider value={{...props.value}}>
      {props.children}
    </VideoCallContext.Provider>
  );
};

const useVideoCall = createHook(VideoCallContext);

export {VideoCallProvider, useVideoCall};
