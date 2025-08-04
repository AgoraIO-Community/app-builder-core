import React, {useContext, useReducer} from 'react';
import {UidType} from '../../../../agora-rn-uikit';
import {createHook} from 'customization-implementation';
import {randomNameGenerator} from '../../../utils';
import StorageContext from '../../StorageContext';
import getUniqueID from '../../../utils/getUniqueID';
import {logger} from '../../../logger/AppBuilderLogger';
import {useRoomInfo} from 'customization-api';
import {
  BreakoutGroupActionTypes,
  BreakoutGroup,
  BreakoutRoomState,
  breakoutRoomReducer,
  initialBreakoutRoomState,
  RoomAssignmentStrategy,
} from '../state/reducer';

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
  assignmentStrategy: RoomAssignmentStrategy;
  createBreakoutRoomGroup: (name?: string) => void;
  addUserIntoGroup: (
    uid: UidType,
    selectGroupId: string,
    isHost: boolean,
  ) => void;
  startBreakoutRoom: () => void;
  checkBreakoutRoomSession: () => void;
  assignParticipants: (
    strategy: RoomAssignmentStrategy,
    participants: UidType[],
  ) => void;
}

const BreakoutRoomContext = React.createContext<BreakoutRoomContextValue>({
  breakoutSessionId: undefined,
  assignmentStrategy: RoomAssignmentStrategy.NO_ASSIGN,
  breakoutGroups: [],
  assignParticipants: () => {},
  createBreakoutRoomGroup: () => {},
  addUserIntoGroup: () => {},
  startBreakoutRoom: () => {},
  checkBreakoutRoomSession: () => {},
});

const BreakoutRoomProvider = ({children}: {children: React.ReactNode}) => {
  const {store} = useContext(StorageContext);
  const [state, dispatch] = useReducer(
    breakoutRoomReducer,
    initialBreakoutRoomState,
  );
  const {
    data: {roomId},
  } = useRoomInfo();

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

  const assignParticipants = (
    strategy: RoomAssignmentStrategy,
    participants: UidType[],
  ) => {
    dispatch({
      type: BreakoutGroupActionTypes.ASSIGN_PARTICPANTS,
      payload: {strategy, participantsToAssign: [...participants]},
    });
  };
  return (
    <BreakoutRoomContext.Provider
      value={{
        breakoutSessionId: state.breakoutSessionId,
        breakoutGroups: state.breakoutGroups,
        assignmentStrategy: state.assignmentStrategy,
        assignParticipants: assignParticipants,
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
