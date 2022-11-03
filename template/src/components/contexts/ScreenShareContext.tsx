import {UidType, PropsContext} from '../../../agora-rn-uikit';
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import {createHook} from 'customization-implementation';

export interface ScreenShareObjectInterface {
  [key: string | number]: {
    name: string;
    isActive: boolean;
    ts: number;
  };
}
export interface ScreenShareContextInterface {
  screenShareData: ScreenShareObjectInterface;
  setScreenShareData: Dispatch<SetStateAction<ScreenShareObjectInterface>>;
}
const ScreenShareContext = createContext<ScreenShareContextInterface>({
  screenShareData: {},
  setScreenShareData: () => {},
});

interface ScreenShareProviderProps {
  children: React.ReactNode;
}
const ScreenShareProvider = (props: ScreenShareProviderProps) => {
  const {rtcProps} = useContext(PropsContext);
  const [screenShareData, setScreenShareData] =
    useState<ScreenShareObjectInterface>({
      [rtcProps?.screenShareUid]: {
        name: '',
        isActive: false,
        ts: 0,
      },
    });

  return (
    <ScreenShareContext.Provider value={{screenShareData, setScreenShareData}}>
      {props.children}
    </ScreenShareContext.Provider>
  );
};
const useScreenContext = createHook(ScreenShareContext);

export {useScreenContext, ScreenShareProvider};
