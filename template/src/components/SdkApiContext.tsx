import React, {createContext, useState, useEffect} from 'react';
import SDKMethodEventsManager from '../utils/SdkMethodEvents';

const SdkApiInitState = {
  SdkJoinState: {
    phrase: '',
  },
  SdkUserCustomization: {},
};

export const SdkApiContext = createContext(SdkApiInitState);

let moduleEventsUnsub: any[] = [];

const registerListener = () => {
  moduleEventsUnsub = [
    SDKMethodEventsManager.on('customize', (res, rej, customization) => {
      SdkApiInitState.SdkUserCustomization = {
        customization: customization,
        promise: {res, rej},
      };
    }),
    SDKMethodEventsManager.on('join', (res, rej, roomid) => {
      console.log('[SDKContext] join state set');
      SdkApiInitState.SdkJoinState = {
        phrase: roomid,
        promise: {res, rej},
      };
    }),
  ];
};

const deRegisterListener = () => {
  moduleEventsUnsub.forEach((v) => v());
};

const SdkApiContextProvider: React.FC = (props) => {
  const [joinState, setJoinState] = useState(SdkApiInitState.SdkJoinState);
  const [userCustomization, setUserCustomization] = useState(
    SdkApiInitState.SdkUserCustomization,
  );

  useEffect(() => {
    deRegisterListener();
    console.log('[SDKContext] join state is ', joinState);
    const unsub = [
      SDKMethodEventsManager.on('customize', (res, rej, customization) => {
        setUserCustomization({
          customization: customization,
          promise: {res, rej},
        });
      }),
      SDKMethodEventsManager.on('join', (res, rej, roomid) => {
        console.log('[SDKContext] setting join in component ', roomid);
        setJoinState({
          phrase: roomid,
          promise: {res, rej},
        });
      }),
    ];

    return () => {
      unsub.forEach((v) => v());
      registerListener();
    };
  }, []);

  return (
    <SdkApiContext.Provider
      value={{
        SdkJoinState: joinState,
        SdkUserCustomization: userCustomization,
      }}>
      {props.children}
    </SdkApiContext.Provider>
  );
};

export default SdkApiContextProvider;
