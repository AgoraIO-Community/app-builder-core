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
import {cloneDeep} from 'lodash';

type extractPromises<T extends (...p: any) => any> = {
  res: Parameters<T>[0];
  rej: Parameters<T>[1];
};

// Should correspond to the same SdkMethodEvent name
type SdkApiContextInterface = {
  enterRoom: {
    set: (p: extractPromises<_InternalSDKMethodEventsMap['join']>) => void;
    promise?: extractPromises<_InternalSDKMethodEventsMap['join']>;
  };
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
  muteAllParticipants: {
    state: boolean;
    promise?: extractPromises<
      _InternalSDKMethodEventsMap['muteAllParticipants']
    >;
  };
  setMuteAllParticipantsListenerReady: (init: boolean) => void;
  onMuteAudio: (callback: _InternalSDKMethodEventsMap['muteAudio']) => void;
  onMuteVideo: (callback: _InternalSDKMethodEventsMap['muteVideo']) => void;
  clearState: (
    key: keyof _InternalSDKMethodEventsMap | 'enterRoom' | 'all',
    hard?: boolean,
  ) => void;
};

const defaultMuteListener = ((_, rej) => {
  rej(
    new Error(
      "Video call not initialized, call this method on 'join' or 'ready-to-join' event listener callback",
    ),
  );
}) as _InternalSDKMethodEventsMap['muteVideo'];

const defaultMuteAllParticipantsListener = ((res, _, param) => {
  const muteStateToBeSet =
    typeof param === 'function'
      ? param(SdkApiInitState.muteAllParticipants.state)
      : param;

  SdkApiInitState.muteAllParticipants.state = muteStateToBeSet;
  res();
}) as _InternalSDKMethodEventsMap['muteAllParticipants'];

const SdkApiDefaultState: SdkApiContextInterface = {
  enterRoom: {
    set: () => {},
  },
  join: {
    initialized: false,
  },
  customize: {},
  // mediaDevice: {},
  microphoneDevice: {},
  speakerDevice: {},
  cameraDevice: {},
  muteAllParticipants: {
    state: false,
  },
  setMuteAllParticipantsListenerReady: () => {},
  onMuteVideo: (_) => {},
  onMuteAudio: (_) => {},
  clearState: () => {},
};
const SdkApiInitState: SdkApiContextInterface = cloneDeep(SdkApiDefaultState);

export const clearStateGlobal = (
  state: keyof SdkApiContextInterface | 'all',
) => {
  if (state === 'all') {
    for (const key in SdkApiInitState)
      SdkApiInitState[key] = cloneDeep(SdkApiDefaultState[key]);
  } else {
    //@ts-expect-error
    SdkApiInitState[state] = cloneDeep(SdkApiDefaultState[state]);
  }
};

export const READ_ONLY_SdkApiInitState = SdkApiInitState;

export const SDK_MEETING_TAG = 'sdk-initiated-meeting';

export const SdkApiContext =
  createContext<SdkApiContextInterface>(SdkApiInitState);

let moduleEventsUnsub: any[] = [];

type commonEventHandlers = {
  [K in keyof Omit<
    _InternalSDKMethodEventsMap,
    'muteVideo' | 'muteAudio' | 'flushQueue'
  >]?: (setter: (p: SdkApiContextInterface[K]) => void) => Unsubscribe;
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
    SDKMethodEventsManager.on(
      'muteAllParticipants',
      defaultMuteAllParticipantsListener,
    ),
    SDKMethodEventsManager.on('muteVideo', defaultMuteListener),
    SDKMethodEventsManager.on('muteAudio', defaultMuteListener),
    SDKMethodEventsManager.on('clearState', (res, _, queue) => {
      clearStateGlobal(queue);
      res();
    }),
  ];
};

registerListener();

const deRegisterListener = () => {
  moduleEventsUnsub.forEach((v) => v());
};

