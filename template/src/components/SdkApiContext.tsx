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

type extractPromises<T extends (...p: any) => any> = {
  res: Parameters<T>[0];
  rej: Parameters<T>[1];
};

// Should correspond to the same SdkMethodEvent name
type SdkApiContextInterface = {
  join:
    | {
        initialized: true;
        phrase: string;
        meetingDetails?: Partial<MeetingInfoContextInterface['data']>;
        skipPrecall: boolean;
        promise: extractPromises<_InternalSDKMethodEventsMap['join']>;
      }
    | {
        initialized: false;
      };
  customize: {
    customization?: CustomizationApiInterface;
    promise?: extractPromises<_InternalSDKMethodEventsMap['customize']>;
  };
  // mediaDevice: {
  //   [k in MediaDeviceInfo['kind']]?: {
  //     deviceId: string;
  //     promise?: extractPromises<_InternalSDKMethodEventsMap['mediaDevice']>;
  //   };
  // };
  microphoneDevice: {
    deviceId?: string;
    promise?: extractPromises<_InternalSDKMethodEventsMap['microphoneDevice']>;
  };
  speakerDevice: {
    deviceId?: string;
    promise?: extractPromises<_InternalSDKMethodEventsMap['speakerDevice']>;
  };
  cameraDevice: {
    deviceId?: string;
    promise?: extractPromises<_InternalSDKMethodEventsMap['cameraDevice']>;
  };
  clearState: (key: keyof _InternalSDKMethodEventsMap, param?: any) => void;
};

const SdkApiInitState: SdkApiContextInterface = {
  join: {
    initialized: false,
  },
  customize: {},
  // mediaDevice: {},
  microphoneDevice: {},
  speakerDevice: {},
  cameraDevice: {},
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
  // mediaDevice: (setter) => {
  //   return SDKMethodEventsManager.on(
  //     'mediaDevice',
  //     (res, rej, deviceId, kind) => {
  //       setter({
  //         [kind]: {
  //           deviceId,
  //           promise: {res, rej},
  //         },
  //       });
  //     },
  //   );
  // },
  microphoneDevice: (setter) => {
    return SDKMethodEventsManager.on(
      'microphoneDevice',
      (res, rej, deviceId) => {
        setter({
          deviceId,
          promise: {res, rej},
        });
      },
    );
  },
  speakerDevice: (setter) => {
    return SDKMethodEventsManager.on('speakerDevice', (res, rej, deviceId) => {
      setter({
        deviceId,
        promise: {res, rej},
      });
    });
  },
  cameraDevice: (setter) => {
    return SDKMethodEventsManager.on('cameraDevice', (res, rej, deviceId) => {
      setter({
        deviceId,
        promise: {res, rej},
      });
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
    // commonEventHandlers.mediaDevice((state) => {
    //   SdkApiInitState.mediaDevice = {
    //     ...SdkApiInitState.mediaDevice,
    //     ...state,
    //   };
    // }),
    commonEventHandlers.microphoneDevice((state) => {
      SdkApiInitState.microphoneDevice = state;
    }),
    commonEventHandlers.speakerDevice((state) => {
      SdkApiInitState.speakerDevice = state;
    }),
    commonEventHandlers.cameraDevice((state) => {
      SdkApiInitState.cameraDevice = state;
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
  // const [mediaDeviceState, setMediaDeviceState] = useState(
  //   SdkApiInitState.setCamera,
  // );
  const [microphoneDeviceState, setMicrophoneDeviceState] = useState(
    SdkApiInitState.microphoneDevice,
  );
  const [speakerDeviceState, setSpeakerDeviceState] = useState(
    SdkApiInitState.speakerDevice,
  );
  const [cameraDeviceState, setCameraDeviceState] = useState(
    SdkApiInitState.cameraDevice,
  );

  const clearState: SdkApiContextInterface['clearState'] = (key, param) => {
    switch (key) {
      case 'join':
        setJoinState(SdkApiInitState.join);
        return;
      case 'customize':
        setUserCustomization(SdkApiInitState.customize);
        return;
      case 'microphoneDevice':
        setMicrophoneDeviceState({});
      case 'speakerDevice':
        setSpeakerDeviceState({});
      case 'cameraDevice':
        setCameraDeviceState({});
      // case 'mediaDevice':
      //   setMediaDeviceState((currentState) => {
      //     currentState[param] = undefined;
      //     return currentState;
      //   });
    }
  };

  useEffect(() => {
    deRegisterListener();

    // const applyPromiseWrapper = (
    //   state: SdkApiContextInterface['mediaDevice'],
    //   kind: MediaDeviceInfo['kind'],
    // ) => {
    //   if (state[kind]) {
    //     state[kind].promise.res = () => {
    //       const resolve = state[kind].promise.res;
    //       clearState('mediaDevice', kind);
    //       resolve();
    //     };
    //     state[kind].promise.rej = (reason?: any) => {
    //       const reject = state[kind].promise.rej;
    //       clearState('mediaDevice', kind);
    //       reject(reason);
    //     };
    //   }
    // };

    // setMediaDeviceState((currentState) => {
    //   // applyPromiseWrapper(currentState, 'audiooutput');
    //   // applyPromiseWrapper(currentState, 'audioinput');
    //   // applyPromiseWrapper(currentState, 'videoinput');
    //
    //   return currentState;
    // });

    const unsub = [
      commonEventHandlers.customize((state) => {
        setUserCustomization(state);
      }),
      commonEventHandlers.join((state) => {
        setJoinState(state);
      }),
      commonEventHandlers.microphoneDevice((state) => {
        setMicrophoneDeviceState(state);
      }),
      commonEventHandlers.speakerDevice((state) => {
        setSpeakerDeviceState(state);
      }),
      commonEventHandlers.cameraDevice((state) => {
        setCameraDeviceState(state);
      }),
      // commonEventHandlers.mediaDevice((state) => {
      //   // applyPromiseWrapper(state, 'audioinput');
      //   // applyPromiseWrapper(state, 'audiooutput');
      //   // applyPromiseWrapper(state, 'videoinput');
      //
      //   setMediaDeviceState((currentState) => {
      //     return {
      //       ...currentState,
      //       ...state,
      //     };
      //   });
      // }),
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
        microphoneDevice: microphoneDeviceState,
        speakerDevice: speakerDeviceState,
        cameraDevice: cameraDeviceState,
        clearState,
      }}>
      {props.children}
    </SdkApiContext.Provider>
  );
};

export default SdkApiContextProvider;
