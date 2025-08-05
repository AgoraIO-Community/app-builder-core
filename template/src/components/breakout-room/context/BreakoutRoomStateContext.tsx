import React, {createContext, useReducer} from 'react';
import {
  breakoutRoomReducer,
  initialBreakoutRoomState,
  BreakoutRoomAction,
  BreakoutRoomState,
} from '../state/reducer';
import {createHook} from 'customization-implementation';

export const BreakoutRoomStateContext = createContext<
  BreakoutRoomState | undefined
>(undefined);
export const BreakoutRoomDispatchContext = createContext<
  React.Dispatch<BreakoutRoomAction> | undefined
>(undefined);

const BreakoutRoomStateProvider = ({children}: {children: React.ReactNode}) => {
  const [state, dispatch] = useReducer(
    breakoutRoomReducer,
    initialBreakoutRoomState,
  );

  return (
    <BreakoutRoomStateContext.Provider value={state}>
      <BreakoutRoomDispatchContext.Provider value={dispatch}>
        {children}
      </BreakoutRoomDispatchContext.Provider>
    </BreakoutRoomStateContext.Provider>
  );
};

const useBreakoutRoomState = createHook(BreakoutRoomStateContext);
const useBreakoutRoomDispatch = createHook(BreakoutRoomDispatchContext);

export {
  useBreakoutRoomState,
  useBreakoutRoomDispatch,
  BreakoutRoomStateProvider,
};
