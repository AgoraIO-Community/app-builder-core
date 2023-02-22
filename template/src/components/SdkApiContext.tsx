import React, {createContext, useState, useEffect} from 'react';
import SDKMethodEventsManager from '../utils/SdkMethodEvents';
import {validateMeetingInfoData} from './meeting-info/useMeetingInfo';

const SdkApiInitState = {
  SdkJoinState: {
    phrase: '',
    meetingDetails: {},
  },
  SdkUserCustomization: {},
};

export const SDK_MEETING_TAG = 'sdk-initiated-meeting';

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
    SDKMethodEventsManager.on('join', (res, rej, roomDetail) => {
      console.log('[SDKContext] join state set');
      if (typeof roomDetail === 'object') {
        if (!validateMeetingInfoData(roomDetail)) {
          rej(new Error('Invalid meeting details'));
        }
        SdkApiInitState.SdkJoinState = {
          phrase: SDK_MEETING_TAG,
          meetingDetails: roomDetail,
          promise: {res, rej},
        };
      } else {
        SdkApiInitState.SdkJoinState = {
          phrase: roomDetail,
          promise: {res, rej},
        };
      }
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
      SDKMethodEventsManager.on('join', (res, rej, roomDetail) => {
        console.log('[SDKContext] setting join in component ', roomDetail);
        if (
          typeof roomDetail === 'object' &&
          validateMeetingInfoData(roomDetail)
        ) {
          setJoinState({
            phrase: SDK_MEETING_TAG,
            meetingDetails: roomDetail,
            promise: {res, rej},
          });
        } else if (typeof roomDetail === 'string' && roomDetail !== '') {
          setJoinState({
            phrase: roomDetail,
            promise: {res, rej},
          });
        } else {
          rej(new Error('Invalid meeting details'));
          return;
        }
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
