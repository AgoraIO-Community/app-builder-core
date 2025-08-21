import React, {
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
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
import {IconsInterface} from '../../../atoms/CustomIcon';
import useEndCall from '../../../utils/useEndCall';

const getSanitizedPayload = (payload: BreakoutGroup[]) => {
  return payload.map(({id, ...rest}) => {
    if (typeof id === 'string' && id.startsWith('temp')) {
      return rest;
    }
    return id !== undefined ? {...rest, id} : rest;
  });
};

export interface MemberDropdownOption {
  type: 'move-to-main' | 'move-to-room' | 'make-presenter';
  icon: keyof IconsInterface;
  title: string;
  roomId?: string;
  roomName?: string;
  onOptionPress: () => void;
}

interface BreakoutRoomPermissions {
  // Room navigation
  canJoinRoom: boolean;
  canExitRoom: boolean;
  canSwitchBetweenRooms: boolean;
  // Media controls
  canScreenshare: boolean;
  canRaiseHands: boolean;
  // Room management (host only)
  canAssignParticipants: boolean;
  canCreateRooms: boolean;
  canMoveUsers: boolean;
  canCloseRooms: boolean;
  canMakePresenter: boolean;
}
interface BreakoutRoomContextValue {
  mainChannelId: string;
  breakoutSessionId: BreakoutRoomState['breakoutSessionId'];
  breakoutGroups: BreakoutRoomState['breakoutGroups'];
  assignmentStrategy: RoomAssignmentStrategy;
  setStrategy: (strategy: RoomAssignmentStrategy) => void;
  canUserSwitchRoom: boolean;
  toggleSwitchRooms: (value: boolean) => void;
  unsassignedParticipants: {uid: UidType; user: ContentInterface}[];
  createBreakoutRoomGroup: (name?: string) => void;
  isUserInRoom: (room?: BreakoutGroup) => boolean;
  joinRoom: (roomId: string) => void;
  exitRoom: (roomId?: string) => void;
  closeRoom: (roomId: string) => void;
  closeAllRooms: () => void;
  updateRoomName: (newRoomName: string, roomId: string) => void;
  getRoomMemberDropdownOptions: (memberUid: UidType) => MemberDropdownOption[];
  upsertBreakoutRoomAPI: (type: 'START' | 'UPDATE') => Promise<void>;
  closeBreakoutRoomAPI: () => void;
  checkIfBreakoutRoomSessionExistsAPI: () => Promise<boolean>;
  assignParticipants: () => void;
  sendAnnouncement: (announcement: string) => void;
  // Presenters
  onMakeMePresenter: (action: 'start' | 'stop') => void;
  presenters: {uid: UidType; timestamp: number}[];
  clearAllPresenters: () => void;
  // State sync
  handleBreakoutRoomSyncState: (
    data: BreakoutRoomSyncStateEventPayload['data']['data'],
  ) => void;
  permissions: BreakoutRoomPermissions;
}

const BreakoutRoomContext = React.createContext<BreakoutRoomContextValue>({
  mainChannelId: '',
  breakoutSessionId: undefined,
  unsassignedParticipants: [],
  breakoutGroups: [],
  assignmentStrategy: RoomAssignmentStrategy.NO_ASSIGN,
  setStrategy: () => {},
  canUserSwitchRoom: false,
  toggleSwitchRooms: () => {},
  assignParticipants: () => {},
  createBreakoutRoomGroup: () => {},
  isUserInRoom: () => false,
  joinRoom: () => {},
  exitRoom: () => {},
  closeRoom: () => {},
  closeAllRooms: () => {},
  updateRoomName: () => {},
  getRoomMemberDropdownOptions: () => [],
  sendAnnouncement: () => {},
  upsertBreakoutRoomAPI: async () => {},
  closeBreakoutRoomAPI: () => {},
  checkIfBreakoutRoomSessionExistsAPI: async () => false,
  onMakeMePresenter: () => {},
  presenters: [],
  clearAllPresenters: () => {},
  handleBreakoutRoomSyncState: () => {},
  permissions: null,
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
  const {
    data: {isHost, roomId},
  } = useRoomInfo();
  const executeEndCall = useEndCall();

  // Sync state
  const lastSyncTimeRef = useRef(Date.now());

  // Join Room
  const [selfJoinRoomId, setSelfJoinRoomId] = useState<string | null>(null);

  // Enhanced dispatch that tracks user actions
  const [lastAction, setLastAction] = useState<BreakoutRoomAction | null>(null);
  const dispatch = useCallback((action: BreakoutRoomAction) => {
    baseDispatch(action);
    setLastAction(action);
  }, []);

  // Presenter
  const [canIPresent, setICanPresent] = useState<boolean>(false);
  const [presenters, setPresenters] = useState<
    {uid: UidType; timestamp: number}[]
  >([]);

  // Fetch the data when the context loads for attendee. Dont wait till they open panel
  useEffect(() => {
    if (!isHost) {
      return;
    }
    const loadData = async () => {
      try {
        await checkIfBreakoutRoomSessionExistsAPI();
      } catch (error) {
        console.error('Failed to load breakout session:', error);
      }
    };
    loadData();
  }, [isHost]);

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

  // Polling for sync event
  const pollBreakoutGetAPI = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastAPICall = now - lastSyncTimeRef.current;

    // If no UPDATE API call in last 30 seconds and we have an active session
    if (timeSinceLastAPICall > 30000 && isHost && state.breakoutSessionId) {
      console.log(
        'Fallback: Calling breakout session to sync events due to no recent updates',
      );
      await checkIfBreakoutRoomSessionExistsAPI();
      lastSyncTimeRef.current = Date.now();
    }
  }, [isHost, state.breakoutSessionId]);

  // Automatic interval management with cleanup
  // useEffect(() => {
  //   if (isHost && state.breakoutSessionId) {
  //     // Check every 15 seconds
  //     const interval = setInterval(pollBreakoutGetAPI, 15000);
  //     // React will automatically call this cleanup function
  //     return () => clearInterval(interval);
  //   }
  // }, [isHost, state.breakoutSessionId, pollBreakoutGetAPI]);

  const upsertBreakoutRoomAPI = useCallback(
    async (type: 'START' | 'UPDATE' = 'START') => {
      const startReqTs = Date.now();
      const requestId = getUniqueID();
      try {
        const payload = {
          passphrase: roomId.host,
          switch_room: state.canUserSwitchRoom,
          session_id: state.breakoutSessionId || randomNameGenerator(6),
          breakout_room:
            type === 'START'
              ? getSanitizedPayload(initialBreakoutGroups)
              : getSanitizedPayload(state.breakoutGroups),
        };

        // Only add join_room_id if there's a pending join
        if (selfJoinRoomId) {
          payload.join_room_id = selfJoinRoomId;
        }

        const response = await fetch(
          `${$config.BACKEND_ENDPOINT}/v1/channel/breakout-room`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              authorization: store.token ? `Bearer ${store.token}` : '',
              'X-Request-Id': requestId,
              'X-Session-Id': logger.getSessionId(),
            },
            body: JSON.stringify(payload),
          },
        );
        const endRequestTs = Date.now();
        const latency = endRequestTs - startReqTs;
        if (!response.ok) {
          const msg = await response.text();
          throw new Error(`Breakout room creation failed: ${msg}`);
        } else {
          const data = await response.json();

          if (selfJoinRoomId) {
            setSelfJoinRoomId(null);
          }
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
          if (type === 'UPDATE') {
            lastSyncTimeRef.current = Date.now();
          }
        }
      } catch (err) {
        console.log('debugging err', err);
      }
    },
    [
      roomId.host,
      state.breakoutSessionId,
      state.breakoutGroups,
      state.canUserSwitchRoom,
      store.token,
      dispatch,
      selfJoinRoomId,
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
  const isUserInRoom = useCallback(
    (room?: BreakoutGroup): boolean => {
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
    },
    [localUid, state.breakoutGroups],
  );

  // New function to get current room ID
  const getCurrentRoomId = useCallback((): string | null => {
    const userRoom = state.breakoutGroups.find(
      group =>
        group.participants.hosts.includes(localUid) ||
        group.participants.attendees.includes(localUid),
    );
    return userRoom ? userRoom.id : null;
  }, [localUid, state.breakoutGroups]);

  const joinRoom = (toRoomId: string) => {
    const user = defaultContent[localUid];
    moveUserIntoGroup(user, toRoomId);
    setSelfJoinRoomId(toRoomId);
  };

  const exitRoom = (fromRoomId?: string) => {
    const currentRoomId = fromRoomId ? fromRoomId : getCurrentRoomId();
    const localUser = defaultContent[localUid];
    dispatch({
      type: BreakoutGroupActionTypes.EXIT_GROUP,
      payload: {
        user: localUser,
        fromGroupId: currentRoomId,
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
    dispatch({
      type: BreakoutGroupActionTypes.RENAME_GROUP,
      payload: {
        newName: newRoomName,
        groupId: roomIdToEdit,
      },
    });
  };

  const getRoomMemberDropdownOptions = (memberUid: UidType) => {
    const options: MemberDropdownOption[] = [];
    // Find which room the user is currently in
    const getCurrentUserRoom = (uid: UidType) => {
      return state.breakoutGroups.find(
        group =>
          group.participants.hosts.includes(uid) ||
          group.participants.attendees.includes(uid),
      );
    };
    const currentRoom = getCurrentUserRoom(memberUid);
    const memberUser = defaultContent[memberUid];
    // Move to Main Room option
    options.push({
      icon: 'double-up-arrow',
      type: 'move-to-main',
      title: 'Move to Main Room',
      onOptionPress: () => moveUserToMainRoom(memberUser),
    });

    // Move to other breakout rooms (exclude current room)
    state.breakoutGroups
      .filter(group => group.id !== currentRoom?.id)
      .forEach(group => {
        options.push({
          type: 'move-to-room',
          icon: 'move-up',
          title: `Shift to ${group.name}`,
          roomId: group.id,
          roomName: group.name,
          onOptionPress: () => moveUserIntoGroup(memberUser, group.id),
        });
      });

    // Make presenter option (only for hosts)
    if (isHost) {
      const userIsPresenting = isUserPresenting(memberUid);
      const title = userIsPresenting ? 'Stop presenter' : 'Make a Presenter';
      const action = userIsPresenting ? 'stop' : 'start';
      options.push({
        type: 'make-presenter',
        icon: 'promote-filled',
        title: title,
        onOptionPress: () => makePresenter(memberUser, action),
      });
    }
    return options;
  };

  const isUserPresenting = useCallback(
    (uid?: UidType) => {
      if (uid) {
        // Check specific user
        return presenters.some(presenter => presenter.uid === uid);
      } else {
        // Check current user (same as canIPresent)
        return false;
      }
    },
    [presenters],
  );

  // User wants to start presenting
  const makePresenter = (user: ContentInterface, action: 'start' | 'stop') => {
    try {
      // Host can make someone a presenter
      events.send(
        BreakoutRoomEventNames.BREAKOUT_ROOM_MAKE_PRESENTER,
        JSON.stringify({
          uid: user.uid,
          timestamp: Date.now(),
          action: action,
        }),
        PersistanceLevel.None,
        user.uid,
      );
      if (action === 'start') {
        addPresenter(user.uid);
      } else if (action === 'stop') {
        removePresenter(user.uid);
      }
    } catch (error) {
      console.log('Error making user presenter:', error);
    }
  };

  // Presenter management functions (called by event handlers)
  const addPresenter = useCallback((uid: UidType) => {
    setPresenters(prev => {
      // Check if already presenting to avoid duplicates
      const exists = prev.find(presenter => presenter.uid === uid);
      if (exists) {
        return prev;
      }
      return [...prev, {uid, timestamp: Date.now()}];
    });
  }, []);

  const removePresenter = useCallback((uid: UidType) => {
    if (uid) {
      setPresenters(prev => prev.filter(presenter => presenter.uid !== uid));
    }
  }, []);

  const onMakeMePresenter = (action: 'start' | 'stop') => {
    if (action === 'start') {
      setICanPresent(true);
    } else if (action === 'stop') {
      setICanPresent(false);
    }
  };

  const clearAllPresenters = useCallback(() => {
    setPresenters([]);
  }, []);

  // Calculate permissions dynamically
  const permissions = useMemo((): BreakoutRoomPermissions => {
    const currentlyInRoom = isUserInRoom();
    const hasAvailableRooms = state.breakoutGroups.length > 0;
    const canUserSwitchRoom = state.canUserSwitchRoom;

    if (true) {
      return {
        // Room navigation
        canJoinRoom:
          !currentlyInRoom &&
          hasAvailableRooms &&
          (isHost || canUserSwitchRoom),
        canExitRoom: currentlyInRoom,
        canSwitchBetweenRooms:
          currentlyInRoom && hasAvailableRooms && (isHost || canUserSwitchRoom),
        // Media controls
        canScreenshare: currentlyInRoom ? canIPresent : isHost,
        canRaiseHands: $config.RAISE_HAND && !isHost,
        // Room management (host only)
        canAssignParticipants: isHost,
        canCreateRooms: isHost,
        canMoveUsers: isHost,
        canCloseRooms: isHost && hasAvailableRooms && !!state.breakoutSessionId,
        canMakePresenter: isHost,
      };
    }
    return {
      canJoinRoom: false,
      canExitRoom: false,
      canSwitchBetweenRooms: false, // Media controls
      canScreenshare: true,
      canRaiseHands: false,
      // Room management (host only)
      canAssignParticipants: false,
      canCreateRooms: false,
      canMoveUsers: false,
      canCloseRooms: false,
      canMakePresenter: false,
    };
  }, [
    isUserInRoom,
    isHost,
    state.canUserSwitchRoom,
    state.breakoutGroups,
    state.breakoutSessionId,
    canIPresent,
  ]);

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

  // Action-based API triggering
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
      BreakoutGroupActionTypes.EXIT_GROUP,
    ];

    const shouldCallAPI =
      API_TRIGGERING_ACTIONS.includes(lastAction.type as any) && isHost;

    if (shouldCallAPI) {
      upsertBreakoutRoomAPI('UPDATE').finally(() => {
        if (lastAction.type === BreakoutGroupActionTypes.EXIT_GROUP) {
          console.log('User exited room, executing end call');
          try {
            executeEndCall();
          } catch (error) {
            console.log('Error while leaving the room: ', error);
          }
        }
      });
    } else {
      console.log(`Action ${lastAction.type} - skipping API call`);
    }
  }, [lastAction, upsertBreakoutRoomAPI, isHost]);

  return (
    <BreakoutRoomContext.Provider
      value={{
        mainChannelId: mainChannel,
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
        isUserInRoom,
        joinRoom,
        exitRoom,
        closeRoom,
        closeAllRooms,
        sendAnnouncement,
        updateRoomName,
        getRoomMemberDropdownOptions,
        onMakeMePresenter,
        presenters,
        clearAllPresenters,
        handleBreakoutRoomSyncState,
        permissions,
      }}>
      {children}
    </BreakoutRoomContext.Provider>
  );
};

const useBreakoutRoom = createHook(BreakoutRoomContext);

export {useBreakoutRoom, BreakoutRoomProvider};
