import React, {
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {ContentInterface, UidType} from '../../../../agora-rn-uikit';
import {createHook} from 'customization-implementation';
import {randomNameGenerator} from '../../../utils';
import StorageContext from '../../StorageContext';
import getUniqueID from '../../../utils/getUniqueID';
import {logger} from '../../../logger/AppBuilderLogger';
import {useRoomInfo} from 'customization-api';
import {useLocation} from '../../Router';
import {
  BreakoutGroupActionTypes,
  BreakoutGroup,
  BreakoutRoomState,
  breakoutRoomReducer,
  initialBreakoutRoomState,
  RoomAssignmentStrategy,
  ManualParticipantAssignment,
} from '../state/reducer';
import {useLocalUid} from '../../../../agora-rn-uikit';
import {useContent} from '../../../../customization-api';
import events, {PersistanceLevel} from '../../../rtm-events-api';
import {BreakoutRoomAction, initialBreakoutGroups} from '../state/reducer';
import {BreakoutRoomEventNames} from '../events/constants';
import {BreakoutRoomSyncStateEventPayload} from '../state/types';
import {IconsInterface} from '../../../atoms/CustomIcon';
import Toast from '../../../../react-native-toast-message';
import useBreakoutRoomExit from '../hooks/useBreakoutRoomExit';

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
  canSeeRaisedHands: boolean;
  // Room management (host only)
  canAssignParticipants: boolean;
  canCreateRooms: boolean;
  canMoveUsers: boolean;
  canCloseRooms: boolean;
  canMakePresenter: boolean;
}
const defaulBreakoutRoomPermission: BreakoutRoomPermissions = {
  canJoinRoom: false,
  canExitRoom: false,
  canSwitchBetweenRooms: false, // Media controls
  canScreenshare: true,
  canRaiseHands: false,
  canSeeRaisedHands: false,
  // Room management (host only)
  canAssignParticipants: false,
  canCreateRooms: false,
  canMoveUsers: false,
  canCloseRooms: false,
  canMakePresenter: false,
};
interface BreakoutRoomContextValue {
  mainChannelId: string;
  breakoutSessionId: BreakoutRoomState['breakoutSessionId'];
  breakoutGroups: BreakoutRoomState['breakoutGroups'];
  assignmentStrategy: RoomAssignmentStrategy;
  canUserSwitchRoom: boolean;
  setSwitchRoomsAllowed: (value: boolean) => void;
  unassignedParticipants: {uid: UidType; user: ContentInterface}[];
  manualAssignments: ManualParticipantAssignment[];
  setManualAssignments: (assignments: ManualParticipantAssignment[]) => void;
  clearManualAssignments: () => void;
  createBreakoutRoomGroup: (name?: string) => void;
  isUserInRoom: (room?: BreakoutGroup) => boolean;
  joinRoom: (roomId: string) => void;
  exitRoom: (roomId?: string) => Promise<void>;
  closeRoom: (roomId: string) => void;
  closeAllRooms: () => void;
  updateRoomName: (newRoomName: string, roomId: string) => void;
  getAllRooms: () => BreakoutGroup[];
  getRoomMemberDropdownOptions: (memberUid: UidType) => MemberDropdownOption[];
  upsertBreakoutRoomAPI: (type: 'START' | 'UPDATE') => Promise<void>;
  checkIfBreakoutRoomSessionExistsAPI: () => Promise<boolean>;
  handleAssignParticipants: (strategy: RoomAssignmentStrategy) => void;
  sendAnnouncement: (announcement: string) => void;
  // Presenters
  onMakeMePresenter: (action: 'start' | 'stop') => void;
  presenters: {uid: UidType; timestamp: number}[];
  clearAllPresenters: () => void;
  // Raised hands
  raisedHands: {uid: UidType; timestamp: number}[];
  sendRaiseHandEvent: (action: 'raise' | 'lower') => void;
  onRaiseHand: (action: 'raise' | 'lower', uid: UidType) => void;
  clearAllRaisedHands: () => void;
  // State sync
  handleBreakoutRoomSyncState: (
    data: BreakoutRoomSyncStateEventPayload['data']['data'],
  ) => void;
  permissions: BreakoutRoomPermissions;
}

