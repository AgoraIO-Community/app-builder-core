import React, {
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
} from 'react';
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
import {BreakoutRoomAction, initialBreakoutGroups} from '../state/reducer';
import {BreakoutRoomEventNames} from '../events/constants';
import {BreakoutRoomSyncStateEventPayload} from '../state/types';

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
  canUserSwitchRoom: boolean;
  toggleSwitchRooms: (value: boolean) => void;
  unsassignedParticipants: {uid: UidType; user: ContentInterface}[];
  createBreakoutRoomGroup: (name?: string) => void;
  moveUserIntoGroup: (user: ContentInterface, toGroupId: string) => void;
  moveUserToMainRoom: (user: ContentInterface) => void;
  makePresenter: (user: ContentInterface) => void;
  isUserInRoom: (room?: BreakoutGroup) => boolean;
  joinRoom: (roomId: string) => void;
  exitRoom: (roomId: string) => void;
  closeRoom: (roomId: string) => void;
  closeAllRooms: () => void;
  updateRoomName: (newRoomName: string, roomId: string) => void;
  upsertBreakoutRoomAPI: (type: 'START' | 'UPDATE') => void;
  closeBreakoutRoomAPI: () => void;
  checkIfBreakoutRoomSessionExistsAPI: () => Promise<boolean>;
  assignParticipants: () => void;
  sendAnnouncement: (announcement: string) => void;
  isMyHandRaised: boolean;
  raiseMyHand: () => void;
  lowerMyHand: () => void;
  raisedHands: {uid: UidType; timestamp: number}[];
  addRaisedHand: (uid: UidType) => void;
  removeRaisedHand: (uid: UidType) => void;
  clearAllRaisedHands: () => void;
  handleBreakoutRoomSyncState: (
    data: BreakoutRoomSyncStateEventPayload['data']['data'],
  ) => void;
}

const BreakoutRoomContext = React.createContext<BreakoutRoomContextValue>({
  breakoutSessionId: undefined,
  unsassignedParticipants: [],
  breakoutGroups: [],
  assignmentStrategy: RoomAssignmentStrategy.NO_ASSIGN,
  setStrategy: () => {},
  canUserSwitchRoom: false,
  toggleSwitchRooms: () => {},
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
  isMyHandRaised: false,
  raiseMyHand: () => {},
  lowerMyHand: () => {},
  raisedHands: [],
  addRaisedHand: () => {},
  removeRaisedHand: () => {},
  clearAllRaisedHands: () => {},
  handleBreakoutRoomSyncState: () => {},
});

