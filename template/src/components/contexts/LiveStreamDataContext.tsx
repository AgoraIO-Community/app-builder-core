import {UidType} from '../../../agora-rn-uikit';
import React, {createContext, Dispatch, SetStateAction, useState} from 'react';
import {createHook} from 'fpe-implementation';

export interface LiveStreamDataObjectInterface {
  [key: number]: {
    role: number;
    //todo hari update any type
    requests: any;
  };
}
export interface LiveStreamDataContextInterface {
  hostUids: UidType[];
  audienceUids: UidType[];
  setHostUids: Dispatch<SetStateAction<UidType[]>>;
  setAudienceUids: Dispatch<SetStateAction<UidType[]>>;
  liveStreamData: LiveStreamDataObjectInterface;
  setLiveStreamData: Dispatch<SetStateAction<LiveStreamDataObjectInterface>>;
}
const LiveStreamDataContext = createContext<LiveStreamDataContextInterface>({
  hostUids: [],
  audienceUids: [],
  liveStreamData: {},
  setLiveStreamData: () => {},
  setHostUids: () => {},
  setAudienceUids: () => {},
});

interface ScreenShareProviderProps {
  children: React.ReactNode;
}
const LiveStreamDataProvider = (props: ScreenShareProviderProps) => {
  const [liveStreamData, setLiveStreamData] =
    useState<LiveStreamDataObjectInterface>({});
  const [hostUids, setHostUids] = useState<UidType[]>([]);
  const [audienceUids, setAudienceUids] = useState<UidType[]>([]);
  return (
    <LiveStreamDataContext.Provider
      value={{
        hostUids,
        audienceUids,
        setAudienceUids,
        setHostUids,
        liveStreamData,
        setLiveStreamData,
      }}>
      {props.children}
    </LiveStreamDataContext.Provider>
  );
};
const useLiveStreamDataContext = createHook(LiveStreamDataContext);

export {useLiveStreamDataContext, LiveStreamDataProvider};
