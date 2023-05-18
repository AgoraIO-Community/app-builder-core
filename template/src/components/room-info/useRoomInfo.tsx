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
export interface RoomInfoContextInterface {
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
    whiteboard?: {
      room_uuid: string;
      room_token: string;
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

export const validateMeetingInfoData = (
  roomInfo: Partial<RoomInfoContextInterface['data']>,
) => {
  const {
    channel,
    encryptionSecret,
    rtmToken,
    screenShareToken,
    screenShareUid,
    token,
    uid,
  } = roomInfo;
  if ($config.ENCRYPTION_ENABLED && !encryptionSecret) {
    return false;
  }
  if ($config.SCREEN_SHARING && (!screenShareToken || !screenShareUid)) {
    return false;
  }
  if (!channel || !rtmToken || !token || !uid) {
    return false;
  }
  return true;
};

export const RoomInfoDefaultValue: RoomInfoContextInterface = {
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

const RoomInfoContext = createContext(RoomInfoDefaultValue);

interface RoomInfoProviderProps {
  children: React.ReactNode;
  value: RoomInfoContextInterface;
}

const RoomInfoProvider = (props: RoomInfoProviderProps) => {
  return (
    <RoomInfoContext.Provider value={{...props.value}}>
      {props.children}
    </RoomInfoContext.Provider>
  );
};
/**
 * The MeetingInfo app state contains information about the active meeting.
 */
const useRoomInfo = createHook(RoomInfoContext);

export {RoomInfoProvider, useRoomInfo};