const BreakoutRoomProvider = ({
  children,
  mainChannel,
}: {
  children: React.ReactNode;
  mainChannel: string;
}) => {
  const {store} = useContext(StorageContext);
  const {defaultContent, activeUids} = useContent();
  const localUid = useLocalUid();
  const [state, baseDispatch] = useReducer(
    breakoutRoomReducer,
    initialBreakoutRoomState,
  );
  const [lastAction, setLastAction] = useState<BreakoutRoomAction | null>(null);

  // Enhanced dispatch that tracks user actions
  const dispatch = useCallback((action: BreakoutRoomAction) => {
    baseDispatch(action);
    setLastAction(action);
  }, []);

  const {
    data: {isHost, roomId},
  } = useRoomInfo();

  const [isMyHandRaised, setMyHandRaised] = useState<boolean>(false);
  const [raisedHands, setRaisedHands] = useState<
    {uid: UidType; timestamp: number}[]
  >([]);
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
  }, [defaultContent, activeUids, localUid, dispatch]);

  const checkIfBreakoutRoomSessionExistsAPI = async (): Promise<boolean> => {
    try {
      const requestId = getUniqueID();
      const response = await fetch(
        `${$config.BACKEND_ENDPOINT}/v1/channel/breakout-room?passphrase=${
          isHost ? roomId.host : roomId.attendee
        }`,
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
          type: BreakoutGroupActionTypes.SYNC_STATE,
          payload: {
            sessionId: data.session_id,
            rooms: data?.breakout_room || [],
            switchRoom: data.switch_room || false,
          },
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking active breakout room:', error);
      return false;
    }
  };

  const upsertBreakoutRoomAPI = useCallback(
    (type: 'START' | 'UPDATE' = 'START') => {
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
          switch_room: state.canUserSwitchRoom,
          session_id: state.breakoutSessionId || randomNameGenerator(6),
          breakout_room:
            type === 'START'
              ? getSanitizedPayload(initialBreakoutGroups)
              : getSanitizedPayload(state.breakoutGroups),
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
            if (type === 'START' && data?.session_id) {
              dispatch({
                type: BreakoutGroupActionTypes.SET_SESSION_ID,
                payload: {sessionId: data.session_id},
              });
            }
            if (data?.breakout_room) {
              dispatch({
                type: BreakoutGroupActionTypes.UPDATE_GROUPS_IDS,
                payload: data.breakout_room,
              });
            }
          }
        })
        .catch(err => {
          console.log('debugging err', err);
        });
    },
    [
      roomId.host,
      state.breakoutSessionId,
      state.breakoutGroups,
      state.canUserSwitchRoom,
      store.token,
      dispatch,
    ],
  );

  const closeBreakoutRoomAPI = () => {
    console.log('supriya close breakout room API not yet implemented');
  };

  const setStrategy = (strategy: RoomAssignmentStrategy) => {
    dispatch({
      type: BreakoutGroupActionTypes.SET_ASSIGNMENT_STRATEGY,
      payload: {strategy},
    });
  };

  const toggleSwitchRooms = (value: boolean) => {
    dispatch({
      type: BreakoutGroupActionTypes.SET_ALLOW_PEOPLE_TO_SWITCH_ROOM,
      payload: {
        canUserSwitchRoom: value,
      },
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
      console.log(`supriya User ${user.name} (${user.uid}) moved to main room`);
    } catch (error) {
      console.error('supriya Error moving user to main room:', error);
    }
  };

  const makePresenter = (user: ContentInterface) => {
    try {
      events.send(
        BreakoutRoomEventNames.BREAKOUT_ROOM_MAKE_PRESENTER,
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

      console.log(
        `supriya User ${user.name} (${user.uid}) moved to ${targetGroup.name}`,
      );
    } catch (error) {
      console.error('supriya Error moving user to breakout room:', error);
    }
  };

  // To check if current user is in a specific room
  const isUserInRoom = (room?: BreakoutGroup): boolean => {
    if (room) {
      // Check specific room
      return (
        room.participants.hosts.includes(localUid) ||
        room.participants.attendees.includes(localUid)
      );
    } else {
      // Check ALL rooms - is user in any room?
      return state.breakoutGroups.some(
        group =>
          group.participants.hosts.includes(localUid) ||
          group.participants.attendees.includes(localUid),
      );
    }
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
  };

  const closeRoom = (roomIdToClose: string) => {
    dispatch({
      type: BreakoutGroupActionTypes.CLOSE_GROUP,
      payload: {
        groupId: roomIdToClose,
      },
    });
  };

  const closeAllRooms = () => {
    dispatch({
      type: BreakoutGroupActionTypes.CLOSE_ALL_GROUPS,
    });
  };

  const sendAnnouncement = (announcement: string) => {
    console.log('supriya host will send an announcement: ', announcement);
    events.send(
      BreakoutRoomEventNames.BREAKOUT_ROOM_ANNOUNCEMENT,
      JSON.stringify({
        uid: localUid,
        timestamp: Date.now(),
        announcement,
      }),
    );
  };

  const updateRoomName = (newRoomName: string, roomIdToEdit: string) => {
    console.log(
      'supriya host will send an announcement: ',
      newRoomName,
      roomId,
    );
    dispatch({
      type: BreakoutGroupActionTypes.RENAME_GROUP,
      payload: {
        newName: newRoomName,
        groupId: roomIdToEdit,
      },
    });
  };

  // User wants to raise hand
  const raiseMyHand = () => {
    events.send(
      BreakoutRoomEventNames.BREAKOUT_ROOM_ATTENDEE_RAISE_HAND,
      JSON.stringify({
        uid: localUid,
        timestamp: Date.now(),
        action: 'raise',
      }),
    );
    setMyHandRaised(true);
  };

  // User wants to lower their hand
  const lowerMyHand = () => {
    events.send(
      BreakoutRoomEventNames.BREAKOUT_ROOM_ATTENDEE_RAISE_HAND,
      JSON.stringify({
        uid: localUid,
        timestamp: Date.now(),
        action: 'lower',
      }),
    );
    setMyHandRaised(false);
  };

  // Hand raise management functions (called by event handlers)
  const addRaisedHand = useCallback((uid: UidType) => {
    setRaisedHands(prev => {
      // Check if hand is already raised to avoid duplicates
      const exists = prev.find(hand => hand.uid === uid);
      if (exists) {
        return prev;
      }

      return [...prev, {uid, timestamp: Date.now()}];
    });
  }, []);

  const removeRaisedHand = useCallback(
    (uid: UidType) => {
      setRaisedHands(prev => prev.filter(hand => hand.uid !== uid));
      // If it's the local user, update their personal state
      if (uid === localUid) {
        setMyHandRaised(false);
      }
    },
    [localUid],
  );

  const clearAllRaisedHands = useCallback(() => {
    setRaisedHands([]);
    setMyHandRaised(false);
  }, []);

  const handleBreakoutRoomSyncState = useCallback(
    (data: BreakoutRoomSyncStateEventPayload['data']['data']) => {
      dispatch({
        type: BreakoutGroupActionTypes.SYNC_STATE,
        payload: {
          sessionId: data.session_id,
          switchRoom: data.switch_room,
          rooms: data.breakout_room,
        },
      });
    },
    [dispatch],
  );

  // Action-based API triggering with debounce

  useEffect(() => {
    if (!lastAction || !lastAction.type) {
      return;
    }

    // Actions that should trigger API calls
    const API_TRIGGERING_ACTIONS = [
      BreakoutGroupActionTypes.CREATE_GROUP,
      BreakoutGroupActionTypes.RENAME_GROUP,
      BreakoutGroupActionTypes.CLOSE_GROUP,
      BreakoutGroupActionTypes.CLOSE_ALL_GROUPS,
      BreakoutGroupActionTypes.MOVE_PARTICIPANT_TO_MAIN,
      BreakoutGroupActionTypes.MOVE_PARTICIPANT_TO_GROUP,
      BreakoutGroupActionTypes.ASSIGN_PARTICPANTS,
      BreakoutGroupActionTypes.SET_ALLOW_PEOPLE_TO_SWITCH_ROOM,
    ];

    const shouldCallAPI =
      API_TRIGGERING_ACTIONS.includes(lastAction.type as any) && isHost;

    if (shouldCallAPI) {
      console.log('supriya calling update groups api');
      upsertBreakoutRoomAPI('UPDATE');
    } else {
      console.log(`Action ${lastAction.type} - skipping API call`);
    }
  }, [lastAction, upsertBreakoutRoomAPI, isHost]);

  return (
    <BreakoutRoomContext.Provider
      value={{
        breakoutSessionId: state.breakoutSessionId,
        breakoutGroups: state.breakoutGroups,
        assignmentStrategy: state.assignmentStrategy,
        setStrategy,
        assignParticipants,
        canUserSwitchRoom: state.canUserSwitchRoom,
        toggleSwitchRooms,
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
        isMyHandRaised,
        raiseMyHand,
        lowerMyHand,
        raisedHands,
        addRaisedHand,
        removeRaisedHand,
        clearAllRaisedHands,
        handleBreakoutRoomSyncState,
      }}>
      {children}
    </BreakoutRoomContext.Provider>
  );
};

const useBreakoutRoom = createHook(BreakoutRoomContext);

export {useBreakoutRoom, BreakoutRoomProvider};
