import React, {createContext, useCallback, useRef} from 'react';
import RtcEngine, {createAgoraRtcEngine} from '../../../../bridge/rtc/webNg';
import {ChannelProfileType} from '../../../../agora-rn-uikit';
import {ConnectionState} from 'agora-rtc-sdk-ng';
import {RtcConnection} from 'react-native-agora';
import {createHook} from 'customization-implementation';
import {BreakoutGroupActionTypes} from '../state/reducer';
import {
  useBreakoutRoomDispatch,
  useBreakoutRoomState,
} from './BreakoutRoomStateContext';

// Context
const BreakoutRoomEngineContext = createContext<{
  joinRtcChannel: (
    roomId: string,
    config: {
      token: string;
      channelName: string;
      optionalUid: number;
    },
  ) => Promise<void>;
  leaveRtcChannel: () => Promise<void>;
} | null>(null);

// Provider
const BreakoutRoomEngineProvider: React.FC<{
  children: React.ReactNode;
}> = ({children}) => {
  const state = useBreakoutRoomState();
  const dispatch = useBreakoutRoomDispatch();

  const breakoutEngineRf = useRef<RtcEngine | null>(null);

  const onBreakoutRoomChannelStateChanged = useCallback(
    (_connection: RtcConnection, currState: ConnectionState) => {
      dispatch({
        type: BreakoutGroupActionTypes.ENGINE_SET_CHANNEL_STATUS,
        payload: {status: currState},
      });
    },
    [],
  );

  const joinRtcChannel = useCallback(
    async (
      roomId: string,
      {
        token,
        channelName,
        optionalUid = null,
      }: {
        token: string;
        channelName: string;
        optionalUid?: number | null;
      },
    ) => {
      let appId = $config.APP_ID;
      let channelProfile = ChannelProfileType.ChannelProfileLiveBroadcasting;
      if (!breakoutEngineRf.current) {
        let engine = createAgoraRtcEngine();
        engine.addListener(
          'onConnectionStateChanged',
          onBreakoutRoomChannelStateChanged,
        );
        breakoutEngineRf.current = engine; // ✅ set ref

        dispatch({
          type: BreakoutGroupActionTypes.ENGINE_INIT,
          payload: {engine},
        });
        // Add listeners here
      }
      console.log('supriya 3');
      try {
        // Initialize RtcEngine
        await breakoutEngineRf.current.initialize({appId});
        await breakoutEngineRf.current.setChannelProfile(channelProfile);
        // Join RtcChannel
        await breakoutEngineRf.current.joinChannel(
          token,
          channelName,
          optionalUid,
          {},
        );
      } catch (e) {
        console.error(`[${roomId}] Failed to join channel`, e);
        throw e;
      }
    },
    [dispatch, onBreakoutRoomChannelStateChanged],
  );

  const leaveRtcChannel = useCallback(async () => {
    if (state.breakoutGroupRtc.engine) {
      await state.breakoutGroupRtc.engine.leaveChannel();
      await state.breakoutGroupRtc.engine.release();
      dispatch({
        type: BreakoutGroupActionTypes.ENGINE_LEAVE_AND_DESTROY,
      });
    }
  }, [dispatch, state.breakoutGroupRtc.engine]);

  const value = {
    joinRtcChannel,
    leaveRtcChannel,
  };

  return (
    <BreakoutRoomEngineContext.Provider value={value}>
      {children}
    </BreakoutRoomEngineContext.Provider>
  );
};

const useBreakoutRoomEngine = createHook(BreakoutRoomEngineContext);

export {useBreakoutRoomEngine, BreakoutRoomEngineProvider};