const SdkApiContextProvider: React.FC = (props) => {
  const [joinState, setJoinState] = useState(SdkApiInitState.join);
  const [enterRoom, setEnterRoom] =
    useState<extractPromises<_InternalSDKMethodEventsMap['join']>>();
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
  const [muteAllParticipantsState, setMuteAllParticipantsState] = useState(
    SdkApiInitState.muteAllParticipants,
  );
  const [
    muteAllParticipantsListenerReady,
    setMuteAllParticipantsListenerReady,
  ] = useState(false);

  const muteVideoListener = useRef(defaultMuteListener);
  const muteAudioListener = useRef(defaultMuteListener);

  const muteAllParticipantsListener = useRef(
    defaultMuteAllParticipantsListener,
  );

  const setMuteVideoListener = (
    value: _InternalSDKMethodEventsMap['muteVideo'],
  ) => {
    muteVideoListener.current = value;
  };

  const setMuteAudioListener = (
    value: _InternalSDKMethodEventsMap['muteAudio'],
  ) => {
    muteAudioListener.current = value;
  };

  const clearState: SdkApiContextInterface['clearState'] = (key, hard) => {
    let fallthrough = false;
    switch (key) {
      case 'all':
        fallthrough = true;
      case 'join':
        setJoinState(hard ? SdkApiDefaultState.join : SdkApiInitState.join);
        if (!fallthrough) break;
      case 'enterRoom':
        setEnterRoom(null);
        if (!fallthrough) break;
      case 'customize':
        setUserCustomization(
          hard ? SdkApiDefaultState.customize : SdkApiInitState.customize,
        );
        if (!fallthrough) break;
      case 'microphoneDevice':
        setMicrophoneDeviceState({});
        if (!fallthrough) break;
      case 'speakerDevice':
        setSpeakerDeviceState({});
        if (!fallthrough) break;
      case 'cameraDevice':
        setCameraDeviceState({});
        if (!fallthrough) break;
      case 'muteAllParticipants':
        setMuteAllParticipantsState((current) => {
          return {
            state: current.state,
            promise: undefined,
          };
        });
        if (!fallthrough) break;
      case 'muteVideo':
        setMuteVideoListener(defaultMuteListener);
        if (!fallthrough) break;
      case 'muteAudio':
        setMuteVideoListener(defaultMuteListener);
        if (!fallthrough) break;
    }
  };

  useEffect(() => {
    muteAllParticipantsListener.current = (res, rej, param) => {
      const muteStateToBeSet =
        typeof param === 'function'
          ? param(muteAllParticipantsState.state)
          : param;
      // To check if meeting is joined and the listener is set up
      if (muteAllParticipantsListenerReady) {
        setMuteAllParticipantsState({
          state: muteStateToBeSet,
          promise: {
            res,
            rej,
          },
        });
      } else {
        // Modifying the init state as well since this condition means
        // engine hasn't been initialized yet, hence initState will determine
        // the participant audio state with which engine is initialized with.
        SdkApiInitState.muteAllParticipants.state = muteStateToBeSet;
        setMuteAllParticipantsState({
          state: muteStateToBeSet,
        });
        res();
      }
    };
  }, [muteAllParticipantsState, muteAllParticipantsListenerReady]);

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
      SDKMethodEventsManager.on('muteAllParticipants', (...args) => {
        muteAllParticipantsListener.current(...args);
      }),
      SDKMethodEventsManager.on('muteVideo', (...args) => {
        muteVideoListener.current(...args);
      }),
      SDKMethodEventsManager.on('muteAudio', (...args) => {
        muteAudioListener.current(...args);
      }),
      SDKMethodEventsManager.on('clearState', (res, _, queue) => {
        clearStateGlobal(queue);
        clearState(queue, true);
        res();
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
        enterRoom: {
          set: setEnterRoom,
          promise: enterRoom,
        },
        join: joinState,
        customize: userCustomization,
        microphoneDevice: microphoneDeviceState,
        speakerDevice: speakerDeviceState,
        cameraDevice: cameraDeviceState,
        muteAllParticipants: muteAllParticipantsState,
        setMuteAllParticipantsListenerReady,
        onMuteAudio: setMuteAudioListener,
        onMuteVideo: setMuteVideoListener,
        clearState,
      }}>
      {props.children}
    </SdkApiContext.Provider>
  );
};

export default SdkApiContextProvider;