const BreakoutRoomContext = React.createContext<BreakoutRoomContextValue>({
  mainChannelId: '',
  breakoutSessionId: undefined,
  unassignedParticipants: [],
  breakoutGroups: [],
  assignmentStrategy: RoomAssignmentStrategy.NO_ASSIGN,
  manualAssignments: [],
  setManualAssignments: () => {},
  clearManualAssignments: () => {},
  canUserSwitchRoom: false,
  setSwitchRoomsAllowed: () => {},
  handleAssignParticipants: () => {},
  createBreakoutRoomGroup: () => {},
  isUserInRoom: () => false,
  joinRoom: () => {},
  exitRoom: async () => {},
  closeRoom: () => {},
  closeAllRooms: () => {},
  updateRoomName: () => {},
  getAllRooms: () => [],
  getRoomMemberDropdownOptions: () => [],
  sendAnnouncement: () => {},
  upsertBreakoutRoomAPI: async () => {},
  checkIfBreakoutRoomSessionExistsAPI: async () => false,
  onMakeMePresenter: () => {},
  presenters: [],
  clearAllPresenters: () => {},
  raisedHands: [],
  sendRaiseHandEvent: () => {},
  onRaiseHand: () => {},
  clearAllRaisedHands: () => {},
  handleBreakoutRoomSyncState: () => {},
  // Provide a safe non-null default object
  permissions: {...defaulBreakoutRoomPermission},
});

