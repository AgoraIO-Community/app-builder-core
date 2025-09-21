import React, {createContext, useContext, useState} from 'react';
import {RoomData} from './useRoomInfo';
import {BreakoutChannelJoinEventPayload} from '../breakout-room/state/types';
import {useLocalUid} from 'customization-api';

const normalizeBreakoutInfo = (
  payload: BreakoutChannelJoinEventPayload,
  localUid: number,
): RoomData => {
  return {
    isHost: payload.data.data.mainUser.uid === localUid,
    meetingTitle: payload.data.data.room_name,
    roomId: {attendee: String(payload.data.data.room_id)},
    channel: payload.data.data.channel_name,
    uid: payload.data.data.mainUser.uid,
    token: payload.data.data.mainUser.rtc,
    rtmToken: payload.data.data.mainUser.rtm,
    screenShareUid: String(payload.data.data.screenShare.uid),
    screenShareToken: payload.data.data.screenShare.rtc,
    chat: {
      user_token: payload.data.data.chat.userToken,
      group_id: payload.data.data.chat.groupId,
      is_group_owner: payload.data.data.chat.isGroupOwner,
    },
    isSeparateHostLink: false,
  };
};

interface BreakoutRoomInfoContextValue {
  breakoutRoomChannelData: RoomData | null;
  setBreakoutRoomChannelData: React.Dispatch<
    React.SetStateAction<RoomData | null>
  >;
}

const BreakoutRoomInfoContext = createContext<BreakoutRoomInfoContextValue>({
  breakoutRoomChannelData: null,
  setBreakoutRoomChannelData: () => {},
});

interface BreakoutRoomInfoProviderProps {
  children: React.ReactNode;
}

export const BreakoutRoomInfoProvider: React.FC<
  BreakoutRoomInfoProviderProps
> = ({children}) => {
  const [breakoutRoomChannelData, setBreakoutRoomChannelData] =
    useState<RoomData | null>(null);

  return (
    <BreakoutRoomInfoContext.Provider
      value={{breakoutRoomChannelData, setBreakoutRoomChannelData}}>
      {children}
    </BreakoutRoomInfoContext.Provider>
  );
};

export const useBreakoutRoomInfo = () => {
  return useContext(BreakoutRoomInfoContext);
};

export const useSetBreakoutRoomInfo = () => {
  const {setBreakoutRoomChannelData} = useBreakoutRoomInfo();
  const localUid = useLocalUid();

  const setBreakoutRoomChannelInfo = (
    payload: BreakoutChannelJoinEventPayload,
  ) => {
    const normalizedData = normalizeBreakoutInfo(payload, localUid);
    setBreakoutRoomChannelData(normalizedData);
  };

  const clearBreakoutRoomChannelInfo = () => {
    setBreakoutRoomChannelData(null);
  };

  return {
    setBreakoutRoomChannelInfo,
    clearBreakoutRoomChannelInfo,
  };
};
