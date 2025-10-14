import React, {
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import {UidType} from '../../../../agora-rn-uikit';
import {createHook} from 'customization-implementation';
import {randomNameGenerator} from '../../../utils';
import StorageContext from '../../StorageContext';
import getUniqueID from '../../../utils/getUniqueID';
import {logger, LogSource} from '../../../logger/AppBuilderLogger';
import {useRoomInfo} from 'customization-api';
import {
  BreakoutGroupActionTypes,
  BreakoutGroup,
  BreakoutRoomState,
  breakoutRoomReducer,
  initialBreakoutRoomState,
  RoomAssignmentStrategy,
  ManualParticipantAssignment,
  BreakoutRoomUser,
} from '../state/reducer';
import {useLocalUid} from '../../../../agora-rn-uikit';
import {useContent} from '../../../../customization-api';
import events from '../../../rtm-events-api';
import {BreakoutRoomAction, initialBreakoutGroups} from '../state/reducer';
import {BreakoutRoomEventNames} from '../events/constants';
import {BreakoutRoomSyncStateEventPayload} from '../state/types';
import {IconsInterface} from '../../../atoms/CustomIcon';
import Toast from '../../../../react-native-toast-message';
import useBreakoutRoomExit from '../hooks/useBreakoutRoomExit';
import {useDebouncedCallback} from '../../../utils/useDebouncedCallback';
import {useLocation} from '../../../components/Router';
import {useMainRoomUserDisplayName} from '../../../rtm/hooks/useMainRoomUserDisplayName';
import {
  RTMUserData,
  useRTMGlobalState,
} from '../../../rtm/RTMGlobalStateProvider';

const HOST_BROADCASTED_OPERATIONS = [
  BreakoutGroupActionTypes.SET_ALLOW_PEOPLE_TO_SWITCH_ROOM,
  BreakoutGroupActionTypes.CREATE_GROUP,
  BreakoutGroupActionTypes.AUTO_ASSIGN_PARTICPANTS,
  BreakoutGroupActionTypes.MANUAL_ASSIGN_PARTICPANTS,
  BreakoutGroupActionTypes.NO_ASSIGN_PARTICIPANTS,
  BreakoutGroupActionTypes.MOVE_PARTICIPANT_TO_MAIN,
  BreakoutGroupActionTypes.MOVE_PARTICIPANT_TO_GROUP,
  BreakoutGroupActionTypes.CLOSE_GROUP,
  BreakoutGroupActionTypes.CLOSE_ALL_GROUPS,
  BreakoutGroupActionTypes.RENAME_GROUP,
] as const;

const getSanitizedPayload = (
  payload: BreakoutGroup[],
  defaultContentRef: any,
  mainRoomRTMUsers: {[uid: number]: RTMUserData},
) => {
  return payload.map(({id, ...rest}) => {
    const group = id !== undefined ? {...rest, id} : rest;

    // Filter out offline users from participants
    const filteredGroup = {
      ...group,
      participants: {
        hosts: group.participants.hosts.filter(uid => {
          let user = mainRoomRTMUsers[uid];
          if (defaultContentRef[uid]) {
            user = defaultContentRef[uid];
          }
          if (user) {
            return !user.offline && user.type === 'rtc';
          }
        }),
        attendees: group.participants.attendees.filter(uid => {
          let user = mainRoomRTMUsers[uid];
          if (defaultContentRef[uid]) {
            user = defaultContentRef[uid];
          }
          if (user) {
            return !user.offline && user.type === 'rtc';
          }
        }),
      },
    };

    // Remove temp IDs for API payload
    if (typeof id === 'string' && id.startsWith('temp')) {
      const {id: _, ...withoutId} = filteredGroup;
      return withoutId;
    }
    return filteredGroup;
  });
};

// const validateRollbackState = (state: BreakoutRoomState): boolean => {
//   return (
//     Array.isArray(state.breakoutGroups) &&
//     typeof state.breakoutSessionId === 'string' &&
//     typeof state.canUserSwitchRoom === 'boolean' &&
//     state.breakoutGroups.every(
//       group =>
//         typeof group.id === 'string' &&
//         typeof group.name === 'string' &&
//         Array.isArray(group.participants?.hosts) &&
//         Array.isArray(group.participants?.attendees),
//     )
//   );
// };

export const deepCloneBreakoutGroups = (
  groups: BreakoutGroup[] = [],
): BreakoutGroup[] =>
  groups.map(group => ({
    ...group,
    participants: {
      hosts: [...(group.participants?.hosts ?? [])],
      attendees: [...(group.participants?.attendees ?? [])],
    },
  }));

const needsDeepCloning = (action: BreakoutRoomAction): boolean => {
  const CLONING_REQUIRED_ACTIONS = [
    BreakoutGroupActionTypes.MOVE_PARTICIPANT_TO_GROUP,
    BreakoutGroupActionTypes.MOVE_PARTICIPANT_TO_MAIN,
    BreakoutGroupActionTypes.EXIT_GROUP,
    BreakoutGroupActionTypes.AUTO_ASSIGN_PARTICPANTS,
    BreakoutGroupActionTypes.MANUAL_ASSIGN_PARTICPANTS,
    BreakoutGroupActionTypes.CLOSE_GROUP,
    BreakoutGroupActionTypes.CLOSE_ALL_GROUPS,
    BreakoutGroupActionTypes.NO_ASSIGN_PARTICIPANTS,
    BreakoutGroupActionTypes.SYNC_STATE,
  ];

  return CLONING_REQUIRED_ACTIONS.includes(action.type as any);
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
  canHostManageMainRoom: boolean;
  canAssignParticipants: boolean;
  canCreateRooms: boolean;
  canMoveUsers: boolean;
  canCloseRooms: boolean;
  canMakePresenter: boolean;
}
const defaulBreakoutRoomPermission: BreakoutRoomPermissions = {
  canJoinRoom: false,
  canExitRoom: false,
  canSwitchBetweenRooms: false,
  canScreenshare: true,
  canRaiseHands: false,
  canHostManageMainRoom: false,
  canAssignParticipants: false,
  canCreateRooms: false,
  canMoveUsers: false,
  canCloseRooms: false,
  canMakePresenter: false,
};

interface BreakoutRoomContextValue {
  mainChannelId: string;
  isBreakoutUILocked: boolean;
  breakoutSessionId: BreakoutRoomState['breakoutSessionId'];
  breakoutGroups: BreakoutRoomState['breakoutGroups'];
  assignmentStrategy: RoomAssignmentStrategy;
  canUserSwitchRoom: boolean;
  toggleRoomSwitchingAllowed: (value: boolean) => void;
  unassignedParticipants: {uid: UidType; user: BreakoutRoomUser}[];
  manualAssignments: ManualParticipantAssignment[];
  setManualAssignments: (assignments: ManualParticipantAssignment[]) => void;
  clearManualAssignments: () => void;
  createBreakoutRoomGroup: (name?: string) => void;
  isUserInRoom: (room?: BreakoutGroup) => boolean;
  joinRoom: (roomId: string, permissionAtCallTime?: boolean) => void;
  exitRoom: (roomId?: string, permissionAtCallTime?: boolean) => Promise<void>;
  closeRoom: (roomId: string) => void;
  closeAllRooms: () => void;
  updateRoomName: (newRoomName: string, roomId: string) => void;
  getAllRooms: () => BreakoutGroup[];
  getRoomMemberDropdownOptions: (memberUid: UidType) => MemberDropdownOption[];
  upsertBreakoutRoomAPI: (type: 'START' | 'UPDATE') => Promise<void>;
  checkIfBreakoutRoomSessionExistsAPI: () => Promise<boolean>;
  handleAssignParticipants: (strategy: RoomAssignmentStrategy) => void;
  // Presenters
  // onMakeMePresenter: (
  //   action: 'start' | 'stop',
  //   shouldSendEvent?: boolean,
  // ) => void;
  // presenters: {uid: UidType; timestamp: number}[];
  // clearAllPresenters: () => void;
  // State sync
  handleBreakoutRoomSyncState: (
    data: BreakoutRoomSyncStateEventPayload['data'],
    timestamp: number,
  ) => void;
  // Multi-host coordination handlers
  handleHostOperationStart: (
    operationName: string,
    hostUid: UidType,
    hostName: string,
  ) => void;
  handleHostOperationEnd: (
    operationName: string,
    hostUid: UidType,
    hostName: string,
  ) => void;
  permissions: BreakoutRoomPermissions;
  // Loading states
  isBreakoutUpdateInFlight: boolean;
  // Multi-host coordination
  currentOperatingHostName?: string;
  // State version for forcing re-computation in dependent hooks
  breakoutRoomVersion: number;
}

const BreakoutRoomContext = React.createContext<BreakoutRoomContextValue>({
  mainChannelId: '',
  isBreakoutUILocked: false,
  breakoutSessionId: undefined,
  unassignedParticipants: [],
  breakoutGroups: [],
  assignmentStrategy: RoomAssignmentStrategy.NO_ASSIGN,
  manualAssignments: [],
  setManualAssignments: () => {},
  clearManualAssignments: () => {},
  canUserSwitchRoom: false,
  toggleRoomSwitchingAllowed: () => {},
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
  upsertBreakoutRoomAPI: async () => {},
  checkIfBreakoutRoomSessionExistsAPI: async () => false,
  // onMakeMePresenter: () => {},
  // presenters: [],
  // clearAllPresenters: () => {},
  handleBreakoutRoomSyncState: () => {},
  // Multi-host coordination handlers
  handleHostOperationStart: () => {},
  handleHostOperationEnd: () => {},
  permissions: {...defaulBreakoutRoomPermission},
  // Loading states
  isBreakoutUpdateInFlight: false,
  // Multi-host coordination
  currentOperatingHostName: undefined,
  // State version for forcing re-computation in dependent hooks
  breakoutRoomVersion: 0,
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
  const {mainRoomRTMUsers} = useRTMGlobalState();
  const localUid = useLocalUid();
  const {
    data: {isHost, roomId: joinRoomId},
  } = useRoomInfo();
  const breakoutRoomExit = useBreakoutRoomExit(handleLeaveBreakout);
  const [state, baseDispatch] = useReducer(
    breakoutRoomReducer,
    initialBreakoutRoomState,
  );

  const [isBreakoutUpdateInFlight, setBreakoutUpdateInFlight] = useState(false);

  // Parse URL to determine current mode
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isBreakoutMode = searchParams.get('breakout') === 'true';
  // Main Room RTM data
  const getDisplayName = useMainRoomUserDisplayName();

  // Permissions:
  const [permissions, setPermissions] = useState<BreakoutRoomPermissions>({
    ...defaulBreakoutRoomPermission,
  });

  // Store the last operation
  const [currentOperatingHostName, setCurrentOperatingHostName] = useState<
    string | undefined
  >(undefined);

  // Timestamp Server
  const lastProcessedServerTsRef = useRef(0);
  // Self join guard (prevent stale reverts) (when self join happens)
  const lastSelfJoinRef = useRef<{roomId: string; ts: number} | null>(null);
  // Timestamp client tracking for event ordering client side
  const lastSyncedTimestampRef = useRef(0);
  const isBreakoutUILocked =
    isBreakoutUpdateInFlight || !!currentOperatingHostName;
  const lastSyncedSnapshotRef = useRef<{
    session_id: string;
    switch_room: boolean;
    assignment_type: string;
    breakout_room: BreakoutGroup[];
  } | null>(null);

  // Breakout sync queue (latest-event-wins)
  const breakoutSyncQueueRef = useRef<{
    latestTask: {
      payload: BreakoutRoomSyncStateEventPayload['data'];
      timestamp: number;
    } | null;
    isProcessing: boolean;
  }>({
    latestTask: null,
    isProcessing: false,
  });

  // Join Room pending intent
  const [selfJoinRoomId, setSelfJoinRoomId] = useState<string | null>(null);

  // Presenter
  // const {isScreenshareActive, stopScreenshare} = useScreenshare();

  // const [canIPresent, setICanPresent] = useState<boolean>(false);
  // Get presenters from custom RTM main room data (memoized to maintain stable reference)
  // const presenters = React.useMemo(
  //   () => customRTMMainRoomData.breakout_room_presenters || [],
  //   [customRTMMainRoomData],
  // );

  // State version tracker to force dependent hooks to re-compute
  const [breakoutRoomVersion, setBreakoutRoomVersion] = useState(0);

  // Refs to avoid stale closures in async callbacks
  const stateRef = useRef(state);
  const prevStateRef = useRef(state);
  const isHostRef = useRef(isHost);
  const defaultContentRef = useRef(defaultContent);
  const isMountedRef = useRef(true);

  // Enhanced dispatch that tracks user actions
  const [lastAction, setLastAction] = useState<BreakoutRoomAction | null>(null);

  const dispatch = useCallback((action: BreakoutRoomAction) => {
    // Minimal action summary for Datadog
    logger.debug(
      LogSource.Internals,
      'BREAKOUT_ROOM',
      `[Base DISPATCH] Action -> ${action.type}`,
      {
        type: action.type,
        payloadKeys: Object.keys(action?.payload || {}),
      },
    );

    if (needsDeepCloning(action)) {
      // Only deep clone when necessary
      prevStateRef.current = {
        ...stateRef.current,
        breakoutGroups: deepCloneBreakoutGroups(
          stateRef.current.breakoutGroups,
        ),
      };
    } else {
      // Shallow copy for non-participant actions
      prevStateRef.current = {
        ...stateRef.current,
        breakoutGroups: [...stateRef.current.breakoutGroups],
      };
    }
    baseDispatch(action);
    setLastAction(action);
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);
  useEffect(() => {
    defaultContentRef.current = defaultContent;
  }, [defaultContent]);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;

      // // Clear presenter attribute on unmount if user is presenting
      // if (canIPresent && !isHostRef.current) {
      //   logger.log(
      //     LogSource.Internals,
      //     'BREAKOUT_ROOM',
      //     'Clearing presenter attribute on unmount',
      //     {localUid},
      //   );

      //   // Send event to clear presenter status
      //   events.send(
      //     EventNames.BREAKOUT_PRESENTER_ATTRIBUTE,
      //     JSON.stringify({
      //       uid: localUid,
      //       isPresenter: false,
      //       timestamp: Date.now(),
      //     }),
      //     PersistanceLevel.Sender,
      //   );
      // }
    };
  }, [localUid]);

  // Timeouts
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const safeSetTimeout = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(() => {
      fn();
      timeoutsRef.current.delete(id); // cleanup after execution
    }, delay);

    timeoutsRef.current.add(id);
    return id;
  }, []);

  // Clear all timeouts
  useEffect(() => {
    const snapshot = timeoutsRef.current;
    return () => {
      snapshot.forEach(timeoutId => clearTimeout(timeoutId));
      snapshot.clear();
      logger.debug(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[CLEANUP] Cleared all pending timeouts',
      );
    };
  }, []);

  // Toast duplication
  const toastDedupeRef = useRef<Set<string>>(new Set());

  const showDeduplicatedToast = useCallback((key: string, toastConfig: any) => {
    if (toastDedupeRef.current.has(key)) {
      return;
    }

    toastDedupeRef.current.add(key);
    Toast.show(toastConfig);

    safeSetTimeout(() => {
      toastDedupeRef.current.delete(key);
    }, toastConfig.visibilityTime || 3000);
  }, []);

  // Multi-host coordination functions
  const broadcastHostOperationStart = useCallback(
    (operationName: string) => {
      if (!isHostRef.current) {
        return;
      }

      const hostName = getDisplayName(localUid);

      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        `[HOST] Broadcasting start for operation -> ${operationName}`,
        {operation: operationName, hostName, hostUid: localUid},
      );

      events.send(
        BreakoutRoomEventNames.BREAKOUT_ROOM_HOST_OPERATION_START,
        JSON.stringify({
          operationName,
          hostUid: localUid,
          hostName,
          timestamp: Date.now(),
        }),
      );
    },
    [localUid],
  );

  const broadcastHostOperationEnd = useCallback(
    (operationName: string) => {
      if (!isHostRef.current) {
        return;
      }

      const hostName = getDisplayName(localUid);

      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        `[HOST] Broadcast end for operation -> ${operationName}`,
        {
          operation: operationName,
          hostName,
          hostUid: localUid,
        },
      );

      events.send(
        BreakoutRoomEventNames.BREAKOUT_ROOM_HOST_OPERATION_END,
        JSON.stringify({
          operationName,
          hostUid: localUid,
          hostName,
          timestamp: Date.now(),
        }),
      );
    },
    [localUid],
  );

  // Common operation lock for API-triggering actions with multi-host coordination
  const acquireOperationLock = useCallback(
    (operationName: string): boolean => {
      logger.debug(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        `[LOCK] Attempt acquire for operation -> ${operationName}`,
        {operationName, inFlight: isBreakoutUpdateInFlight},
      );

      if (isBreakoutUpdateInFlight) {
        logger.warn(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          `[LOCK] Blocked as (Update BreakoutRoom API in flight) for operation -> ${operationName}`,
          {blockedOperation: operationName},
        );
        return false;
      }

      // Broadcast that this host is starting an operation

      setBreakoutUpdateInFlight(true);
      broadcastHostOperationStart(operationName);

      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        `[LOCK] Acquired for operation -> ${operationName}`,
        {
          operationName,
        },
      );
      return true;
    },
    [
      isBreakoutUpdateInFlight,
      broadcastHostOperationStart,
      setBreakoutUpdateInFlight,
    ],
  );

  // Update unassigned participants
  useEffect(() => {
    if (!stateRef.current?.breakoutSessionId) {
      return;
    }

    // Filter users from defaultContent first, then check if they're in activeUids
    // This follows the legacy RTM pattern: start with defaultContent, then filter by activeUids
    const filteredParticipants = Object.entries(defaultContent)
      .filter(([k, v]) => {
        // Only include RTC users
        if (v?.type !== 'rtc') {
          return false;
        }
        // Exclude offline users
        if (v?.offline) {
          return false;
        }
        // Exclude screenshare UIDs (they typically have a parentUid)
        if (v?.parentUid) {
          return false;
        }
        // KEY CHECK: Only include users who are in activeUids (actually in the call)
        const uid = parseInt(k);
        if (activeUids.indexOf(uid) === -1) {
          return false;
        }
        return true;
      })
      .map(([k, v]) => {
        const uid = parseInt(k);

        // Get additional RTM data if available for cross-room scenarios
        const rtmUser = mainRoomRTMUsers[uid];
        const user = v || rtmUser;
        // Create BreakoutRoomUser object with proper fallback
        const breakoutRoomUser: BreakoutRoomUser = {
          name: user?.name || rtmUser?.name || '',
          isHost: user?.isHost === 'true',
        };

        return {uid, user: breakoutRoomUser};
      });

    // Sort participants to show local user first
    filteredParticipants.sort((a, b) => {
      if (a.uid === localUid) {
        return -1;
      }
      if (b.uid === localUid) {
        return 1;
      }
      return 0;
    });

    logger.debug(
      LogSource.Internals,
      'BREAKOUT_ROOM',
      '[STATE] Update unassigned participants',
      {
        count: filteredParticipants.length,
        filteredParticipants: filteredParticipants,
      },
    );

    // // Find offline users who are currently assigned to breakout rooms
    // const currentlyAssignedUids = new Set<UidType>();
    // stateRef.current.breakoutGroups.forEach(group => {
    //   group.participants.hosts.forEach(uid => currentlyAssignedUids.add(uid));
    //   group.participants.attendees.forEach(uid => currentlyAssignedUids.add(uid));
    // });

    // const offlineAssignedUsers = Array.from(currentlyAssignedUids).filter(uid => {
    //   const user = defaultContent[uid];
    //   return !user || user.offline || user.type !== 'rtc';
    // });

    // // Remove offline users from breakout rooms if any found
    // if (offlineAssignedUsers.length > 0) {
    //   console.log('Removing offline users from breakout rooms:', offlineAssignedUsers);
    //   dispatch({
    //     type: BreakoutGroupActionTypes.REMOVE_OFFLINE_USERS,
    //     payload: {
    //       offlineUserUids: offlineAssignedUsers,
    //     },
    //   });
    // }

    // Update unassigned participants
    dispatch({
      type: BreakoutGroupActionTypes.UPDATE_UNASSIGNED_PARTICIPANTS,
      payload: {unassignedParticipants: filteredParticipants},
    });
  }, [
    defaultContent,
    activeUids,
    localUid,
    dispatch,
    state.breakoutSessionId,
    mainRoomRTMUsers,
  ]);

  // Increment Version when breakout data changes
  useEffect(() => {
    setBreakoutRoomVersion(prev => prev + 1);
  }, [state.breakoutGroups]);

  // Check if there is already an active breakout session
  // We can call this to trigger sync events
  const checkIfBreakoutRoomSessionExistsAPI =
    useCallback(async (): Promise<boolean> => {
      // Skip API call if roomId is not available or if API update is in progress
      if (!joinRoomId?.host && !joinRoomId?.attendee) {
        logger.debug(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          '[API: checkIfBreakoutRoomSessionExistsAPI] Skipped (no roomId available yet)',
        );
        return false;
      }

      if (isBreakoutUpdateInFlight) {
        logger.debug(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          '[API checkIfBreakoutRoomSessionExistsAPI] Skipped (upsert in progress)',
        );
        return false;
      }

      const startTime = Date.now();
      const requestId = getUniqueID();
      const url = `${
        $config.BACKEND_ENDPOINT
      }/v1/channel/breakout-room?passphrase=${
        isHostRef.current ? joinRoomId.host : joinRoomId.attendee
      }`;

      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[API checkIfBreakoutRoomSessionExistsAPI] current sessionId and role',
        {
          isHost: isHostRef.current,
          sessionId: stateRef.current.breakoutSessionId,
        },
      );

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            authorization: store.token ? `Bearer ${store.token}` : '',
            'X-Request-Id': requestId,
            'X-Session-Id': logger.getSessionId(),
          },
        });
        // Guard against component unmount after fetch
        if (!isMountedRef.current) {
          logger.log(
            LogSource.Internals,
            'BREAKOUT_ROOM',
            '[API checkIfBreakoutRoomSessionExistsAPI] cancelled (unmounted)',
            {requestId},
          );
          return false;
        }

        const latency = Date.now() - startTime;

        // Log network request
        logger.log(
          LogSource.NetworkRest,
          'breakout-room',
          'GET breakout-room session',
          {url, method: 'GET', status: response.status, latency, requestId},
        );
        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`);
        }
        if (response.status === 204) {
          logger.log(
            LogSource.Internals,
            'BREAKOUT_ROOM',
            '[API checkIfBreakoutRoomSessionExistsAPI] No active session',
          );
          return false;
        }

        const data = await response.json();

        if (data?.session_id) {
          logger.log(
            LogSource.Internals,
            'BREAKOUT_ROOM',
            '[API checkIfBreakoutRoomSessionExistsAPI] session exists got breakout data',
            {
              sessionId: data.session_id,
              rooms: data?.breakout_room || 0,
              roomCount: data?.breakout_room?.length || 0,
              assignmentType: data?.assignment_type,
              switchRoom: data?.switch_room,
            },
          );
          return true;
        }
        return false;
      } catch (error: any) {
        const latency = Date.now() - startTime;
        logger.error(
          LogSource.NetworkRest,
          'breakout-room',
          'GET breakout-room session failed',
          {
            url,
            method: 'GET',
            error: error?.message,
            latency,
            requestId,
          },
        );
        return false;
      }
    }, [isBreakoutUpdateInFlight, joinRoomId, store.token]);

  // Initial session check with delayed start
  useEffect(() => {
    if (!joinRoomId?.host && !joinRoomId?.attendee) {
      return;
    }
    const loadInitialData = async () => {
      logger.debug(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[API checkIfBreakoutRoomSessionExistsAPI] will be called , inside loadInitial data',
      );
      await checkIfBreakoutRoomSessionExistsAPI();
    };

    // Check if we just transitioned to breakout mode as that we can delay the call
    // to check breakout api
    const justEnteredBreakout = sessionStorage.getItem(
      'breakout_room_transition',
    );
    const delay = justEnteredBreakout ? 3000 : 1200;

    if (justEnteredBreakout) {
      sessionStorage.removeItem('breakout_room_transition');
      logger.debug(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[INIT] Using a bit of delay after breakout transition so it gives time for user to join the call',
        {delay},
      );
    }

    const timeoutId = setTimeout(() => {
      loadInitialData();
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [joinRoomId, checkIfBreakoutRoomSessionExistsAPI]);

  // Upsert API
  const upsertBreakoutRoomAPI = useCallback(
    async (type: 'START' | 'UPDATE' = 'START', retryCount = 0) => {
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
      const url = `${$config.BACKEND_ENDPOINT}/v1/channel/breakout-room`;

      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        `[API upsertBreakoutRoomAPI] Upsert start called with intent ->(${type})`,
        {
          type,
          isHost: isHostRef.current,
          sessionId: stateRef.current.breakoutSessionId,
          roomCount: stateRef.current.breakoutGroups.length,
          assignmentStrategy: stateRef.current.assignmentStrategy,
          canSwitchRoom: stateRef.current.canUserSwitchRoom,
          selfJoinRoomId,
        },
      );

      try {
        const sessionId =
          stateRef.current.breakoutSessionId || randomNameGenerator(6);

        const payload: UpsertPayload = {
          passphrase: isHostRef.current ? joinRoomId.host : joinRoomId.attendee,
          switch_room: stateRef.current.canUserSwitchRoom,
          session_id: sessionId,
          assignment_type: stateRef.current.assignmentStrategy,
          breakout_room:
            type === 'START'
              ? getSanitizedPayload(
                  initialBreakoutGroups,
                  defaultContentRef,
                  mainRoomRTMUsers,
                )
              : getSanitizedPayload(
                  stateRef.current.breakoutGroups,
                  defaultContentRef,
                  mainRoomRTMUsers,
                ),
        };

        // Only add join_room_id if attendee has called this api(during join room)
        if (selfJoinRoomId) {
          payload.join_room_id = selfJoinRoomId;
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: store.token ? `Bearer ${store.token}` : '',
            'X-Request-Id': requestId,
            'X-Session-Id': logger.getSessionId(),
          },
          body: JSON.stringify(payload),
        });

        if (!isMountedRef.current) {
          logger.log(
            LogSource.Internals,
            'BREAKOUT_ROOM',
            '[API upsertBreakoutRoomAPI] Upsert cancelled (unmounted)',
            {type, requestId},
          );
          return;
        }

        const latency = Date.now() - startReqTs;

        logger.log(
          LogSource.NetworkRest,
          'breakout-room',
          'POST breakout-room upsert',
          {
            url,
            method: 'POST',
            status: response.status,
            latency,
            requestId,
            type,
            payloadSize: JSON.stringify(payload).length,
          },
        );

        if (!response.ok) {
          const msg = await response.text();

          if (!isMountedRef.current) {
            logger.log(
              LogSource.Internals,
              'BREAKOUT_ROOM',
              '[API upsertBreakoutRoomAPI] Error text parsing cancelled (unmounted)',
              {type, status: response.status, requestId},
            );
            return;
          }

          throw new Error(`Breakout room creation failed: ${msg}`);
        } else {
          const data = await response.json();

          if (!isMountedRef.current) {
            logger.log(
              LogSource.Internals,
              'BREAKOUT_ROOM',
              '[API upsertBreakoutRoomAPI] Upsert success cancelled (unmounted)',
              {type, requestId},
            );
            return;
          }

          logger.log(
            LogSource.Internals,
            'BREAKOUT_ROOM',
            `[API upsertBreakoutRoomAPI] Upsert success called with intent -> (${type})`,
            {
              type,
              newSessionId: data?.session_id,
              roomsUpdated: !!data?.breakout_room,
              latency,
            },
          );

          if (type === 'START' && data?.session_id) {
            dispatch({
              type: BreakoutGroupActionTypes.SET_SESSION_ID,
              payload: {sessionId: data.session_id},
            });
          }
        }
      } catch (err: any) {
        const latency = Date.now() - startReqTs;
        const maxRetries = 3;
        const isRetriableError =
          err?.name === 'TypeError' || // Network errors
          err?.message?.includes('fetch') ||
          err?.message?.includes('timeout') ||
          err?.response?.status >= 500; // Server errors

        logger.log(
          LogSource.NetworkRest,
          'breakout-room',
          'POST breakout-room upsert failed',
          {
            url,
            method: 'POST',
            error: err?.message,
            latency,
            requestId,
            type,
            retryCount,
            isRetriableError,
            willRetry: retryCount < maxRetries && isRetriableError,
          },
        );

        // Retry logic for network/server errors
        if (retryCount < maxRetries && isRetriableError) {
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          logger.log(
            LogSource.Internals,
            'BREAKOUT_ROOM',
            `[API upsertBreakoutRoomAPI] Retrying upsert in ${retryDelay}ms`,
            {retryCount: retryCount + 1, maxRetries, type},
          );

          safeSetTimeout(() => {
            if (!isMountedRef.current) {
              logger.log(
                LogSource.Internals,
                'BREAKOUT_ROOM',
                '[API upsertBreakoutRoomAPI] Retry cancelled (unmounted)',
                {type, retryCount: retryCount + 1},
              );
              return;
            }
            upsertBreakoutRoomAPI(type, retryCount + 1);
          }, retryDelay);
          return; // Don't execute finally block on retry
        }

        setSelfJoinRoomId(null);
      } finally {
        if (retryCount === 0) {
          setSelfJoinRoomId(null);
        }
      }
    },
    [
      joinRoomId.host,
      store.token,
      dispatch,
      selfJoinRoomId,
      joinRoomId.attendee,
      mainRoomRTMUsers,
    ],
  );

  const setManualAssignments = useCallback(
    (assignments: ManualParticipantAssignment[]) => {
      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[ACTION] Set manual assignments',
        {count: assignments.length},
      );
      dispatch({
        type: BreakoutGroupActionTypes.SET_MANUAL_ASSIGNMENTS,
        payload: {assignments},
      });
    },
    [dispatch],
  );

  const clearManualAssignments = useCallback(() => {
    logger.log(
      LogSource.Internals,
      'BREAKOUT_ROOM',
      '[ACTION] Clear manual assignments',
    );
    dispatch({
      type: BreakoutGroupActionTypes.CLEAR_MANUAL_ASSIGNMENTS,
    });
  }, [dispatch]);

  const toggleRoomSwitchingAllowed = (value: boolean) => {
    if (!acquireOperationLock('SET_ALLOW_PEOPLE_TO_SWITCH_ROOM')) {
      return;
    }

    logger.log(
      LogSource.Internals,
      'BREAKOUT_ROOM',
      `[ACTION] Toggle room switching with value ${value}`,
      {
        previousValue: stateRef.current.canUserSwitchRoom,
        newValue: value,
        isHost: isHostRef.current,
      },
    );

    dispatch({
      type: BreakoutGroupActionTypes.SET_ALLOW_PEOPLE_TO_SWITCH_ROOM,
      payload: {canUserSwitchRoom: value},
    });
  };

  const createBreakoutRoomGroup = () => {
    if (!acquireOperationLock('CREATE_GROUP')) {
      return;
    }

    logger.log(
      LogSource.Internals,
      'BREAKOUT_ROOM',
      '[ACTION] Create new breakout room',
      {
        currentRoomCount: stateRef.current.breakoutGroups.length,
        isHost: isHostRef.current,
        sessionId: stateRef.current.breakoutSessionId,
      },
    );

    dispatch({type: BreakoutGroupActionTypes.CREATE_GROUP});
  };

  const handleAssignParticipants = (strategy: RoomAssignmentStrategy) => {
    if (stateRef.current.breakoutGroups.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'No breakout rooms found.',
        visibilityTime: 3000,
      });
      logger.warn(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[ACTION] Assign participants blocked (no rooms)',
        {strategy},
      );
      return;
    }

    // Check for participants available for assignment based on strategy
    const availableParticipants =
      strategy === RoomAssignmentStrategy.AUTO_ASSIGN
        ? stateRef.current.unassignedParticipants.filter(
            participant => participant.uid !== localUid,
          )
        : stateRef.current.unassignedParticipants;

    if (availableParticipants.length === 0) {
      const message =
        strategy === RoomAssignmentStrategy.AUTO_ASSIGN &&
        stateRef.current.unassignedParticipants.length > 0
          ? 'No other participants to assign. (Host is excluded from auto-assignment)'
          : 'No participants left to assign.';

      Toast.show({type: 'info', text1: message, visibilityTime: 3000});
      logger.warn(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[ACTION] Assign participants blocked (none available)',
        {strategy},
      );
      return;
    }

    if (!acquireOperationLock(`ASSIGN_${strategy}`)) {
      return;
    }

    logger.log(
      LogSource.Internals,
      'BREAKOUT_ROOM',
      `[ACTION] Assign participants with strategy ${strategy}`,
      {
        strategy,
        unassignedCount: stateRef.current.unassignedParticipants.length,
        roomCount: stateRef.current.breakoutGroups.length,
        isHost: isHostRef.current,
      },
    );

    if (strategy === RoomAssignmentStrategy.AUTO_ASSIGN) {
      dispatch({
        type: BreakoutGroupActionTypes.AUTO_ASSIGN_PARTICPANTS,
        payload: {localUid},
      });
    }
    if (strategy === RoomAssignmentStrategy.MANUAL_ASSIGN) {
      dispatch({type: BreakoutGroupActionTypes.MANUAL_ASSIGN_PARTICPANTS});
    }
    if (strategy === RoomAssignmentStrategy.NO_ASSIGN) {
      dispatch({type: BreakoutGroupActionTypes.NO_ASSIGN_PARTICIPANTS});
    }
  };

  const moveUserToMainRoom = (uid: UidType) => {
    try {
      if (!uid) {
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          '[ACTION] Move to main blocked (no uid)',
        );
        return;
      }

      // Check for API operation conflicts first
      if (!acquireOperationLock('MOVE_PARTICIPANT_TO_MAIN')) {
        return;
      }

      // Use fresh state to avoid race conditions
      const currentState = stateRef.current;
      const currentGroup = currentState.breakoutGroups.find(
        group =>
          group.participants.hosts.includes(uid) ||
          group.participants.attendees.includes(uid),
      );

      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[ACTION] Move user to main',
        {
          userId: uid,
          fromGroupId: currentGroup?.id,
          fromGroupName: currentGroup?.name,
        },
      );

      if (currentGroup) {
        dispatch({
          type: BreakoutGroupActionTypes.MOVE_PARTICIPANT_TO_MAIN,
          payload: {uid, fromGroupId: currentGroup.id},
        });
      }
    } catch (error: any) {
      logger.error(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[ERROR] Move to main failed',
        {userId: uid, error: error?.message},
      );
    }
  };

  const moveUserIntoGroup = (uid: UidType, toGroupId: string) => {
    try {
      if (!uid) {
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          '[ACTION] Move to group blocked (no uid)',
          {toGroupId},
        );
        return;
      }

      // Check for API operation conflicts first
      if (!acquireOperationLock('MOVE_PARTICIPANT_TO_GROUP')) {
        return;
      }

      // Use fresh state to avoid race conditions
      const currentState = stateRef.current;
      const currentGroup = currentState.breakoutGroups.find(
        group =>
          group.participants.hosts.includes(uid) ||
          group.participants.attendees.includes(uid),
      );
      const targetGroup = currentState.breakoutGroups.find(
        group => group.id === toGroupId,
      );

      if (!targetGroup) {
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          '[ACTION] Move to group blocked (target not found)',
          {userId: uid, toGroupId},
        );
        return;
      }

      // Determine if user is host
      let isUserHost: boolean | undefined;
      if (currentGroup) {
        // User is moving from another breakout room
        isUserHost = currentGroup.participants.hosts.includes(uid);
      } else {
        // User is moving from main room - check mainRoomRTMUsers
        const rtmUser = mainRoomRTMUsers[uid];
        if (rtmUser) {
          isUserHost = rtmUser.isHost === 'true';
        }
      }

      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[ACTION] Move user between groups',
        {
          userId: uid,
          fromGroupId: currentGroup?.id,
          fromGroupName: currentGroup?.name,
          toGroupId,
          toGroupName: targetGroup.name,
          isUserHost,
        },
      );
      // // Clean up presenter status if user is switching rooms
      // const isPresenting = presenters.some(p => p.uid === uid);
      // if (isPresenting) {
      //   setCustomRTMMainRoomData(prev => ({
      //     ...prev,
      //     breakout_room_presenters: (
      //       prev.breakout_room_presenters || []
      //     ).filter((p: any) => p.uid !== uid),
      //   }));

      //   // Notify the user that their presenter access was removed
      //   try {
      //     events.send(
      //       BreakoutRoomEventNames.BREAKOUT_ROOM_MAKE_PRESENTER,
      //       JSON.stringify({
      //         uid: uid,
      //         timestamp: Date.now(),
      //         action: 'stop',
      //       }),
      //       PersistanceLevel.None,
      //       uid,
      //     );
      //   } catch (error) {
      //     logger.log(
      //       LogSource.Internals,
      //       'BREAKOUT_ROOM',
      //       'Error sending presenter stop event on room switch',
      //       {error: error.message},
      //     );
      //   }
      // }

      dispatch({
        type: BreakoutGroupActionTypes.MOVE_PARTICIPANT_TO_GROUP,
        payload: {
          uid,
          fromGroupId: currentGroup?.id,
          toGroupId,
          isHost: isUserHost,
        },
      });
    } catch (error: any) {
      logger.error(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[ERROR] Move to group failed',
        {userId: uid, toGroupId, error: error?.message},
      );
    }
  };

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
        return stateRef.current.breakoutGroups.some(
          group =>
            group.participants.hosts.includes(localUid) ||
            group.participants.attendees.includes(localUid),
        );
      }
    },
    [localUid, breakoutRoomVersion],
  );

  const findUserRoomId = (uid: UidType, groups: BreakoutGroup[] = []) =>
    groups.find(g => {
      const hosts = Array.isArray(g?.participants?.hosts)
        ? g.participants.hosts
        : [];
      const attendees = Array.isArray(g?.participants?.attendees)
        ? g.participants.attendees
        : [];
      return hosts.includes(uid) || attendees.includes(uid);
    })?.id ?? null;

  // Permissions recompute
  useEffect(() => {
    if (lastSyncedSnapshotRef.current) {
      const current = lastSyncedSnapshotRef.current;

      const currentlyInRoom = !!findUserRoomId(localUid, current.breakout_room);
      const hasAvailableRooms = current.breakout_room?.length > 0;
      const allowAttendeeSwitch = current.switch_room;

      const nextPermissions: BreakoutRoomPermissions = {
        canJoinRoom:
          hasAvailableRooms && (isHostRef.current || allowAttendeeSwitch),
        canExitRoom: isBreakoutMode && currentlyInRoom,
        canSwitchBetweenRooms:
          currentlyInRoom &&
          hasAvailableRooms &&
          (isHostRef.current || allowAttendeeSwitch),
        canScreenshare: true,
        canRaiseHands: !isHostRef.current && !!current.session_id,
        canAssignParticipants: isHostRef.current && !currentlyInRoom,
        canHostManageMainRoom: isHostRef.current,
        canCreateRooms: isHostRef.current,
        canMoveUsers: isHostRef.current,
        canCloseRooms:
          isHostRef.current && hasAvailableRooms && !!current.session_id,
        canMakePresenter: isHostRef.current,
      };

      logger.debug(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[PERMISSIONS] Recomputed',
        {
          currentlyInRoom,
          hasAvailableRooms,
          allowAttendeeSwitch,
          isHost: isHostRef.current,
        },
      );

      setPermissions(nextPermissions);
    }
  }, [breakoutRoomVersion, isBreakoutMode, localUid]);

  const joinRoom = (
    toRoomId: string,
    permissionAtCallTime = permissions.canJoinRoom,
  ) => {
    if (!permissionAtCallTime) {
      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[ACTION] Join blocked (no permission)',
        {toRoomId, currentPermission: permissions.canJoinRoom},
      );
      return;
    }
    if (!localUid) {
      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[ACTION] Join blocked (no local user)',
        {toRoomId},
      );
      return;
    }

    const toRoomName =
      stateRef.current.breakoutGroups.find(r => r.id === toRoomId)?.name || '';

    logger.log(
      LogSource.Internals,
      'BREAKOUT_ROOM',
      `[ACTION] User joining room ${toRoomName}`,
      {
        userId: localUid,
        toRoomId,
        toRoomName: toRoomName,
      },
    );

    lastSelfJoinRef.current = {roomId: toRoomId, ts: Date.now()};
    moveUserIntoGroup(localUid, toRoomId);
    if (!isHostRef.current) {
      setSelfJoinRoomId(toRoomId);
    }
  };

  const exitRoom = useCallback(
    async (permissionAtCallTime = permissions.canExitRoom) => {
      // Use permission passed at call time to avoid race conditions
      if (!permissionAtCallTime) {
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          '[ACTION] Exit blocked (no permission)',
          {currentPermission: permissions.canExitRoom},
        );
        return;
      }

      // If u are reciving or calling this tha means u will have
      // valid data in defaultcontent as u cannot exit from the room
      // you are not in
      const localUser = defaultContentRef.current[localUid];

      // // Clean up presenter status if user is presenting
      // const isPresenting = presenters.some(p => p.uid === localUid);
      // if (isPresenting) {
      //   setCustomRTMMainRoomData(prev => ({
      //     ...prev,
      //     breakout_room_presenters: (
      //       prev.breakout_room_presenters || []
      //     ).filter((p: any) => p.uid !== localUid),
      //   }));
      //   setICanPresent(false);
      // }

      try {
        if (localUser) {
          // Use breakout-specific exit (doesn't destroy main RTM)
          await breakoutRoomExit();

          // Guard against component unmount
          if (!isMountedRef.current) {
            logger.log(
              LogSource.Internals,
              'BREAKOUT_ROOM',
              '[ACTION] Exit cancelled (unmounted)',
              {userId: localUid},
            );
            return;
          }

          logger.log(
            LogSource.Internals,
            'BREAKOUT_ROOM',
            '[ACTION] Exit success',
            {userId: localUid},
          );
        }
      } catch (error: any) {
        logger.error(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          '[ERROR] Exit room failed',
          {userId: localUid, error: error?.message},
        );
      }
    },
    [localUid, permissions.canExitRoom, breakoutRoomExit],
  );

  const closeRoom = (roomIdToClose: string) => {
    if (!acquireOperationLock('CLOSE_GROUP')) {
      return;
    }

    const roomToClose = stateRef.current.breakoutGroups.find(
      r => r.id === roomIdToClose,
    );

    logger.log(
      LogSource.Internals,
      'BREAKOUT_ROOM',
      `[ACTION] Close room -> ${roomToClose?.name}`,
      {
        roomId: roomIdToClose,
        roomName: roomToClose?.name,
        participantCount:
          (roomToClose?.participants.hosts.length || 0) +
          (roomToClose?.participants.attendees.length || 0),
        isHost: isHostRef.current,
      },
    );

    dispatch({
      type: BreakoutGroupActionTypes.CLOSE_GROUP,
      payload: {groupId: roomIdToClose},
    });
  };

  const closeAllRooms = () => {
    if (!acquireOperationLock('CLOSE_ALL_GROUPS')) {
      return;
    }

    logger.log(
      LogSource.Internals,
      'BREAKOUT_ROOM',
      '[ACTION] Close all rooms',
      {
        roomCount: stateRef.current.breakoutGroups.length,
        totalParticipants: stateRef.current.breakoutGroups.reduce(
          (sum, room) =>
            sum +
            room.participants.hosts.length +
            room.participants.attendees.length,
          0,
        ),
        isHost: isHostRef.current,
        sessionId: stateRef.current.breakoutSessionId,
      },
    );

    // Clear all presenters when closing all rooms
    // clearAllPresenters();

    dispatch({type: BreakoutGroupActionTypes.CLOSE_ALL_GROUPS});
  };

  const updateRoomName = (newRoomName: string, roomIdToEdit: string) => {
    if (!acquireOperationLock('RENAME_GROUP')) {
      return;
    }

    const roomToRename = stateRef.current.breakoutGroups.find(
      r => r.id === roomIdToEdit,
    );

    logger.log(LogSource.Internals, 'BREAKOUT_ROOM', '[ACTION] Rename room', {
      roomId: roomIdToEdit,
      oldName: roomToRename?.name,
      newName: newRoomName,
      isHost: isHostRef.current,
    });

    dispatch({
      type: BreakoutGroupActionTypes.RENAME_GROUP,
      payload: {newName: newRoomName, groupId: roomIdToEdit},
    });
  };

  const getAllRooms = () => {
    return stateRef.current.breakoutGroups.length > 0
      ? stateRef.current.breakoutGroups
      : [];
  };

  // const isUserPresenting = useCallback(
  //   (uid?: UidType) => {
  //     if (uid !== undefined) {
  //       return presenters.some(presenter => presenter.uid === uid);
  //     }
  //     // fall back to current user
  //     return canIPresent;
  //   },
  //   [presenters, canIPresent],
  // );

  // // User wants to start presenting
  // const makePresenter = (uid: UidType, action: 'start' | 'stop') => {
  //   logger.log(
  //     LogSource.Internals,
  //     'BREAKOUT_ROOM',
  //     `Make presenter - ${action}`,
  //     {
  //       targetUserId: uid,
  //       action,
  //       isHost: isHostRef.current,
  //     },
  //   );
  //   if (!uid) {
  //     return;
  //   }
  //   try {
  //     const timestamp = Date.now();
  //     console.log('supriya-presenter sending make presenter');
  //     // Host sends BREAKOUT_ROOM_MAKE_PRESENTER event to the attendee
  //     events.send(
  //       BreakoutRoomEventNames.BREAKOUT_ROOM_MAKE_PRESENTER,
  //       JSON.stringify({
  //         uid: uid,
  //         timestamp,
  //         action,
  //       }),
  //       PersistanceLevel.None,
  //       uid,
  //     );

  //     // Host immediately updates their own customRTMMainRoomData
  //     if (action === 'start') {
  //       setCustomRTMMainRoomData(prev => {
  //         const currentPresenters = prev.breakout_room_presenters || [];
  //         // Check if already presenting to avoid duplicates
  //         const exists = currentPresenters.find(
  //           (presenter: any) => presenter.uid === uid,
  //         );
  //         if (exists) {
  //           return prev;
  //         }
  //         return {
  //           ...prev,
  //           breakout_room_presenters: [...currentPresenters, {uid, timestamp}],
  //         };
  //       });
  //     } else if (action === 'stop') {
  //       setCustomRTMMainRoomData(prev => ({
  //         ...prev,
  //         breakout_room_presenters: (
  //           prev.breakout_room_presenters || []
  //         ).filter((presenter: any) => presenter.uid !== uid),
  //       }));
  //     }
  //   } catch (error) {
  //     logger.log(
  //       LogSource.Internals,
  //       'BREAKOUT_ROOM',
  //       'Error making user presenter',
  //       {
  //         targetUserId: uid,
  //         action,
  //         error: error.message,
  //       },
  //     );
  //   }
  // };

  // const onMakeMePresenter = useCallback(
  //   (action: 'start' | 'stop', shouldSendEvent: boolean = true) => {
  //     logger.log(
  //       LogSource.Internals,
  //       'BREAKOUT_ROOM',
  //       `User became presenter - ${action}`,
  //     );

  //     const timestamp = Date.now();

  //     // Send event only if requested (not when restoring from attribute)
  //     if (shouldSendEvent) {
  //       // Attendee sends BREAKOUT_PRESENTER_ATTRIBUTE event to persist their presenter status
  //       events.send(
  //         EventNames.BREAKOUT_PRESENTER_ATTRIBUTE,
  //         JSON.stringify({
  //           uid: localUid,
  //           isPresenter: action === 'start',
  //           timestamp,
  //         }),
  //         PersistanceLevel.Sender,
  //       );
  //     }

  //     if (action === 'start') {
  //       setICanPresent(true);
  //       // Show toast notification when presenter permission is granted
  //       Toast.show({
  //         type: 'success',
  //         text1: 'You can now present in this breakout room',
  //         visibilityTime: 3000,
  //       });
  //     } else if (action === 'stop') {
  //       if (isScreenshareActive) {
  //         stopScreenshare();
  //       }
  //       setICanPresent(false);
  //       // Show toast notification when presenter permission is removed
  //       Toast.show({
  //         type: 'info',
  //         text1: 'Your presenter access has been removed',
  //         visibilityTime: 3000,
  //       });
  //     }
  //   },
  //   [isScreenshareActive, localUid],
  // );

  // const clearAllPresenters = useCallback(() => {
  //   setCustomRTMMainRoomData(prev => ({
  //     ...prev,
  //     breakout_room_presenters: [],
  //   }));
  // }, [setCustomRTMMainRoomData]);

  const getRoomMemberDropdownOptions = useCallback(
    (memberUid: UidType) => {
      const options: MemberDropdownOption[] = [];
      if (!memberUid) {
        return options;
      }

      const currentRoom = stateRef.current.breakoutGroups.find(
        group =>
          group.participants.hosts.includes(memberUid) ||
          group.participants.attendees.includes(memberUid),
      );

      logger.debug(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[UI] Member dropdown options computed',
        {
          memberUid,
          currentRoomId: currentRoom?.id,
          roomCount: stateRef.current.breakoutGroups.length,
        },
      );

      options.push({
        icon: 'double-up-arrow',
        type: 'move-to-main',
        title: 'Move to Main Room',
        onOptionPress: () => moveUserToMainRoom(memberUid),
      });
      // Move to other breakout rooms (exclude current room)
      stateRef.current.breakoutGroups
        .filter(group => group.id !== currentRoom?.id)
        .forEach(group => {
          options.push({
            type: 'move-to-room',
            icon: 'move-up',
            title: `Shift to : ${group.name}`,
            roomId: group.id,
            roomName: group.name,
            onOptionPress: () => moveUserIntoGroup(memberUid, group.id),
          });
        });

      // // Make presenter option is available only for host
      // // and if the incoming member is also a host we dont
      // // need to show this option as they can already present
      // const isUserHost =
      //   currentRoom?.participants.hosts.includes(memberUid) || false;
      // if (isUserHost) {
      //   return options;
      // }
      // if (isHostRef.current) {
      //   const userIsPresenting = isUserPresenting(memberUid);
      //   const title = userIsPresenting ? 'Stop presenter' : 'Make a Presenter';
      //   const action = userIsPresenting ? 'stop' : 'start';
      //   options.push({
      //     type: 'make-presenter',
      //     icon: 'promote-filled',
      //     title,
      //     onOptionPress: () => makePresenter(memberUid, action),
      //   });
      // }
      return options;
    },
    // [isUserPresenting, presenters, breakoutRoomVersion],
    [breakoutRoomVersion],
  );

  // ---- SYNC (EVENTS) ----

  const _handleBreakoutRoomSyncState = useCallback(
    async (
      payload: BreakoutRoomSyncStateEventPayload['data'],
      timestamp: number,
    ) => {
      const {srcuid, data} = payload;
      const {
        session_id,
        switch_room,
        breakout_room,
        assignment_type,
        sts = 0,
      } = data;

      logger.debug(
        LogSource.Events,
        'RTM_EVENTS',
        '[SYNC] Breakout sync event received',
        {
          srcuid,
          session_id,
          timestamp,
          sts,
          newRooms: breakout_room?.length || 0,
          currentRooms: stateRef.current.breakoutGroups.length,
        },
      );

      // Global server ordering
      if (sts <= lastProcessedServerTsRef.current) {
        logger.warn(
          LogSource.Events,
          'RTM_EVENTS',
          '[SYNC] Ignored out-of-order state',
          {sts, lastProcessedServerTs: lastProcessedServerTsRef.current},
        );
        return;
      }
      lastProcessedServerTsRef.current = sts;

      // Self-join race protection
      if (
        lastSelfJoinRef.current &&
        Date.now() - lastSelfJoinRef.current.ts < 2000 && // 2s cooldown
        !findUserRoomId(localUid, breakout_room)
      ) {
        logger.warn(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          '[SYNC] Ignored stale revert conflicting with recent self-join',
          {recentJoinRoomId: lastSelfJoinRef.current.roomId},
        );
        return;
      }

      // Local duplicate protection (client-side ordering) Skip events older than the last processed timestamp
      if (timestamp && timestamp <= lastSyncedTimestampRef.current) {
        logger.warn(
          LogSource.Events,
          'RTM_EVENTS',
          '[SYNC] Ignored old sync event',
          {
            timestamp,
            lastProcessed: lastSyncedTimestampRef.current,
          },
        );
        return;
      }

      const prevSnapshot = lastSyncedSnapshotRef?.current;
      const prevGroups = prevSnapshot?.breakout_room || [];
      const prevSwitchRoom = prevSnapshot?.switch_room ?? true;
      const prevRoomId = findUserRoomId(localUid, prevGroups);
      const nextRoomId = findUserRoomId(localUid, breakout_room);

      // 1. !prevRoomId && nextRoomId = Main → Breakout (joining)
      // 2. prevRoomId && nextRoomId && prevRoomId !== nextRoomId = Breakout A → Breakout B (switching)
      // 3. prevRoomId && !nextRoomId = Breakout → Main (leaving)
      // 4. !prevRoomId && !nextRoomId = Main → Main (no change)

      const userMovedBetweenRooms =
        prevRoomId && nextRoomId && prevRoomId !== nextRoomId;
      const userLeftBreakoutRoom = prevRoomId && !nextRoomId;

      const senderName = getDisplayName(srcuid);

      // ---- SCREEN SHARE CLEANUP ----
      // Stop screen share if user is moving between rooms or leaving breakout
      // if (
      //   (userMovedBetweenRooms || userLeftBreakoutRoom) &&
      //   isScreenshareActive
      // ) {
      //   console.log(
      //     'supriya-sync-ordering: stopping screenshare due to room change',
      //   );
      //   stopScreenshare();
      // }

      // ---- PRIORITY ORDER ----
      // 1) All rooms closed
      if (breakout_room.length === 0 && prevGroups.length > 0) {
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          '[SYNC][Condition 1] All rooms closed',
          {prevRoomCount: prevGroups.length, srcuid, senderName},
        );

        if (prevRoomId && isBreakoutMode) {
          // Don't show toast if the user is the author
          if (srcuid !== localUid) {
            showDeduplicatedToast('all-rooms-closed', {
              leadingIconName: 'close-room',
              type: 'info',
              text1: `Host: ${senderName} has closed all breakout rooms.`,
              text2: 'Returning to the main room...',
              visibilityTime: 3000,
            });
          }
          // Set transition flag - user will remount in main room and need fresh data
          sessionStorage.setItem('breakout_room_transition', 'true');
          lastSyncedSnapshotRef.current = null;
          return exitRoom(true);
        } else {
          // 2. User is in main room recevies just notification
          // Don't show toast if the user is the author
          if (srcuid !== localUid) {
            showDeduplicatedToast('all-rooms-closed', {
              leadingIconName: 'close-room',
              type: 'info',
              text1: `Host: ${senderName} has closed all breakout rooms`,
              visibilityTime: 4000,
            });
          }
        }
      }

      // 2. User's room deleted (they were in a room → now not)
      if (userLeftBreakoutRoom && isBreakoutMode) {
        const prevRoom = prevGroups.find(r => r.id === prevRoomId);
        const roomStillExists = breakout_room.some(r => r.id === prevRoomId);
        //  Case A: Room deleted
        if (!roomStillExists) {
          // Don't show toast if the user is the author
          if (srcuid !== localUid) {
            showDeduplicatedToast(`current-room-closed-${prevRoomId}`, {
              leadingIconName: 'close-room',
              type: 'error',
              text1: `Host: ${senderName} has closed "${
                prevRoom?.name || ''
              }" room.`,
              text2: 'Returning to main room...',
              visibilityTime: 3000,
            });
          }
        } else {
          // Host removed user from room (handled here)
          // (Room still exists for others, but you were unassigned)
          // Don't show toast if the user is the author
          if (srcuid !== localUid) {
            showDeduplicatedToast(`moved-to-main-${prevRoomId}`, {
              leadingIconName: 'arrow-up',
              type: 'info',
              text1: `Host: ${senderName} has moved you to main room.`,
              visibilityTime: 3000,
            });
          }
        }

        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          '[SYNC][Condition 2] User leaving breakout (to main)',
          {prevRoomId, srcuid, senderName},
        );

        // Set transition flag - user will remount in main room and need fresh data
        sessionStorage.setItem('breakout_room_transition', 'true');
        lastSyncedSnapshotRef.current = null;
        return exitRoom(true);
      }

      // 3. User moved between breakout rooms
      if (userMovedBetweenRooms) {
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          '[SYNC][Condition 3] User moved between breakout rooms',
          {prevRoomId, nextRoomId, srcuid, senderName},
        );
      }

      // 4) Rooms switch control toggled
      if (switch_room && !prevSwitchRoom) {
        if (srcuid !== localUid) {
          showDeduplicatedToast('switch-room-toggle', {
            leadingIconName: 'open-room',
            type: 'info',
            text1: `Host:${senderName} has opened breakout rooms.`,
            text2: 'Please choose a room to join.',
            visibilityTime: 3000,
          });
        }
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          '[SYNC][Condition 4] Switch room enabled',
          {srcuid, senderName},
        );
      }

      // 5) Room renamed
      prevGroups.forEach(prevRoom => {
        const after = breakout_room.find(r => r.id === prevRoom.id);
        if (after && after.name !== prevRoom.name) {
          if (srcuid !== localUid) {
            showDeduplicatedToast(`room-renamed-${after.id}`, {
              type: 'info',
              text1: `Host: ${senderName} has renamed room "${prevRoom.name}" to "${after.name}".`,
              visibilityTime: 3000,
            });
          }
          logger.log(
            LogSource.Internals,
            'BREAKOUT_ROOM',
            '[SYNC][Condition 5] Room renamed',
            {roomId: after.id, from: prevRoom.name, to: after.name},
          );
        }
      });

      // Apply new state
      dispatch({
        type: BreakoutGroupActionTypes.SYNC_STATE,
        payload: {
          sessionId: session_id,
          assignmentStrategy: assignment_type,
          switchRoom: switch_room,
          rooms: breakout_room,
        },
      });

      // Store the snap of this
      lastSyncedSnapshotRef.current = payload.data;
      lastSyncedTimestampRef.current = timestamp || Date.now();

      logger.debug(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[SYNC] State applied',
        {
          session_id,
          rooms: breakout_room?.length || 0,
          timestampApplied: lastSyncedTimestampRef.current,
        },
      );
    },
    [
      dispatch,
      exitRoom,
      localUid,
      showDeduplicatedToast,
      getDisplayName,
      isBreakoutMode,
    ],
  );

  /**
   * While Event 1 is processing…
   * Event 2 arrives (ts=200) and Event 3 arrives (ts=300).
   * Both will overwrite latestTask:
   * Now, queue.latestTask only holds event 3, because event 2 was replaced before it could be picked up.
   * Latest-event-wins queue: enqueue only the freshest by timestamp.
   */

  const enqueueBreakoutSyncEvent = useCallback(
    (payload: BreakoutRoomSyncStateEventPayload['data'], timestamp: number) => {
      const queue = breakoutSyncQueueRef.current;

      if (
        !queue.latestTask ||
        (timestamp && timestamp > queue.latestTask.timestamp)
      ) {
        queue.latestTask = {payload, timestamp};
      }

      logger.debug(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[QUEUE] Enqueued sync event',
        {
          latestTs: queue.latestTask?.timestamp,
          currentlyProcessing: queue.isProcessing,
        },
      );

      processBreakoutSyncQueue();
    },
    [],
  );

  const processBreakoutSyncQueue = useCallback(async () => {
    const queue = breakoutSyncQueueRef.current;

    // 1. If the queue is already being processed by another call, exit immediately.
    if (queue.isProcessing) {
      logger.debug(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[QUEUE] Already processing, skipping start',
      );
      return;
    }

    try {
      // 2. "lock" the queue, so no second process can start.
      queue.isProcessing = true;
      logger.debug(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[QUEUE] Processing started',
      );

      while (queue.latestTask) {
        const {payload, timestamp} = queue.latestTask;
        queue.latestTask = null;

        try {
          await _handleBreakoutRoomSyncState(payload, timestamp);
        } catch (err: any) {
          logger.error(
            LogSource.Internals,
            'BREAKOUT_ROOM',
            '[QUEUE] Error processing sync event',
            {error: err?.message},
          );
          // Continue processing other events even if one fails
        }
      }
    } catch (err: any) {
      logger.error(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[QUEUE] Critical error',
        {error: err?.message},
      );
    } finally {
      // Always unlock the queue, even if there's an error
      queue.isProcessing = false;
      logger.debug(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        '[QUEUE] Processing finished',
      );
    }
  }, []);

  // Multi-host coordination handlers
  const handleHostOperationStart = useCallback(
    (operationName: string, hostUid: UidType, hostName: string) => {
      // Only process if current user is also a host and it's not their own event
      if (hostUid === localUid) {
        return;
      }

      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        `[HOST] Another host has started operation (lock UI) -> ${operationName}`,
        {operationName, hostUid, hostName},
      );

      setCurrentOperatingHostName(hostName);
    },
    [localUid],
  );

  const handleHostOperationEnd = useCallback(
    (operationName: string, hostUid: UidType, hostName: string) => {
      // Only process if current user is also a host and it's not their own event
      if (hostUid === localUid) {
        return;
      }

      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        `[HOST] Another host ended operation (unlock UI) ${operationName}`,
        {operationName, hostUid, hostName},
      );

      setCurrentOperatingHostName(undefined);
    },
    [localUid],
  );

  // Debounced API for performance with multi-host coordination
  const debouncedUpsertAPI = useDebouncedCallback(
    async (type: 'START' | 'UPDATE', operationName?: string) => {
      setBreakoutUpdateInFlight(true);

      try {
        logger.debug(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          '[API] Debounced upsert start for',
          {type, operationName},
        );

        await upsertBreakoutRoomAPI(type);

        logger.debug(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          '[API] Debounced upsert success',
          {type, operationName},
        );

        // Broadcast operation end after successful API call
        if (operationName) {
          broadcastHostOperationEnd(operationName);
        }
      } catch (error: any) {
        logger.error(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          '[API] Debounced upsert failed',
          {error: error?.message, type, operationName},
        );

        // Broadcast operation end even on failure
        if (operationName) {
          broadcastHostOperationEnd(operationName);
        }
      } finally {
        setBreakoutUpdateInFlight(false);
      }
    },
    500,
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
      stateRef.current.canUserSwitchRoom &&
      lastAction.type === BreakoutGroupActionTypes.MOVE_PARTICIPANT_TO_GROUP;

    const shouldCallAPI =
      API_TRIGGERING_ACTIONS.includes(lastAction.type as any) &&
      (isHostRef.current || (!isHostRef.current && attendeeSelfJoinAllowed));

    // Compute lastOperationName based on lastAction
    const lastOperationName = HOST_BROADCASTED_OPERATIONS.includes(
      lastAction?.type as any,
    )
      ? lastAction?.type
      : undefined;

    logger.debug(
      LogSource.Internals,
      'BREAKOUT_ROOM',
      '[ACTION] Post-dispatch evaluation',
      {
        actionType: lastAction.type,
        shouldCallAPI,
        attendeeSelfJoinAllowed,
        lastOperationName,
      },
    );

    if (shouldCallAPI) {
      debouncedUpsertAPI('UPDATE', lastOperationName);
    }
  }, [lastAction]);

  return (
    <BreakoutRoomContext.Provider
      value={{
        mainChannelId: mainChannel,
        isBreakoutUILocked,
        breakoutSessionId: state.breakoutSessionId,
        breakoutGroups: state.breakoutGroups,
        assignmentStrategy: state.assignmentStrategy,
        handleAssignParticipants,
        manualAssignments: state.manualAssignments,
        setManualAssignments,
        clearManualAssignments,
        canUserSwitchRoom: state.canUserSwitchRoom,
        toggleRoomSwitchingAllowed,
        unassignedParticipants: state.unassignedParticipants,
        createBreakoutRoomGroup,
        checkIfBreakoutRoomSessionExistsAPI,
        upsertBreakoutRoomAPI,
        isUserInRoom,
        joinRoom,
        exitRoom,
        closeRoom,
        closeAllRooms,
        updateRoomName,
        getAllRooms,
        getRoomMemberDropdownOptions,
        handleBreakoutRoomSyncState: enqueueBreakoutSyncEvent,
        handleHostOperationStart,
        handleHostOperationEnd,
        permissions,
        isBreakoutUpdateInFlight,
        currentOperatingHostName,
        breakoutRoomVersion,
      }}>
      {children}
    </BreakoutRoomContext.Provider>
  );
};

const useBreakoutRoom = createHook(BreakoutRoomContext);

export {useBreakoutRoom, BreakoutRoomProvider};
