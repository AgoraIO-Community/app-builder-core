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
import events, {PersistanceLevel} from '../../../rtm-events-api';
import {EventNames} from '../../../rtm-events';

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
  moveUserIntoGroup: (user: ContentInterface, toGroupId: string) => void;
  moveUserToMainRoom: (user: ContentInterface) => void;
  makePresenter: (user: ContentInterface) => void;
  isUserInRoom: (room: BreakoutGroup) => boolean;
  joinRoom: (roomId: string) => void;
  exitRoom: (roomId: string) => void;
  closeRoom: (roomId: string) => void;
  closeAllRooms: () => void;
  updateRoomName: (newRoomName: string, roomId: string) => void;
  upsertBreakoutRoomAPI: () => void;
  closeBreakoutRoomAPI: () => void;
  checkIfBreakoutRoomSessionExistsAPI: () => Promise<boolean>;
  assignParticipants: () => void;
  sendAnnouncement: (announcement: string) => void;
}

const BreakoutRoomContext = React.createContext<BreakoutRoomContextValue>({
  breakoutSessionId: undefined,
  unsassignedParticipants: [],
  breakoutGroups: [],
  assignmentStrategy: RoomAssignmentStrategy.NO_ASSIGN,
  setStrategy: () => {},
  assignParticipants: () => {},
  createBreakoutRoomGroup: () => {},
  moveUserIntoGroup: () => {},
  moveUserToMainRoom: () => {},
  makePresenter: () => {},
  isUserInRoom: () => false,
  joinRoom: () => {},
  exitRoom: () => {},
  closeRoom: () => {},
  closeAllRooms: () => {},
  updateRoomName: () => {},
  sendAnnouncement: () => {},
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
    console.log('supriya breakout state changed');
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
    console.log('supriya-group-change', state.breakoutGroups);
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

  const assignParticipants = () => {
    dispatch({
      type: BreakoutGroupActionTypes.ASSIGN_PARTICPANTS,
    });
  };

  const moveUserToMainRoom = (user: ContentInterface) => {
    console.log('supriya moving user to main room', user);
    try {
      // Find user's current breakout group
      const currentGroup = state.breakoutGroups.find(
        group =>
          group.participants.hosts.includes(user.uid) ||
          group.participants.attendees.includes(user.uid),
      );
      // Dispatch action to remove user from breakout group
      if (currentGroup) {
        dispatch({
          type: BreakoutGroupActionTypes.MOVE_PARTICIPANT_TO_MAIN,
          payload: {
            user: user,
            fromGroupId: currentGroup.id,
          },
        });
      }
      // Call upsertBreakoutRoomAPI to sync changes and trigger events
      upsertBreakoutRoomAPI('UPDATE');
      console.log(`supriya User ${user.name} (${user.uid}) moved to main room`);
    } catch (error) {
      console.error('supriya Error moving user to main room:', error);
    }
  };

  const makePresenter = (user: ContentInterface) => {
    try {
      events.send(
        EventNames.BREAKOUT_ROOM_MAKE_PRESENTER,
        '',
        PersistanceLevel.None,
        user.uid,
      );
    } catch (error) {
      console.log(
        'supriya error occured while sending presenter event error: ',
        error,
      );
    }
  };

  const moveUserIntoGroup = (user: ContentInterface, toGroupId: string) => {
    console.log('supriya move user to another room', user, toGroupId);
    try {
      // Find user's current breakout group
      const currentGroup = state.breakoutGroups.find(
        group =>
          group.participants.hosts.includes(user.uid) ||
          group.participants.attendees.includes(user.uid),
      );
      // Find target group
      const targetGroup = state.breakoutGroups.find(
        group => group.id === toGroupId,
      );
      if (!targetGroup) {
        console.error('Target group not found:', toGroupId);
        return;
      }
      // Dispatch action to move user between groups
      dispatch({
        type: BreakoutGroupActionTypes.MOVE_PARTICIPANT_TO_GROUP,
        payload: {
          user: user,
          fromGroupId: currentGroup?.id,
          toGroupId,
        },
      });

      // Call upsertBreakoutRoomAPI to sync changes and trigger events
      upsertBreakoutRoomAPI('UPDATE');

      console.log(
        `supriya User ${user.name} (${user.uid}) moved to ${targetGroup.name}`,
      );
    } catch (error) {
      console.error('supriya Error moving user to breakout room:', error);
    }
  };

  // To check if current user is in a specific room
  const isUserInRoom = (room: BreakoutGroup): boolean => {
    return (
      room.participants.hosts.includes(localUid) ||
      room.participants.attendees.includes(localUid)
    );
  };

  const joinRoom = (toRoomId: string) => {
    const localUser = defaultContent[localUid];
    moveUserIntoGroup(localUser, toRoomId);
  };

  const exitRoom = (fromRoomId: string) => {
    const localUser = defaultContent[localUid];
    dispatch({
      type: BreakoutGroupActionTypes.MOVE_PARTICIPANT_TO_GROUP,
      payload: {
        user: localUser,
        fromGroupId: fromRoomId,
        toGroupId: null,
      },
    });
    upsertBreakoutRoomAPI('UPDATE');
  };

  const closeRoom = (roomIdToClose: string) => {
    dispatch({
      type: BreakoutGroupActionTypes.CLOSE_GROUP,
      payload: {
        groupId: roomIdToClose,
      },
    });
    upsertBreakoutRoomAPI('UPDATE');
  };

  const closeAllRooms = () => {
    dispatch({
      type: BreakoutGroupActionTypes.CLOSE_ALL_GROUPS,
    });
    upsertBreakoutRoomAPI('UPDATE');
  };

  const sendAnnouncement = (announcement: string) => {
    console.log('supriya host will send an announcement: ', announcement);
    // events.send(
    //   EventNames.BREAKOUT_ROOM_ANNOUNCEMENT,
    //   announcement,
    //   PersistanceLevel.None,
    //   -1,
    // );
  };

  const updateRoomName = (newRoomName: string, roomId: string) => {
    console.log(
      'supriya host will send an announcement: ',
      newRoomName,
      roomId,
    );
    dispatch({
      type: BreakoutGroupActionTypes.RENAME_GROUP,
      payload: {
        newName: newRoomName,
        groupId: roomId,
      },
    });
    upsertBreakoutRoomAPI('UPDATE');
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
        moveUserIntoGroup,
        moveUserToMainRoom,
        isUserInRoom,
        joinRoom,
        exitRoom,
        closeRoom,
        closeAllRooms,
        sendAnnouncement,
        makePresenter,
        updateRoomName,
      }}>
      {children}
    </BreakoutRoomContext.Provider>
  );
};

const useBreakoutRoom = createHook(BreakoutRoomContext);

export {useBreakoutRoom, BreakoutRoomProvider};
