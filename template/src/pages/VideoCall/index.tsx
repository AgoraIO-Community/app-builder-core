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

import React, { SetStateAction } from 'react';
import { SidePanelType } from 'src/subComponents/SidePanelEnum';

type VideoCallContextType = {
  setRecordingActive: any,
  recordingActive: boolean,
  sidePanel: SidePanelType,
  setSidePanel: React.Dispatch<SetStateAction<SidePanelType>>,
  layout: any,
  setLayout: React.Dispatch<SetStateAction<any>>,
  pendingMessageLength: number,
  setLastCheckedPublicState: React.Dispatch<SetStateAction<any>>,
  isHost: boolean,
  title: string,
  pendingPrivateNotification: any,
  pendingPublicNotification: any,
  lastCheckedPrivateState: any,
  privateMessageCountMap: any,
  setPrivateMessageLastSeen: any,
  setPrivateChatDisplayed: any
}
const VideoCallContext = React.createContext((null as unknown) as VideoCallContextType);
const VideoCallProvider = (props:any) => {
  return (
    <VideoCallContext.Provider
      value={{...props}}
    >
      {true ? props.children : <></>}
    </VideoCallContext.Provider>
  );
};
import VideoCall  from './VideoCall';
export {VideoCallContext, VideoCallProvider}
export default VideoCall


