import {UidType} from '../../../agora-rn-uikit';
import React, {
  createContext,
  useState,
  useContext,
  useReducer,
  useEffect,
} from 'react';
import {createHook} from 'customization-implementation';
import LiveStreamContext, {
  raiseHandListInterface,
} from '../../components/livestream';
import {ClientRole, useLocalUid} from '../../../agora-rn-uikit';
import {filterObject} from '../../utils';
import {useRender} from 'customization-api';

export interface LiveStreamDataObjectInterface {
  [key: number]: {
    role: number;
    raised: boolean;
    ts: number;
  };
}
export interface LiveStreamDataContextInterface {
  hostUids: UidType[];
  audienceUids: UidType[];
  liveStreamData: raiseHandListInterface;
}
const LiveStreamDataContext = createContext<LiveStreamDataContextInterface>({
  hostUids: [],
  audienceUids: [],
  liveStreamData: {},
});

interface ScreenShareProviderProps {
  children: React.ReactNode;
}
const LiveStreamDataProvider = (props: ScreenShareProviderProps) => {
  const {renderList} = useRender();
  const {raiseHandList} = useContext(LiveStreamContext);
  const [hostUids, setHostUids] = useState<UidType[]>([]);
  const [audienceUids, setAudienceUids] = useState<UidType[]>([]);

  React.useEffect(() => {
    if (Object.keys(renderList).length !== 0) {
      const hostList = filterObject(
        renderList,
        ([k, v]) =>
          (v?.type === 'rtc' || v?.type === 'live') && //||
          //(v?.type === 'screenshare' && v?.video == 1)
          (raiseHandList[k]
            ? raiseHandList[k]?.role == ClientRole.Broadcaster
            : true) &&
          !v?.offline,
      );
      const audienceList = filterObject(
        renderList,
        ([k, v]) =>
          (v?.type === 'rtc' || v?.type === 'live') &&
          raiseHandList[k]?.role == ClientRole.Audience &&
          !v.offline,
      );
      const hUids = Object.keys(hostList).map((uid) => parseInt(uid));
      const aUids = Object.keys(audienceList).map((uid) => parseInt(uid));

      setHostUids(hUids);
      setAudienceUids(aUids);
    }
  }, [renderList, raiseHandList]);

  return (
    <LiveStreamDataContext.Provider
      value={{
        liveStreamData: raiseHandList,
        hostUids: hostUids,
        audienceUids,
      }}>
      {props.children}
    </LiveStreamDataContext.Provider>
  );
};
const useLiveStreamDataContext = createHook(LiveStreamDataContext);

export {useLiveStreamDataContext, LiveStreamDataProvider};
