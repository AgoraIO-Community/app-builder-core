import React, {createContext, useReducer, useCallback} from 'react';
import {createAgoraRtcEngine} from '../../../../bridge/rtc/webNg';
import {ChannelProfileType} from '../../../../agora-rn-uikit';
import {ConnectionState} from 'agora-rtc-sdk-ng';
import {RtcConnection} from 'react-native-agora';
import {createHook} from 'customization-implementation';
import {
  BreakoutGroupActionTypes,
  BreakoutRoomAction,
  BreakoutRoomState,
  breakoutRoomReducer,
  initialBreakoutRoomState,
} from '../state/reducer';

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
  const [state, dispatch] = useReducer<
    React.Reducer<BreakoutRoomState, BreakoutRoomAction>
  >(breakoutRoomReducer, initialBreakoutRoomState);

  const onBreakoutRoomChannelStateChanged = (
    connection: RtcConnection,
    currState: ConnectionState,
  ) => {
    dispatch({
      type: BreakoutGroupActionTypes.ENGINE_SET_CHANNEL_STATUS,
      status: currState,
    });
  };

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
      let engine = state.breakoutGroupRtc.engine;

      if (!engine) {
        engine = createAgoraRtcEngine();
        dispatch({
          type: BreakoutGroupActionTypes.ENGINE_INIT,
          payload: {engine},
        });
        // Add listeners here
        engine.addListener(
          'onConnectionStateChanged',
          onBreakoutRoomChannelStateChanged,
        );
      }

      try {
        // Initialize RtcEngine
        await engine.initialize({appId});
        await engine.setChannelProfile(channelProfile);
        // Join RtcChannel
        await engine.joinChannel(token, channelName, optionalUid, {});
      } catch (e) {
        console.error(`[${roomId}] Failed to join channel`, e);
        throw e;
      }
    },
    [state.breakoutGroupRtc.engine],
  );

  const leaveRtcChannel = useCallback(async () => {
    if (state.breakoutGroupRtc.engine) {
      await state.breakoutGroupRtc.engine.leaveChannel();
      await state.breakoutGroupRtc.engine.release();
      dispatch({
        type: BreakoutGroupActionTypes.ENGINE_LEAVE_AND_DESTROY,
      });
    }
  }, [state.breakoutGroupRtc.engine]);

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