const BreakoutRoomProvider = ({
  children,
  mainChannel,
  handleLeaveBreakout,
}: {
  children: React.ReactNode;
  mainChannel: string;
  handleLeaveBreakout: () => void;
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

  const location = useLocation();
  const isInBreakoutRoute = location.pathname.includes('breakout');

  const breakoutRoomExit = useBreakoutRoomExit(handleLeaveBreakout);

  // Join Room pending intent
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

  // Raised hands
  const [raisedHands, setRaisedHands] = useState<
    {uid: UidType; timestamp: number}[]
  >([]);

  // Polling control
  const [isPollingPaused, setIsPollingPaused] = useState(false);

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

    // // Sort participants with local user first
    // const sortedParticipants = filteredParticipants.sort((a, b) => {
    //   if (a.uid === localUid) {
    //     return -1;
    //   }
    //   if (b.uid === localUid) {
    //     return 1;
    //   }
    //   return 0;
    // });

    dispatch({
      type: BreakoutGroupActionTypes.UPDATE_UNASSIGNED_PARTICIPANTS,
      payload: {
        unassignedParticipants: filteredParticipants,
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
            assignmentStrategy:
              data?.assignment_type || RoomAssignmentStrategy.NO_ASSIGN,
            switchRoom: data?.switch_room ?? true,
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
    if (isHost && state.breakoutSessionId) {
      await checkIfBreakoutRoomSessionExistsAPI();
    }
  }, [isHost, state.breakoutSessionId]);

  // Automatic interval management with cleanup only host will poll
  useEffect(() => {
    if (
      isHost &&
      !isPollingPaused &&
      (state.breakoutSessionId || isInBreakoutRoute)
    ) {
      const interval = setInterval(pollBreakoutGetAPI, 2000);
      return () => clearInterval(interval);
    }
  }, [
    isHost,
    state.breakoutSessionId,
    isPollingPaused,
    isInBreakoutRoute,
    pollBreakoutGetAPI,
  ]);

  const upsertBreakoutRoomAPI = useCallback(
    async (type: 'START' | 'UPDATE' = 'START') => {
      type UpsertPayload = {
        passphrase: string;
        switch_room: boolean;
        session_id: string;
        assignment_type: RoomAssignmentStrategy;
        breakout_room: ReturnType<typeof getSanitizedPayload>;
        join_room_id?: string;
      };

      const startReqTs = Date.now();
      const requestId = getUniqueID();
      setIsPollingPaused(true);

      try {
        const sessionId = state.breakoutSessionId || randomNameGenerator(6);

        const payload: UpsertPayload = {
          passphrase: isHost ? roomId.host : roomId.attendee,
          switch_room: state.canUserSwitchRoom,
          session_id: sessionId,
          assignment_type: state.assignmentStrategy,
          breakout_room:
            type === 'START'
              ? getSanitizedPayload(initialBreakoutGroups)
              : getSanitizedPayload(state.breakoutGroups),
        };

        // Only add join_room_id if attendee has called this api(during join room)
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
      } catch (err) {
        console.log('debugging err', err);
      } finally {
        setIsPollingPaused(false);
        setSelfJoinRoomId(null);
      }
    },
    [
      roomId.host,
      state.breakoutSessionId,
      state.breakoutGroups,
      state.canUserSwitchRoom,
      state.assignmentStrategy,
      store.token,
      dispatch,
      selfJoinRoomId,
      isHost,
      roomId.attendee,
    ],
  );

  const setManualAssignments = useCallback(
    (assignments: ManualParticipantAssignment[]) => {
      dispatch({
        type: BreakoutGroupActionTypes.SET_MANUAL_ASSIGNMENTS,
        payload: {assignments},
      });
    },
    [dispatch],
  );

  const clearManualAssignments = useCallback(() => {
    dispatch({
      type: BreakoutGroupActionTypes.CLEAR_MANUAL_ASSIGNMENTS,
    });
  }, [dispatch]);

  const setSwitchRoomsAllowed = (value: boolean) => {
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

  const handleAssignParticipants = (strategy: RoomAssignmentStrategy) => {
    if (strategy === RoomAssignmentStrategy.AUTO_ASSIGN) {
      dispatch({
        type: BreakoutGroupActionTypes.AUTO_ASSIGN_PARTICPANTS,
      });
    }
    if (strategy === RoomAssignmentStrategy.MANUAL_ASSIGN) {
      dispatch({
        type: BreakoutGroupActionTypes.MANUAL_ASSIGN_PARTICPANTS,
      });
    }
    if (strategy === RoomAssignmentStrategy.NO_ASSIGN) {
      dispatch({
        type: BreakoutGroupActionTypes.NO_ASSIGN_PARTICIPANTS,
      });
    }
  };

  const moveUserToMainRoom = (user: ContentInterface) => {
    try {
      if (!user) {
        return;
      }
      // Find user's current breakout group
      const currentGroup = state.breakoutGroups.find(
        group =>
          group.participants.hosts.includes(user.uid) ||
          group.participants.attendees.includes(user.uid),
      );
      if (currentGroup) {
        dispatch({
          type: BreakoutGroupActionTypes.MOVE_PARTICIPANT_TO_MAIN,
          payload: {
            user,
            fromGroupId: currentGroup.id,
          },
        });
      }
      console.log(`User ${user.name} (${user.uid}) moved to main room`);
    } catch (error) {
      console.error('Error moving user to main room:', error);
    }
  };

  const moveUserIntoGroup = (user: ContentInterface, toGroupId: string) => {
    try {
      if (!user) {
        return;
      }
      // Find user's current breakout group
      const currentGroup = state.breakoutGroups.find(
        group =>
          group.participants.hosts.includes(user.uid) ||
          group.participants.attendees.includes(user.uid),
      );
      const targetGroup = state.breakoutGroups.find(
        group => group.id === toGroupId,
      );
      if (!targetGroup) {
        console.error('Target group not found:', toGroupId);
        return;
      }
      dispatch({
        type: BreakoutGroupActionTypes.MOVE_PARTICIPANT_TO_GROUP,
        payload: {
          user,
          fromGroupId: currentGroup?.id,
          toGroupId,
        },
      });
      console.log(
        `User ${user.name} (${user.uid}) moved to ${targetGroup.name}`,
      );
    } catch (error) {
      console.error('Error moving user to breakout room:', error);
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

  const getCurrentRoom = useCallback((): BreakoutGroup | null => {
    const userRoom = state.breakoutGroups.find(
      group =>
        group.participants.hosts.includes(localUid) ||
        group.participants.attendees.includes(localUid),
    );
    return userRoom ?? null;
  }, [localUid, state.breakoutGroups]);

  const joinRoom = (toRoomId: string) => {
    if (!permissions.canJoinRoom) {
      return;
    }
    const user = defaultContent[localUid];
    if (!user) {
      return;
    }
    moveUserIntoGroup(user, toRoomId);
    setSelfJoinRoomId(toRoomId);
  };

  const exitRoom = async (fromRoomId?: string) => {
    try {
      const localUser = defaultContent[localUid];
      const currentRoomId = fromRoomId ? fromRoomId : getCurrentRoom()?.id;
      if (currentRoomId && localUser) {
        // Use breakout-specific exit (doesn't destroy main RTM)
        await breakoutRoomExit();
        dispatch({
          type: BreakoutGroupActionTypes.EXIT_GROUP,
          payload: {
            user: localUser,
            fromGroupId: currentRoomId,
          },
        });
      }
    } catch (error) {
      const localUser = defaultContent[localUid];
      const currentRoom = getCurrentRoom();
      if (currentRoom && localUser) {
        dispatch({
          type: BreakoutGroupActionTypes.EXIT_GROUP,
          payload: {
            user: localUser,
            fromGroupId: currentRoom.id,
          },
        });
      }
    }
  };

  const closeRoom = (roomIdToClose: string) => {
    dispatch({
      type: BreakoutGroupActionTypes.CLOSE_GROUP,
      payload: {groupId: roomIdToClose},
    });
  };

  const closeAllRooms = () => {
    dispatch({type: BreakoutGroupActionTypes.CLOSE_ALL_GROUPS});
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
      payload: {newName: newRoomName, groupId: roomIdToEdit},
    });
  };

  const getAllRooms = () => {
    return state.breakoutGroups.length > 0 ? state.breakoutGroups : [];
  };

  const getRoomMemberDropdownOptions = (memberUid: UidType) => {
    const options: MemberDropdownOption[] = [];
    // Find which room the user is currently in

    const memberUser = defaultContent[memberUid];
    if (!memberUser) {
      return options;
    }

    const getCurrentUserRoom = (uid: UidType) => {
      return state.breakoutGroups.find(
        group =>
          group.participants.hosts.includes(uid) ||
          group.participants.attendees.includes(uid),
      );
    };
    const currentRoom = getCurrentUserRoom(memberUid);
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
        title,
        onOptionPress: () => makePresenter(memberUser, action),
      });
    }
    return options;
  };

  const isUserPresenting = useCallback(
    (uid?: UidType) => {
      if (uid !== undefined) {
        return presenters.some(presenter => presenter.uid === uid);
      }
      // fall back to current user
      return canIPresent;
    },
    [presenters, canIPresent],
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
          action,
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
      // Show toast notification when presenter permission is granted
      Toast.show({
        type: 'success',
        text1: 'You can now present in this breakout room',
        visibilityTime: 3000,
      });
    } else if (action === 'stop') {
      setICanPresent(false);
      // Show toast notification when presenter permission is removed
      Toast.show({
        type: 'info',
        text1: 'Your presenter access has been removed',
        visibilityTime: 3000,
      });
    }
  };

  const clearAllPresenters = useCallback(() => {
    setPresenters([]);
  }, []);

  // Raised hand management functions
  const addRaisedHand = useCallback(
    (uid: UidType) => {
      setRaisedHands(prev => {
        // Check if already raised to avoid duplicates
        const exists = prev.find(hand => hand.uid === uid);
        if (exists) {
          return prev;
        }
        return [...prev, {uid, timestamp: Date.now()}];
      });
      if (isHost) {
        const userName = defaultContent[uid]?.name || `User ${uid}`;
        Toast.show({
          leadingIconName: 'raise-hand',
          type: 'info',
          text1: `${userName} raised their hand`,
          visibilityTime: 3000,
          primaryBtn: null,
          secondaryBtn: null,
          leadingIcon: null,
        });
      }
    },
    [defaultContent, isHost],
  );

  const removeRaisedHand = useCallback(
    (uid: UidType) => {
      if (uid) {
        setRaisedHands(prev => prev.filter(hand => hand.uid !== uid));
      }
      if (isHost) {
        const userName = defaultContent[uid]?.name || `User ${uid}`;
        Toast.show({
          leadingIconName: 'raise-hand',
          type: 'info',
          text1: `${userName} lowered their hand`,
          visibilityTime: 3000,
          primaryBtn: null,
          secondaryBtn: null,
          leadingIcon: null,
        });
      }
    },
    [defaultContent, isHost],
  );

  const clearAllRaisedHands = useCallback(() => {
    setRaisedHands([]);
  }, []);

  // Send raise hand event via RTM
  const sendRaiseHandEvent = useCallback(
    (action: 'raise' | 'lower') => {
      const payload = {action, uid: localUid, timestamp: Date.now()};
      events.send(
        BreakoutRoomEventNames.BREAKOUT_ROOM_ATTENDEE_RAISE_HAND,
        JSON.stringify(payload),
      );
    },
    [localUid],
  );

  // Handle incoming raise hand events (only host sees notifications)
  const onRaiseHand = (action: 'raise' | 'lower', uid: UidType) => {
    try {
      if (action === 'raise') {
        addRaisedHand(uid);
        // Show toast notification only to host
      } else if (action === 'lower') {
        removeRaisedHand(uid);
        // Show toast notification only to host
      }
    } catch (error) {
      console.error('Error handling raise hand event:', error);
    }
  };

  // Permissions
  const permissions = useMemo<BreakoutRoomPermissions>(() => {
    if (!$config.ENABLE_BREAKOUT_ROOM) {
      return {
        canJoinRoom: false,
        canExitRoom: false,
        canSwitchBetweenRooms: false,
        canScreenshare: true,
        canRaiseHands: false,
        canSeeRaisedHands: false,
        canAssignParticipants: false,
        canCreateRooms: false,
        canMoveUsers: false,
        canCloseRooms: false,
        canMakePresenter: false,
      };
    }

    const currentlyInRoom = isUserInRoom();
    const hasAvailableRooms = state.breakoutGroups.length > 0;
    const allowAttendeeSwitch = state.canUserSwitchRoom;

    return {
      // Room navigation
      canJoinRoom:
        !currentlyInRoom &&
        hasAvailableRooms &&
        (isHost || allowAttendeeSwitch),
      canExitRoom: currentlyInRoom,
      canSwitchBetweenRooms:
        currentlyInRoom && hasAvailableRooms && (isHost || allowAttendeeSwitch),
      // Media controls
      canScreenshare: currentlyInRoom ? canIPresent : isHost,
      canRaiseHands: !isHost && !!state.breakoutSessionId,
      canSeeRaisedHands: isHost,
      // Room management (host only)
      canAssignParticipants: isHost,
      canCreateRooms: isHost,
      canMoveUsers: isHost,
      canCloseRooms: isHost && hasAvailableRooms && !!state.breakoutSessionId,
      canMakePresenter: isHost,
    };
  }, [
    isUserInRoom,
    isHost,
    state.breakoutGroups.length,
    state.breakoutSessionId,
    state.canUserSwitchRoom,
    canIPresent,
  ]);

  const handleBreakoutRoomSyncState = useCallback(
    (data: BreakoutRoomSyncStateEventPayload['data']['data']) => {
      const {session_id, switch_room, breakout_room, assignment_type} = data;
      // Store previous state to compare changes
      const prevGroups = state.breakoutGroups;
      const prevSwitchRoom = state.canUserSwitchRoom;
      const userCurrentRoom = getCurrentRoom();
      const userCurrentRoomId = userCurrentRoom?.id || null;

      dispatch({
        type: BreakoutGroupActionTypes.SYNC_STATE,
        payload: {
          sessionId: session_id,
          assignmentStrategy: assignment_type,
          switchRoom: switch_room,
          rooms: breakout_room,
        },
      });

      // Show notifications based on changes
      // 1. Switch room enabled notification
      if (switch_room && !prevSwitchRoom) {
        Toast.show({
          leadingIconName: 'info',
          type: 'info',
          text1: 'Breakout rooms are now open. Please choose a room to join.',
          visibilityTime: 4000,
        });
        return; // Don't show other notifications when rooms first open
      }

      // 2. User joined a room (compare previous and current state)
      if (userCurrentRoomId) {
        const wasInRoom = prevGroups.some(
          group =>
            group.participants.hosts.includes(localUid) ||
            group.participants.attendees.includes(localUid),
        );

        if (!wasInRoom) {
          const currentRoom = breakout_room.find(
            room => room.id === userCurrentRoomId,
          );
          Toast.show({
            type: 'success',
            text1: `You've joined ${currentRoom?.name || 'a breakout room'}.`,
            visibilityTime: 3000,
          });
          return;
        }
      }

      // 3. User was moved to a different room by host
      if (userCurrentRoom) {
        const prevUserRoom = prevGroups.find(
          group =>
            group.participants.hosts.includes(localUid) ||
            group.participants.attendees.includes(localUid),
        );

        if (prevUserRoom && prevUserRoom.id !== userCurrentRoomId) {
          Toast.show({
            type: 'info',
            text1: `You've been moved to ${userCurrentRoom.name} by the host.`,
            visibilityTime: 4000,
          });
          return;
        }
      }

      // 4. User was moved to main room
      if (!userCurrentRoom) {
        const wasInRoom = prevGroups.some(
          group =>
            group.participants.hosts.includes(localUid) ||
            group.participants.attendees.includes(localUid),
        );

        if (wasInRoom) {
          Toast.show({
            leadingIconName: 'arrow-up',
            type: 'info',
            text1: "You've returned to the main room.",
            visibilityTime: 3000,
          });
          // Exit breakout room and return to main room
          exitRoom();
          return;
        }
      }

      // 5. All breakout rooms closed
      if (breakout_room.length === 0 && prevGroups.length > 0) {
        Toast.show({
          leadingIconName: 'close',
          type: 'warning',
          text1: 'Breakout rooms are now closed. Returning to the main room...',
          visibilityTime: 4000,
        });
        // Exit breakout room and return to main room
        exitRoom();
        return;
      }

      // 6. Specific room was closed (user was in it)
      if (userCurrentRoomId) {
        const roomStillExists = breakout_room.some(
          room => room.id === userCurrentRoomId,
        );
        if (!roomStillExists) {
          const closedRoom = prevGroups.find(
            room => room.id === userCurrentRoomId,
          );
          Toast.show({
            leadingIconName: 'alert',
            type: 'error',
            text1: `${
              closedRoom?.name || 'Your room'
            } is currently closed. Returning to main room. Please contact the host.`,
            visibilityTime: 5000,
          });
          // Exit breakout room and return to main room
          exitRoom();
          return;
        }
      }

      // 7. Room name changed
      prevGroups.forEach(prevRoom => {
        const currentRoom = breakout_room.find(room => room.id === prevRoom.id);
        if (currentRoom && currentRoom.name !== prevRoom.name) {
          Toast.show({
            type: 'info',
            text1: `${prevRoom.name} has been renamed to '${currentRoom.name}'.`,
            visibilityTime: 3000,
          });
        }
      });
    },
    [
      dispatch,
      getCurrentRoom,
      localUid,
      state.breakoutGroups,
      state.canUserSwitchRoom,
    ],
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
      BreakoutGroupActionTypes.AUTO_ASSIGN_PARTICPANTS,
      BreakoutGroupActionTypes.MANUAL_ASSIGN_PARTICPANTS,
      BreakoutGroupActionTypes.NO_ASSIGN_PARTICIPANTS,
      BreakoutGroupActionTypes.SET_ALLOW_PEOPLE_TO_SWITCH_ROOM,
      BreakoutGroupActionTypes.EXIT_GROUP,
    ];

    // Host can always trigger API calls for any action
    // Attendees can only trigger API when they self-join a room and switch_room is enabled
    const attendeeSelfJoinAllowed =
      state.canUserSwitchRoom &&
      lastAction.type === BreakoutGroupActionTypes.MOVE_PARTICIPANT_TO_GROUP;

    const shouldCallAPI =
      API_TRIGGERING_ACTIONS.includes(lastAction.type as any) &&
      (isHost || (!isHost && attendeeSelfJoinAllowed));

    if (shouldCallAPI) {
      upsertBreakoutRoomAPI('UPDATE').finally(() => {});
    }
  }, [lastAction, upsertBreakoutRoomAPI, isHost, state.canUserSwitchRoom]);

  return (
    <BreakoutRoomContext.Provider
      value={{
        mainChannelId: mainChannel,
        breakoutSessionId: state.breakoutSessionId,
        breakoutGroups: state.breakoutGroups,
        assignmentStrategy: state.assignmentStrategy,
        handleAssignParticipants,
        manualAssignments: state.manualAssignments,
        setManualAssignments,
        clearManualAssignments,
        canUserSwitchRoom: state.canUserSwitchRoom,
        setSwitchRoomsAllowed,
        unassignedParticipants: state.unassignedParticipants,
        createBreakoutRoomGroup,
        checkIfBreakoutRoomSessionExistsAPI,
        upsertBreakoutRoomAPI,
        isUserInRoom,
        joinRoom,
        exitRoom,
        closeRoom,
        closeAllRooms,
        sendAnnouncement,
        updateRoomName,
        getAllRooms,
        getRoomMemberDropdownOptions,
        onMakeMePresenter,
        presenters,
        clearAllPresenters,
        raisedHands,
        sendRaiseHandEvent,
        onRaiseHand,
        clearAllRaisedHands,
        handleBreakoutRoomSyncState,
        permissions,
      }}>
      {children}
    </BreakoutRoomContext.Provider>
  );
};

const useBreakoutRoom = createHook(BreakoutRoomContext);

export {useBreakoutRoom, BreakoutRoomProvider};
