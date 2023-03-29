import React, {createContext, useState, useEffect, useRef} from 'react';
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
  muteAudio: {
    callback: _InternalSDKMethodEventsMap['muteAudio'];
  };
  muteVideo: _InternalSDKMethodEventsMap['muteAudio'];
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
  muteVideo: (res, rej) => {
    rej(
      new Error(
        "Video call not initialized, call this method on 'join' or 'ready-to-join' event listener callback",
      ),
    );
  },
  muteAudio: {
    callback: (res, rej) => {
      rej(
        new Error(
          "Video call not initialized, call this method on 'join' or 'ready-to-join' event listener callback",
        ),
      );
    },
  },
  clearState: () => {},
};

export const SDK_MEETING_TAG = 'sdk-initiated-meeting';

export const SdkApiContext =
  createContext<SdkApiContextInterface>(SdkApiInitState);

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
  const [microphoneDeviceState, setMicrophoneDeviceState] = useState(
    SdkApiInitState.microphoneDevice,
  );
  const [speakerDeviceState, setSpeakerDeviceState] = useState(
    SdkApiInitState.speakerDevice,
  );
  const [cameraDeviceState, setCameraDeviceState] = useState(
    SdkApiInitState.cameraDevice,
  );

  const muteVideoListener = useRef(SdkApiInitState.muteVideo);

  const setMuteVideoListener = (value: SdkApiContextInterface['muteVideo']) => {
    muteVideoListener.current = value;
  };

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
    }
  };

  useEffect(() => {
    deRegisterListener();

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
        muteVideoListener: setMuteVideoListener,
        clearState,
      }}>
      {props.children}
    </SdkApiContext.Provider>
  );
};

export default SdkApiContextProvider;
