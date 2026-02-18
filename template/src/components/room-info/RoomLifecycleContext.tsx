import {createContext} from 'react';
import {createHook} from 'customization-implementation';
import {RoomInfoContextInterface, RoomInfoDefaultValue} from './useRoomInfo';

type RoomLifecycleContextInterface = {
  enterBreakoutRoom: (info: RoomInfoContextInterface) => void;
  exitBreakoutRoom: () => void;
  /** Read-only snapshot of the main room info. Useful inside breakout rooms
   *  for accessing e.g. the main channel name or meeting title without
   *  switching the active room context. */
  mainRoomInfo: Readonly<RoomInfoContextInterface>;
  /** True when the active room is a breakout room. */
  isInBreakoutRoom: boolean;
};

export const RoomLifecycleContext =
  createContext<RoomLifecycleContextInterface>({
    enterBreakoutRoom: () => {},
    exitBreakoutRoom: () => {},
    mainRoomInfo: RoomInfoDefaultValue,
    isInBreakoutRoom: false,
  });

export const useRoomLifecycle = createHook(RoomLifecycleContext);
