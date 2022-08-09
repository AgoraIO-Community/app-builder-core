import {UidType} from '../../../agora-rn-uikit';
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import {createHook} from 'fpe-implementation';
import {filterObject} from '../../utils/index';
import {useRtcContext} from 'fpe-api';

export interface WhiteboardObjectInterface {
  [key: number]: {
    active: boolean;
    parentId: UidType;
    type: 'whiteboard';
  };
}
export interface WhiteboardContextInterface {
  whiteboardData: WhiteboardObjectInterface;
  setWhiteboardData: Dispatch<SetStateAction<WhiteboardObjectInterface>>;
}
const WhiteboardContext = createContext<WhiteboardContextInterface>({
  whiteboardData: {},
  setWhiteboardData: () => {},
});

interface WhiteboardProviderProps {
  children: React.ReactNode;
}
const WhiteboardProvider = (props: WhiteboardProviderProps) => {
  const [whiteboardData, setWhiteboardData] =
    useState<WhiteboardObjectInterface>({});
  const {dispatch} = useRtcContext();

  useEffect(() => {
    const activeData = filterObject(
      whiteboardData,
      ([k, v]) => v.active === true,
    );
    Object.keys(activeData).map((uid) => {
      const uidAsNumber = parseInt(uid);
      dispatch({
        type: 'AddCustomContent',
        value: [uidAsNumber, activeData[uidAsNumber]],
      });
    });
  }, [whiteboardData]);

  return (
    <WhiteboardContext.Provider value={{whiteboardData, setWhiteboardData}}>
      {props.children}
    </WhiteboardContext.Provider>
  );
};
const useScreenContext = createHook(WhiteboardContext);

export {useScreenContext, WhiteboardProvider};
