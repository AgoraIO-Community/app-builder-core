/*
********************************************
 Copyright © 2026 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation
 (the "Materials") are owned by Agora Lab, Inc. and its licensors. The Materials may not be
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.
 Use without a license or in violation of any license terms and conditions (including use for
 any purpose competitive to Agora Lab, Inc.'s business) is strictly prohibited. For more
 information visit https://appbuilder.agora.io.
*********************************************
*/

import React, {useState, useMemo, useRef, useEffect, useCallback} from 'react';
import {
  RoomInfoContextInterface,
  RoomInfoDefaultValue,
  RoomInfoProvider,
} from './useRoomInfo';
import {SetRoomInfoProvider} from './useSetRoomInfo';
import {RoomLifecycleContext} from './RoomLifecycleContext';
import LocalEventEmitter, {
  LocalEventsEnum,
} from '../../rtm-events-api/LocalEvents';

export enum RoomType {
  MAIN = 'MAIN',
  BREAKOUT = 'BREAKOUT',
}

// Room-scoped RTC data belongs with RoomInfo
// RtcProps is “engine config” (Runtime / device RTC data store in diff file),
export const RoomInfoManager: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [mainRoomInfo, setMainRoomInfo] =
    useState<RoomInfoContextInterface>(RoomInfoDefaultValue);

  // State for breakout room
  const [breakoutRoomInfo, setBreakoutRoomInfo] =
    useState<RoomInfoContextInterface>(RoomInfoDefaultValue);

  // Track which room is currently active
  const [activeRoomType, setActiveRoomType] = useState(RoomType.MAIN);
  const activeRoomTypeRef = useRef(activeRoomType);
  useEffect(() => {
    activeRoomTypeRef.current = activeRoomType;
  }, [activeRoomType]);

  const roomInfo = useMemo(() => {
    console.log('supriya-debugroom activeRoomType', activeRoomType);
    return activeRoomType === RoomType.MAIN ? mainRoomInfo : breakoutRoomInfo;
  }, [activeRoomType, mainRoomInfo, breakoutRoomInfo]);

  const setRoomInfo = useCallback(
    (updater: React.SetStateAction<RoomInfoContextInterface>) => {
      console.log('supriya-debugroom setRoomInfo called');
      if (activeRoomTypeRef.current === RoomType.MAIN) {
        setMainRoomInfo(updater);
      } else {
        setBreakoutRoomInfo(updater);
      }
    },
    [],
  );

  const enterBreakoutRoom = useCallback((info: RoomInfoContextInterface) => {
    console.log('supriya-debugroom enterBreakoutRoom info', info);
    setBreakoutRoomInfo(info);
    activeRoomTypeRef.current = RoomType.BREAKOUT; // immediate routing switch
    setActiveRoomType(RoomType.BREAKOUT);
  }, []);

  const exitBreakoutRoom = useCallback(() => {
    activeRoomTypeRef.current = RoomType.MAIN; // immediate routing switch
    setActiveRoomType(RoomType.MAIN);
  }, []);

  const isInBreakoutRoom = activeRoomType === RoomType.BREAKOUT;

  // Memoize provider values so consumers only re-render when deps actually change
  const setRoomInfoValue = useMemo(() => ({setRoomInfo}), [setRoomInfo]);
  const lifecycleValue = useMemo(
    () => ({
      enterBreakoutRoom,
      exitBreakoutRoom,
      mainRoomInfo,
      isInBreakoutRoom,
    }),
    [enterBreakoutRoom, exitBreakoutRoom, mainRoomInfo, isInBreakoutRoom],
  );

  const updateTokenRef = useRef((token: string) => {
    const updater = (prevState: RoomInfoContextInterface) => ({
      ...prevState,
      loginToken: token,
    });
    setMainRoomInfo(updater);
    setBreakoutRoomInfo(updater);
  });

  useEffect(() => {
    const handler = (...args: any[]) => updateTokenRef.current(...args);
    LocalEventEmitter.on(LocalEventsEnum.SDK_TOKEN_CHANGED, handler);
    return () => {
      LocalEventEmitter.off(LocalEventsEnum.SDK_TOKEN_CHANGED, handler);
    };
  }, []);

  console.log('supriya-debugroom roomInfo', roomInfo);
  console.log('supriya-debugroom breakoutRoomInfo', breakoutRoomInfo);
  return (
    <RoomLifecycleContext.Provider value={lifecycleValue}>
      <SetRoomInfoProvider value={setRoomInfoValue}>
        <RoomInfoProvider value={roomInfo}>{children}</RoomInfoProvider>
      </SetRoomInfoProvider>
    </RoomLifecycleContext.Provider>
  );
};
