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

import React, {SetStateAction, useState, useContext, useEffect} from 'react';
import {createHook} from 'customization-implementation';
import InvitePopup from './popups/InvitePopup';
import StopRecordingPopup from './popups/StopRecordingPopup';
import {SdkApiContext} from './SdkApiContext';
import {useRtc, useMeetingInfo} from 'customization-api';
import SDKEvents from '../utils/SdkEvents';
import DeviceContext from './DeviceContext';

export interface VideoCallContextInterface {
  showInvitePopup: boolean;
  setShowInvitePopup: React.Dispatch<SetStateAction<boolean>>;
  showStopRecordingPopup: boolean;
  setShowStopRecordingPopup: React.Dispatch<SetStateAction<boolean>>;
  showLayoutOption: boolean;
  setShowLayoutOption: React.Dispatch<SetStateAction<boolean>>;
}

const VideoCallContext = React.createContext<VideoCallContextInterface>({
  showInvitePopup: false,
  setShowInvitePopup: () => {},
  showStopRecordingPopup: false,
  setShowStopRecordingPopup: () => {},
  showLayoutOption: false,
  setShowLayoutOption: () => {},
});

interface VideoCallProviderProps {
  children: React.ReactNode;
}
const VideoCallProvider = (props: VideoCallProviderProps) => {
  const [showLayoutOption, setShowLayoutOption] = useState(false);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [showStopRecordingPopup, setShowStopRecordingPopup] = useState(false);
  const {join} = useContext(SdkApiContext);
  const meetingInfo = useMeetingInfo();
  const {deviceList} = useContext(DeviceContext);

  useEffect(() => {
    if (join.initialized && join.phrase) {
      join.promise.res(meetingInfo.data);
    }
    SDKEvents.emit(
      'join',
      meetingInfo.data.meetingTitle,
      deviceList,
      meetingInfo.data.isHost,
    );
  }, []);
  return (
    <VideoCallContext.Provider
      value={{
        showInvitePopup,
        setShowInvitePopup,
        showStopRecordingPopup,
        setShowStopRecordingPopup,
        showLayoutOption,
        setShowLayoutOption,
      }}>
      <StopRecordingPopup />
      <InvitePopup />
      {props.children}
    </VideoCallContext.Provider>
  );
};

/**
 *
 */
const useVideoCall = createHook(VideoCallContext);

export {VideoCallProvider, useVideoCall};
