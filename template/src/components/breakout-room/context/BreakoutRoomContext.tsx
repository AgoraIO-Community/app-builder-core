import React, {useContext, useEffect, useRef} from 'react';
import {DispatchContext, UidType} from '../../../../agora-rn-uikit';
import {createHook} from 'customization-implementation';
import {randomNameGenerator} from '../../../utils';
import StorageContext from '../../StorageContext';
import getUniqueID from '../../../utils/getUniqueID';
import {logger} from '../../../logger/AppBuilderLogger';
import {useRoomInfo, useRtc, useLocalUid} from 'customization-api';
import {
  BreakoutGroupActionTypes,
  BreakoutGroup,
  BreakoutRoomState,
} from '../state/reducer';
import {BreakoutChannelJoinEventPayload} from '../state/types';
import {EventNames} from '../../../rtm-events';
import events from '../../../rtm-events-api';
import {useBreakoutRoomEngine} from './BreakoutRoomEngineContext';
import {
  useBreakoutRoomDispatch,
  useBreakoutRoomState,
} from './BreakoutRoomStateContext';

const getSanitizedPayload = (payload: BreakoutGroup[]) => {
  return payload.map(({id, ...rest}) => {
    if (typeof id === 'string' && id.startsWith('temp')) {
      return rest;
    }
    return id !== undefined ? {...rest, id} : rest;
  });
};

interface BreakoutRoomContextValue {
  breakoutSessionId: BreakoutRoomState['breakoutSessionId'];
  breakoutGroups: BreakoutRoomState['breakoutGroups'];
  breakoutGroupRtc: BreakoutRoomState['breakoutGroupRtc'];
  createBreakoutRoomGroup: (name?: string) => void;
  addUserIntoGroup: (
    uid: UidType,
    selectGroupId: string,
    isHost: boolean,
  ) => void;
  startBreakoutRoom: () => void;
  checkBreakoutRoomSession: () => void;
}

const BreakoutRoomContext = React.createContext<BreakoutRoomContextValue>({
  breakoutSessionId: undefined,
  breakoutGroups: [],
  breakoutGroupRtc: {} as BreakoutRoomState['breakoutGroupRtc'],
  createBreakoutRoomGroup: () => {},
  addUserIntoGroup: () => {},
  startBreakoutRoom: () => {},
  checkBreakoutRoomSession: () => {},
});

const BreakoutRoomProvider = ({children}: {children: React.ReactNode}) => {
  const {store} = useContext(StorageContext);
  const {RtcEngineUnsafe} = useRtc();
  const engine = useRef(RtcEngineUnsafe);
  const {
    data: {roomId},
  } = useRoomInfo();
  const localUid = useLocalUid();

  const {dispatch: rtcDispatch} = useContext(DispatchContext);
  const {joinRtcChannel} = useBreakoutRoomEngine();
  const state = useBreakoutRoomState();
  const dispatch = useBreakoutRoomDispatch();

  useEffect(() => {
    events.on(
      EventNames.BREAKOUT_ROOM_JOIN_DETAILS,
      onBreakoutRoomJoinDetailsReceived,
    );
    return () => {
      events.off(
        EventNames.BREAKOUT_ROOM_JOIN_DETAILS,
        onBreakoutRoomJoinDetailsReceived,
      );
    };
  }, []);

  const onBreakoutRoomJoinDetailsReceived = async evtData => {
    const {payload, sender, ts, source} = evtData;
    const data: BreakoutChannelJoinEventPayload = JSON.parse(payload);
    console.log('supriya onBreakoutRoomJoinDetailsReceived data: ', data);
    const {channel_name, mainUser, screenShare, room_id} = data.data.data;
    try {
      // 2. Attach all events and from there poulate the state
      // 3. all published unpublished state needs to be stored in breakout
      // 4. Are u part of main room or breakout room
      // 5. Think about the flow for host join breakout room

      try {
        engine.current.leaveChannel();
        rtcDispatch({
          type: 'LocalUserLeft',
          value: [localUid],
        });
        await joinRtcChannel(`${room_id}`, {
          token: mainUser.rtc,
          channelName: channel_name,
          optionalUid: mainUser.uid,
        });
      } catch (error) {
        console.error('Breakout room engine creation error: ', error);
      }
    } catch (error) {
      console.log('error while leaving or join parent channel: ', error);
    }
  };

  const checkBreakoutRoomSession = async () => {
    try {
      const requestId = getUniqueID();
      const response = await fetch(
        `${$config.BACKEND_ENDPOINT}/v1/channel/breakout-room?passphrase=${roomId.host}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            authorization: store.token ? `Bearer ${store.token}` : '',
            'X-Request-Id': requestId,
            'X-Session-Id': logger.getSessionId(),
          },
        },
      );
      if (response.status === 204) {
        // No active breakout session — no content
        console.log('No active breakout room session (204)');
        return;
      }
      if (!response.ok) {
        // Optional: handle other error codes
        throw new Error(`Failed with status ${response.status}`);
      }
      const data = await response.json();
      if (data?.session_id) {
        dispatch({
          type: BreakoutGroupActionTypes.SET_SESSION_ID,
          payload: {sessionId: data.session_id},
        });
        if (data?.breakout_room) {
          dispatch({
            type: BreakoutGroupActionTypes.SET_GROUPS,
            payload: data.breakout_room,
          });
        }
      }
    } catch (error) {
      console.error('Error checking active breakout room:', error);
    }
  };

  const startBreakoutRoom = () => {
    const startReqTs = Date.now();
    const requestId = getUniqueID();

    fetch(`${$config.BACKEND_ENDPOINT}/v1/channel/breakout-room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: store.token ? `Bearer ${store.token}` : '',
        'X-Request-Id': requestId,
        'X-Session-Id': logger.getSessionId(),
      },
      body: JSON.stringify({
        passphrase: roomId.host,
        switch_room: false,
        session_id: state.breakoutSessionId || randomNameGenerator(6),
        breakout_room: getSanitizedPayload(state.breakoutGroups),
      }),
    })
      .then(async res => {
        const endRequestTs = Date.now();
        const latency = endRequestTs - startReqTs;
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(`Breakout room creation failed: ${msg}`);
        }
      })
      .catch(err => {
        console.log('debugging err', err);
      });
  };

  const createBreakoutRoomGroup = () => {
    dispatch({
      type: BreakoutGroupActionTypes.CREATE_GROUP,
    });
  };

  const addUserIntoGroup = (
    uid: UidType,
    toGroupId: string,
    isHost: boolean,
  ) => {
    dispatch({
      type: BreakoutGroupActionTypes.MOVE_PARTICIPANT,
      payload: {uid, fromGroupId: null, toGroupId, isHost},
    });
  };

  return (
    <BreakoutRoomContext.Provider
      value={{
        breakoutSessionId: state.breakoutSessionId,
        breakoutGroups: state.breakoutGroups,
        breakoutGroupRtc: state.breakoutGroupRtc,
        createBreakoutRoomGroup,
        addUserIntoGroup,
        startBreakoutRoom,
        checkBreakoutRoomSession,
      }}>
      {children}
    </BreakoutRoomContext.Provider>
  );
};

const useBreakoutRoom = createHook(BreakoutRoomContext);

export {useBreakoutRoom, BreakoutRoomProvider};
