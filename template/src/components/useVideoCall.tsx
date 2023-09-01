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
import StartScreenSharePopup from './popups/StartScreenSharePopup';
import StopScreenSharePopup from './popups/StopScreenSharePopup';
import {SdkApiContext} from './SdkApiContext';
import {useRtc, useMeetingInfo} from 'customization-api';
import SDKEvents from '../utils/SdkEvents';
import DeviceContext from './DeviceContext';
import useSetName from '../utils/useSetName';
import useFindActiveSpeaker from '../utils/useFindActiveSpeaker';
import {UidType} from 'customization-api';

export interface VideoCallContextInterface {
  showInvitePopup: boolean;
  setShowInvitePopup: React.Dispatch<SetStateAction<boolean>>;
  showStopRecordingPopup: boolean;
  setShowStopRecordingPopup: React.Dispatch<SetStateAction<boolean>>;
  showLayoutOption: boolean;
  setShowLayoutOption: React.Dispatch<SetStateAction<boolean>>;
  activeSpeaker: UidType;
  showStartScreenSharePopup: boolean;
  setShowStartScreenSharePopup: React.Dispatch<SetStateAction<boolean>>;
  showStopScreenSharePopup: boolean;
  setShowStopScreenSharePopup: React.Dispatch<SetStateAction<boolean>>;
}

const VideoCallContext = React.createContext<VideoCallContextInterface>({
  showInvitePopup: false,
  setShowInvitePopup: () => {},
  showStopRecordingPopup: false,
  setShowStopRecordingPopup: () => {},
  showLayoutOption: false,
  setShowLayoutOption: () => {},
  activeSpeaker: 0,
  showStartScreenSharePopup: false,
  setShowStartScreenSharePopup: () => {},
  showStopScreenSharePopup: false,
  setShowStopScreenSharePopup: () => {},
});

interface VideoCallProviderProps {
  children: React.ReactNode;
}
const VideoCallProvider = (props: VideoCallProviderProps) => {
  const [showLayoutOption, setShowLayoutOption] = useState(false);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [showStopRecordingPopup, setShowStopRecordingPopup] = useState(false);
  const [showStartScreenSharePopup, setShowStartScreenSharePopup] =
    useState(false);
  const [showStopScreenSharePopup, setShowStopScreenSharePopup] =
    useState(false);
  const {join, enterRoom} = useContext(SdkApiContext);
  const meetingInfo = useMeetingInfo();
  const {deviceList} = useContext(DeviceContext);
  const setUsername = useSetName();
  const activeSpeaker = useFindActiveSpeaker();

  useEffect(() => {
    if (join.initialized && join.phrase) {
      if (join.userName && join.skipPrecall) {
        setUsername(join.userName);
      }
      join.promise.res(meetingInfo.data);
    }
    if (enterRoom.promise) {
      enterRoom.promise.res(meetingInfo.data);
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
        activeSpeaker: $config.ACTIVE_SPEAKER ? activeSpeaker : 0,
        showStartScreenSharePopup,
        setShowStartScreenSharePopup,
        showStopScreenSharePopup,
        setShowStopScreenSharePopup,
      }}>
      <StartScreenSharePopup />
      <StopScreenSharePopup />
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
