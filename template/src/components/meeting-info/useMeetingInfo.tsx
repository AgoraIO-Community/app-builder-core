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
import React, {createContext} from 'react';
import {createHook} from 'customization-implementation';
import {UidType} from '../../../agora-rn-uikit';
export interface MeetingInfoContextInterface {
  isJoinDataFetched?: boolean;
  data?: {
    isHost: boolean;
    meetingTitle: string;
    roomId: {
      attendee: string;
      host?: string;
    };
    pstn?: {
      number: string;
      pin: string;
    };
    isSeparateHostLink: boolean;
    channel?: string;
    uid?: UidType;
    token?: string;
    rtmToken?: string;
    encryptionSecret?: string;
    screenShareUid?: string;
    screenShareToken?: string;
  };
}

export const MeetingInfoDefaultValue: MeetingInfoContextInterface = {
  isJoinDataFetched: false,
  data: {
    isHost: false,
    meetingTitle: '',
    roomId: {
      attendee: '',
    },
    isSeparateHostLink: true,
  },
};

const MeetingInfoContext = createContext(MeetingInfoDefaultValue);

interface MeetingInfoProviderProps {
  children: React.ReactNode;
  value: MeetingInfoContextInterface;
}

const MeetingInfoProvider = (props: MeetingInfoProviderProps) => {
  return (
    <MeetingInfoContext.Provider value={{...props.value}}>
      {props.children}
    </MeetingInfoContext.Provider>
  );
};
/**
 * The MeetingInfo app state contains information about the active meeting.
 */
const useMeetingInfo = createHook(MeetingInfoContext);

export {MeetingInfoProvider, useMeetingInfo};
