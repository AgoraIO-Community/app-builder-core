import React, {useContext, useReducer, useEffect} from 'react';
import {ContentInterface, UidType} from '../../../../agora-rn-uikit';
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
import {useLocalUid} from '../../../../agora-rn-uikit';
import {useContent} from '../../../../customization-api';

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
  setStrategy: (strategy: RoomAssignmentStrategy) => void;
  unsassignedParticipants: {uid: UidType; user: ContentInterface}[];
  createBreakoutRoomGroup: (name?: string) => void;
  addUserIntoGroup: (
    uid: UidType,
    selectGroupId: string,
    isHost: boolean,
  ) => void;
  upsertBreakoutRoomAPI: () => void;
  closeBreakoutRoomAPI: () => void;
  checkIfBreakoutRoomSessionExistsAPI: () => Promise<boolean>;
  assignParticipants: () => void;
}

const BreakoutRoomContext = React.createContext<BreakoutRoomContextValue>({
  breakoutSessionId: undefined,
  unsassignedParticipants: [],
  breakoutGroups: [],
  assignmentStrategy: RoomAssignmentStrategy.NO_ASSIGN,
  setStrategy: () => {},
  assignParticipants: () => {},
  createBreakoutRoomGroup: () => {},
  addUserIntoGroup: () => {},
  upsertBreakoutRoomAPI: () => {},
  closeBreakoutRoomAPI: () => {},
  checkIfBreakoutRoomSessionExistsAPI: async () => false,
});

const BreakoutRoomProvider = ({children}: {children: React.ReactNode}) => {
  const {store} = useContext(StorageContext);
  const {defaultContent, activeUids} = useContent();
  const localUid = useLocalUid();
  const [state, dispatch] = useReducer(
    breakoutRoomReducer,
    initialBreakoutRoomState,
  );
  const {
    data: {roomId},
  } = useRoomInfo();

  // Update unassigned participants whenever defaultContent or activeUids change
  useEffect(() => {
    // Get currently assigned participants from all rooms
    // Filter active UIDs to exclude:
    // 1. Custom content (not type 'rtc')
    // 2. Screenshare UIDs
    // 3. Offline users
    const filteredParticipants = activeUids
      .filter(uid => {
        const user = defaultContent[uid];
        if (!user) {
          return false;
        }
        // Only include RTC users
        if (user.type !== 'rtc') {
          return false;
        }
        // Exclude offline users
        if (user.offline) {
          return false;
        }
        // Exclude screenshare UIDs (they typically have a parentUid)
        if (user.parentUid) {
          return false;
        }
        // Exclude yourself from assigning
        if (uid === localUid) {
          return false;
        }
        return true;
      })
      .map(uid => ({
        uid,
        user: defaultContent[uid],
      }));

    // Sort participants with local user first
    const sortedParticipants = filteredParticipants.sort((a, b) => {
      if (a.uid === localUid) {
        return -1;
      }
      if (b.uid === localUid) {
        return 1;
      }
      return 0;
    });

    dispatch({
      type: BreakoutGroupActionTypes.UPDATE_UNASSIGNED_PARTICIPANTS,
      payload: {
        unassignedParticipants: sortedParticipants,
      },
    });
  }, [defaultContent, activeUids, localUid]);

  useEffect(() => {
    console.log('supriya breakout group changed');
    upsertBreakoutRoomAPI('UPDATE');
  }, [state.breakoutGroups]);

  const checkIfBreakoutRoomSessionExistsAPI = async (): Promise<boolean> => {
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
        // No active breakout session
        console.log('No active breakout room session (204)');
        return false;
      }

      if (!response.ok) {
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
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking active breakout room:', error);
      return false;
    }
  };

  const upsertBreakoutRoomAPI = (type: 'START' | 'UPDATE' = 'START') => {
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
      .then(async response => {
        const endRequestTs = Date.now();
        const latency = endRequestTs - startReqTs;
        if (!response.ok) {
          const msg = await response.text();
          throw new Error(`Breakout room creation failed: ${msg}`);
        } else {
          const data = await response.json();
          console.log('supriya update res', response);

          if (type === 'START' && data?.session_id) {
            dispatch({
              type: BreakoutGroupActionTypes.SET_SESSION_ID,
              payload: {sessionId: data.session_id},
            });
          }
        }
      })
      .catch(err => {
        console.log('debugging err', err);
      });
  };

  const closeBreakoutRoomAPI = () => {
    console.log('supriya close breakout room API not yet implemented');
  };

  const setStrategy = (strategy: RoomAssignmentStrategy) => {
    dispatch({
      type: BreakoutGroupActionTypes.SET_ASSIGNMENT_STRATEGY,
      payload: {strategy},
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

  const assignParticipants = () => {
    dispatch({
      type: BreakoutGroupActionTypes.ASSIGN_PARTICPANTS,
    });
  };

  return (
    <BreakoutRoomContext.Provider
      value={{
        breakoutSessionId: state.breakoutSessionId,
        breakoutGroups: state.breakoutGroups,
        assignmentStrategy: state.assignmentStrategy,
        setStrategy,
        assignParticipants: assignParticipants,
        unsassignedParticipants: state.unassignedParticipants,
        createBreakoutRoomGroup,
        checkIfBreakoutRoomSessionExistsAPI,
        upsertBreakoutRoomAPI,
        closeBreakoutRoomAPI,
        addUserIntoGroup,
      }}>
      {children}
    </BreakoutRoomContext.Provider>
  );
};

const useBreakoutRoom = createHook(BreakoutRoomContext);

export {useBreakoutRoom, BreakoutRoomProvider};
