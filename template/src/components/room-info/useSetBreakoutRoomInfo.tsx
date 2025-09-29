import React, {createContext, useContext, useState} from 'react';
import {BreakoutChannelJoinEventPayload} from '../breakout-room/state/types';

type BreakoutRoomData = {
  isBreakoutMode: boolean;
  channelId: string;
  breakoutRoomName: string;
};

interface BreakoutRoomInfoContextValue {
  breakoutRoomChannelData: BreakoutRoomData | null;
  setBreakoutRoomChannelData: React.Dispatch<
    React.SetStateAction<BreakoutRoomData | null>
  >;
}

const BreakoutRoomInfoContext = createContext<BreakoutRoomInfoContextValue>({
  breakoutRoomChannelData: null,
  setBreakoutRoomChannelData: () => {},
});

interface BreakoutRoomInfoProviderProps {
  children: React.ReactNode;
  initialData?: BreakoutRoomData | null;
}

export const BreakoutRoomInfoProvider: React.FC<
  BreakoutRoomInfoProviderProps
> = ({children, initialData = null}) => {
  const [breakoutRoomChannelData, setBreakoutRoomChannelData] =
    useState<BreakoutRoomData | null>(initialData);

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

  const setBreakoutRoomChannelInfo = (
    payload: BreakoutChannelJoinEventPayload,
  ) => {
    const breakoutData: BreakoutRoomData = {
      breakoutRoomName: payload.data.data.room_name,
      channelId: payload.data.data.channel_name,
      isBreakoutMode: true,
    };
    setBreakoutRoomChannelData(breakoutData);
  };

  const clearBreakoutRoomChannelInfo = () => {
    setBreakoutRoomChannelData(null);
  };

  return {
    setBreakoutRoomChannelInfo,
    clearBreakoutRoomChannelInfo,
  };
};
