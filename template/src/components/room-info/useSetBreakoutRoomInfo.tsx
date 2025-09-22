import React, {createContext, useContext, useState} from 'react';
import {BreakoutChannelJoinEventPayload} from '../breakout-room/state/types';

type BreakoutRoomData = BreakoutChannelJoinEventPayload['data']['data'] & {
  isBreakoutMode: boolean;
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
}

export const BreakoutRoomInfoProvider: React.FC<
  BreakoutRoomInfoProviderProps
> = ({children}) => {
  const [breakoutRoomChannelData, setBreakoutRoomChannelData] =
    useState<BreakoutRoomData | null>(null);

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
      ...payload.data.data,
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
