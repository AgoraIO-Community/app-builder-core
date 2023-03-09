import React, {createContext, useState, useEffect} from 'react';
import SDKMethodEventsManager, {
  _InternalSDKMethodEventsMap,
} from '../utils/SdkMethodEvents';
import {
  validateMeetingInfoData,
  MeetingInfoContextInterface,
} from './meeting-info/useMeetingInfo';
import {CustomizationApiInterface} from 'customization-api';
import {Unsubscribe} from 'nanoevents';

type SdkApiContextInterface = {
  join:
    | {
        initialized: true;
        phrase: string;
        meetingDetails?: Partial<MeetingInfoContextInterface['data']>;
        skipPrecall: boolean;
        promise: {
          res: Parameters<_InternalSDKMethodEventsMap['join']>[0];
          rej: Parameters<_InternalSDKMethodEventsMap['join']>[1];
        };
      }
    | {
        initialized: false;
      };
  customize: {
    customization?: CustomizationApiInterface;
    promise?: {
      res: Parameters<_InternalSDKMethodEventsMap['customize']>[0];
      rej: Parameters<_InternalSDKMethodEventsMap['customize']>[1];
    };
  };
  clearState: (key: keyof _InternalSDKMethodEventsMap) => void;
};

const SdkApiInitState: SdkApiContextInterface = {
  join: {
    initialized: false,
  },
  customize: {},
  clearState: () => {},
};

export const SDK_MEETING_TAG = 'sdk-initiated-meeting';

export const SdkApiContext = createContext(SdkApiInitState);

let moduleEventsUnsub: any[] = [];

type commonEventHandlers = {
  [K in keyof _InternalSDKMethodEventsMap]?: (
    setter: (p: SdkApiContextInterface[K]) => void,
  ) => Unsubscribe;
};

const commonEventHandlers: commonEventHandlers = {
  join: (setter) => {
    return SDKMethodEventsManager.on(
      'join',
      (res, rej, roomDetail, skipPrecall) => {
        if (typeof roomDetail === 'object') {
          if (!validateMeetingInfoData(roomDetail)) {
            rej(new Error('Invalid meeting details'));
            return;
          }
          setter({
            initialized: true,
            phrase: SDK_MEETING_TAG,
            meetingDetails: roomDetail,
            skipPrecall,
            promise: {res, rej},
          });
        } else if (
          typeof roomDetail === 'string' &&
          roomDetail.trim().length > 0
        ) {
          setter({
            initialized: true,
            phrase: roomDetail,
            skipPrecall,
            promise: {res, rej},
          });
        } else {
          rej(new Error('Invalid room detail'));
        }
      },
    );
  },
  customize: (setter) => {
    return SDKMethodEventsManager.on('customize', (res, rej, customization) => {
      setter({
        customization: customization,
      });
      res();
    });
  },
};

const registerListener = () => {
  moduleEventsUnsub = [
    commonEventHandlers.customize((state) => {
      SdkApiInitState.customize = state;
    }),
    commonEventHandlers.join((state) => {
      SdkApiInitState.join = state;
    }),
  ];
};

const deRegisterListener = () => {
  moduleEventsUnsub.forEach((v) => v());
};

const SdkApiContextProvider: React.FC = (props) => {
  const [joinState, setJoinState] = useState(SdkApiInitState.join);
  const [userCustomization, setUserCustomization] = useState(
    SdkApiInitState.customize,
  );

  const clearState: SdkApiContextInterface['clearState'] = (key) => {
    switch (key) {
      case 'join':
        setJoinState(SdkApiInitState.join);
        return;
      case 'customize':
        setUserCustomization(SdkApiInitState.customize);
    }
  };

  useEffect(() => {
    deRegisterListener();
    console.log('[SDKContext] join state is ', joinState);
    const unsub = [
      commonEventHandlers.customize((state) => {
        setUserCustomization(state);
      }),
      commonEventHandlers.join((state) => {
        setJoinState(state);
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
        join: joinState,
        customize: userCustomization,
        clearState,
      }}>
      {props.children}
    </SdkApiContext.Provider>
  );
};

export default SdkApiContextProvider;
