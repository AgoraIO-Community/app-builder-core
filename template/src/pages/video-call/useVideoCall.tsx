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

import React, {SetStateAction} from 'react';
import {SidePanelType} from '../../subComponents/SidePanelEnum';
import Layout from '../../subComponents/LayoutEnum';
import {createHook} from 'fpe-implementation';
import {LayoutObjectInterface} from 'fpe-api';
import PinnedVideo from '../../components/PinnedVideo';
import GridVideo from '../../components/GridVideo';

export interface VideoCallContextInterface {
  recordingActive: boolean;
  sidePanel: SidePanelType;
  layout: Layout;
  isHost: boolean;
  title: string;
  children: React.ReactNode;
  setRecordingActive: React.Dispatch<SetStateAction<boolean>>;
  setSidePanel: React.Dispatch<SetStateAction<SidePanelType>>;
  setLayout: React.Dispatch<SetStateAction<any>>;
  layouts: LayoutObjectInterface[];
}

const VideoCallContext = React.createContext<VideoCallContextInterface>({
  recordingActive: false,
  sidePanel: SidePanelType.None,
  layout: Layout.Grid,
  isHost: false,
  title: '',
  children: null,
  setRecordingActive: () => {},
  setSidePanel: () => {},
  setLayout: () => {},
  layouts: [
    {name: 'GridLayout', icon: 'gridLayoutIcon', component: GridVideo},
    {name: 'PinnedLayout', icon: 'pinnedLayoutIcon', component: PinnedVideo},
  ],
});

const VideoCallProvider = (props: VideoCallContextInterface) => {
  return (
    <VideoCallContext.Provider value={{...props}}>
      {true ? props.children : <></>}
    </VideoCallContext.Provider>
  );
};

const useVideoCall = createHook(VideoCallContext);

export {VideoCallProvider, useVideoCall};
