import React, {
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import {ContentInterface, UidType} from '../../../../agora-rn-uikit';
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
import {useDebouncedCallback} from '../../../utils/useDebouncedCallback';
import {useLocation} from '../../../components/Router';
import {useMainRoomUserDisplayName} from '../../../rtm/hooks/useMainRoomUserDisplayName';
import {
  RTMUserData,
  useRTMGlobalState,
} from '../../../rtm/RTMGlobalStateProvider';
import {useScreenshare} from '../../../subComponents/screenshare/useScreenshare';

const BREAKOUT_LOCK_TIMEOUT_MS = 5000;

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
  mainRoomRTMUsers: {[uid: number]: RTMUserData},
) => {
  return payload.map(({id, ...rest}) => {
    const group = id !== undefined ? {...rest, id} : rest;

    // Filter out offline users from participants
    const filteredGroup = {
      ...group,
      participants: {
        hosts: group.participants.hosts.filter(uid => {
          // Check defaultContent first
          let user = mainRoomRTMUsers[uid];
          if (user) {
            return !user.offline && user.type === 'rtc';
          }
        }),
        attendees: group.participants.attendees.filter(uid => {
          // Check defaultContent first
          let user = mainRoomRTMUsers[uid];
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

const validateRollbackState = (state: BreakoutRoomState): boolean => {
  return (
    Array.isArray(state.breakoutGroups) &&
    typeof state.breakoutSessionId === 'string' &&
    typeof state.canUserSwitchRoom === 'boolean' &&
    state.breakoutGroups.every(
      group =>
        typeof group.id === 'string' &&
        typeof group.name === 'string' &&
        Array.isArray(group.participants?.hosts) &&
        Array.isArray(group.participants?.attendees),
    )
  );
};

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
    BreakoutGroupActionTypes.CLOSE_GROUP, // Safe to include
    BreakoutGroupActionTypes.CLOSE_ALL_GROUPS, // Safe to include
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
  canSeeRaisedHands: boolean;
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
  canSwitchBetweenRooms: false, // Media controls
  canScreenshare: true,
  canRaiseHands: false,
  canSeeRaisedHands: false,
  // Room management (host only)
  canHostManageMainRoom: false,
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
  toggleRoomSwitchingAllowed: (value: boolean) => void;
  unassignedParticipants: {uid: UidType; user: ContentInterface}[];
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
  // Multi-host coordination handlers
  handleHostOperationStart: () => {},
  handleHostOperationEnd: () => {},
  // Provide a safe non-null default object
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
  console.log('supriya-event state', state);
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

  // Timestamp tracking for event ordering
  const lastProcessedTimestampRef = useRef(0);
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
  const {isScreenshareActive, stopScreenshare} = useScreenshare();

  const [canIPresent, setICanPresent] = useState<boolean>(false);
  const [presenters, setPresenters] = useState<
    {uid: UidType; timestamp: number}[]
  >([]);

  // Raised hands
  const [raisedHands, setRaisedHands] = useState<
    {uid: UidType; timestamp: number}[]
  >([]);

  // State version tracker to force dependent hooks to re-compute
  const [breakoutRoomVersion, setBreakoutRoomVersion] = useState(0);

  //  Refs to avoid stale closures in async callbacks
  const stateRef = useRef(state);
  const prevStateRef = useRef(state);
  const isHostRef = useRef(isHost);
  const defaultContentRef = useRef(defaultContent);
  const isMountedRef = useRef(true);
  // Concurrent action protection - track users being moved
  const usersBeingMovedRef = useRef<Set<UidType>>(new Set());
  // Enhanced dispatch that tracks user actions
  const [lastAction, setLastAction] = useState<BreakoutRoomAction | null>(null);

  const dispatch = useCallback((action: BreakoutRoomAction) => {
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
        breakoutGroups: [...stateRef.current.breakoutGroups], // Shallow copy
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
    };
  }, []);

  // Timeouts
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  // Track host operation timeout for manual clearing
  const hostOperationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const safeSetTimeout = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(() => {
      fn();
      timeoutsRef.current.delete(id); // cleanup after execution
    }, delay);

    timeoutsRef.current.add(id);
    return id;
  }, []);
  const safeClearTimeout = useCallback((id: ReturnType<typeof setTimeout>) => {
    clearTimeout(id);
    timeoutsRef.current.delete(id);
  }, []);
  // Clear all timeouts
  useEffect(() => {
    const snapshot = timeoutsRef.current;
    return () => {
      snapshot.forEach(timeoutId => clearTimeout(timeoutId));
      snapshot.clear();
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

      const hostName = defaultContentRef.current[localUid]?.name || 'Host';

      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        'Broadcasting host operation start',
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

      const hostName = defaultContentRef.current[localUid]?.name || 'Host';

      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        'Broadcasting host operation end',
        {operation: operationName, hostName, hostUid: localUid},
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
    (operationName: string, showToast = true): boolean => {
      // Check if another host is operating
      console.log('supriya-state-sync acquiring lock step 1');

      // Check if API call is in progress
      if (isBreakoutUpdateInFlight) {
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          'Operation blocked - API call in progress',
          {
            blockedOperation: operationName,
            currentlyInFlight: isBreakoutUpdateInFlight,
          },
        );

        if (showToast) {
          showDeduplicatedToast(`operation-blocked-${operationName}`, {
            type: 'info',
            text1: 'Please wait for current operation to complete',
            visibilityTime: 3000,
          });
        }
        return false;
      }

      // Broadcast that this host is starting an operation
      console.log(
        'supriya-state-sync broadcasting host operation start',
        operationName,
      );
      broadcastHostOperationStart(operationName);

      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        `Operation lock acquired for ${operationName}`,
        {operation: operationName},
      );
      return true;
    },
    [
      isBreakoutUpdateInFlight,
      showDeduplicatedToast,
      broadcastHostOperationStart,
    ],
  );

  // Individual user lock: so that same user is not moved from two different actions
  const acquireUserLock = (uid: UidType, operation: string): boolean => {
    if (usersBeingMovedRef.current.has(uid)) {
      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        'Concurrent action blocked - user already being moved',
        {
          uid,
          operation,
          currentlyBeingMoved: Array.from(usersBeingMovedRef.current),
        },
      );
      return false;
    }

    usersBeingMovedRef.current.add(uid);

    logger.log(
      LogSource.Internals,
      'BREAKOUT_ROOM',
      `User lock acquired for ${operation}`,
      {uid, operation},
    );

    // 🛡️ Auto-release lock after timeout to prevent deadlocks
    safeSetTimeout(() => {
      if (usersBeingMovedRef.current.has(uid)) {
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          'Auto-releasing user lock after timeout',
          {uid, operation, timeoutMs: BREAKOUT_LOCK_TIMEOUT_MS},
        );
        usersBeingMovedRef.current.delete(uid);
      }
    }, BREAKOUT_LOCK_TIMEOUT_MS);

    return true;
  };

  const releaseUserLock = (uid: UidType, operation: string): void => {
    const wasLocked = usersBeingMovedRef.current.has(uid);
    usersBeingMovedRef.current.delete(uid);

    if (wasLocked) {
      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        `User lock released for ${operation}`,
        {uid, operation},
      );
    }
  };

  // Update unassigned participants and remove offline users from breakout rooms
  useEffect(() => {
    if (!stateRef.current?.breakoutSessionId) {
      return;
    }

    // Get currently assigned participants from all rooms
    // Filter active UIDs to exclude:
    // 1. Custom content (not type 'rtc')
    // 2. Screenshare UIDs
    // 3. Offline users
    const filteredParticipants = activeUids
      .map(uid => ({
        uid,
        user: defaultContent[uid],
      }))
      .filter(({uid, user}) => {
        console.log('supriya-breakoutSessionId user: ', user);
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
        return true;
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
      payload: {
        unassignedParticipants: filteredParticipants,
      },
    });
  }, [defaultContent, activeUids, localUid, dispatch, state.breakoutSessionId]);

  // Increment version when breakout group assignments change
  useEffect(() => {
    setBreakoutRoomVersion(prev => prev + 1);
  }, [state.breakoutGroups]);

  // Check if there is already an active breakout session
  // We can call this to trigger sync events
  const checkIfBreakoutRoomSessionExistsAPI =
    useCallback(async (): Promise<boolean> => {
      // Skip API call if roomId is not available or if API update is in progress
      if (!joinRoomId?.host && !joinRoomId?.attendee) {
        console.log('supriya-api: Skipping GET no roomId available');
        return false;
      }

      if (isBreakoutUpdateInFlight) {
        console.log('supriya-api upsert in progress: Skipping GET');
        return false;
      }
      console.log(
        'supriya-api calling checkIfBreakoutRoomSessionExistsAPI',
        joinRoomId,
        isHostRef.current,
      );
      const startTime = Date.now();
      const requestId = getUniqueID();
      const url = `${
        $config.BACKEND_ENDPOINT
      }/v1/channel/breakout-room?passphrase=${
        isHostRef.current ? joinRoomId.host : joinRoomId.attendee
      }`;

      // Log internals for breakout room lifecycle
      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        'Checking active session',
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
        // 🛡️ Guard against component unmount after fetch
        if (!isMountedRef.current) {
          logger.log(
            LogSource.Internals,
            'BREAKOUT_ROOM',
            'Check session API cancelled - component unmounted',
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
          {
            url,
            method: 'GET',
            status: response.status,
            latency,
            requestId,
          },
        );

        if (response.status === 204) {
          logger.log(
            LogSource.Internals,
            'BREAKOUT_ROOM',
            'No active session found',
          );
          return false;
        }

        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('supriya-api-get response', data.sts, data);
        // 🛡️ Guard against component unmount after JSON parsing
        if (!isMountedRef.current) {
          logger.log(
            LogSource.Internals,
            'BREAKOUT_ROOM',
            'Session sync cancelled - component unmounted after parsing',
            {requestId},
          );
          return false;
        }

        if (data?.session_id) {
          logger.log(
            LogSource.Internals,
            'BREAKOUT_ROOM',
            'Session synced successfully',
            {
              sessionId: data.session_id,
              roomCount: data?.breakout_room?.length || 0,
              assignmentType: data?.assignment_type,
              switchRoom: data?.switch_room,
            },
          );

          // Skip events older than the last processed timestamp
          if (data?.sts && data?.sts <= lastProcessedTimestampRef.current) {
            console.log(
              'supriya-api-get skipping dispatch as out of date/order ',
              {
                timestamp: data?.sts,
                lastProcessed: lastProcessedTimestampRef.current,
              },
            );
            return;
          }
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
          lastProcessedTimestampRef.current = data.sts || Date.now();

          return true;
        }

        return false;
      } catch (error) {
        const latency = Date.now() - startTime;
        logger.log(LogSource.NetworkRest, 'breakout-room', 'API call failed', {
          url,
          method: 'GET',
          error: error.message,
          latency,
          requestId,
        });
        return false;
      }
    }, [isBreakoutUpdateInFlight, dispatch, joinRoomId, store.token]);

  useEffect(() => {
    const loadInitialData = async () => {
      await checkIfBreakoutRoomSessionExistsAPI();
    };
    const timeoutId = setTimeout(() => {
      loadInitialData();
    }, 1200);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

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

      // Log internals for lifecycle
      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        `Upsert API called - ${type}`,
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
              ? getSanitizedPayload(initialBreakoutGroups, mainRoomRTMUsers)
              : getSanitizedPayload(
                  stateRef.current.breakoutGroups,
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

        // Guard against component unmount after fetch
        if (!isMountedRef.current) {
          logger.log(
            LogSource.Internals,
            'BREAKOUT_ROOM',
            'Upsert API cancelled - component unmounted after fetch',
            {type, requestId},
          );
          return;
        }

        const endRequestTs = Date.now();
        const latency = endRequestTs - startReqTs;

        // Log network request
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

          // 🛡️ Guard against component unmount after error text parsing
          if (!isMountedRef.current) {
            logger.log(
              LogSource.Internals,
              'BREAKOUT_ROOM',
              'Error text parsing cancelled - component unmounted',
              {type, status: response.status, requestId},
            );
            return;
          }

          throw new Error(`Breakout room creation failed: ${msg}`);
        } else {
          const data = await response.json();
          console.log('supriya-api-upsert response', data.sts, data);

          // 🛡️ Guard against component unmount after JSON parsing
          if (!isMountedRef.current) {
            logger.log(
              LogSource.Internals,
              'BREAKOUT_ROOM',
              'Upsert API success cancelled - component unmounted after parsing',
              {type, requestId},
            );
            return;
          }

          logger.log(
            LogSource.Internals,
            'BREAKOUT_ROOM',
            `Upsert API success - ${type}`,
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
      } catch (err) {
        const latency = Date.now() - startReqTs;
        const maxRetries = 3;
        const isRetriableError =
          err.name === 'TypeError' || // Network errors
          err.message.includes('fetch') ||
          err.message.includes('timeout') ||
          err.response?.status >= 500; // Server errors

        logger.log(
          LogSource.NetworkRest,
          'breakout-room',
          'Upsert API failed',
          {
            url,
            method: 'POST',
            error: err.message,
            latency,
            requestId,
            type,
            retryCount,
            isRetriableError,
            willRetry: retryCount < maxRetries && isRetriableError,
          },
        );

        // 🛡️ Retry logic for network/server errors
        if (retryCount < maxRetries && isRetriableError) {
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Exponential backoff, max 5s

          logger.log(
            LogSource.Internals,
            'BREAKOUT_ROOM',
            `Retrying upsert API in ${retryDelay}ms`,
            {retryCount: retryCount + 1, maxRetries, type},
          );

          // Don't clear polling/selfJoinRoomId on retry
          safeSetTimeout(() => {
            // 🛡️ Guard against component unmount during retry delay
            if (!isMountedRef.current) {
              logger.log(
                LogSource.Internals,
                'BREAKOUT_ROOM',
                'API retry cancelled - component unmounted',
                {type, retryCount: retryCount + 1},
              );
              return;
            }
            console.log('supriya-state-sync calling upsertBreakoutRoomAPI 941');
            upsertBreakoutRoomAPI(type, retryCount + 1);
          }, retryDelay);
          return; // Don't execute finally block on retry
        }

        // 🛡️ Only clear state if we're not retrying
        setSelfJoinRoomId(null);
      } finally {
        // 🛡️ Only clear state on successful completion (not on retry)
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

  const toggleRoomSwitchingAllowed = (value: boolean) => {
    console.log(
      'supriya-state-sync toggleRoomSwitchingAllowed value is',
      value,
    );
    if (!acquireOperationLock('SET_ALLOW_PEOPLE_TO_SWITCH_ROOM')) {
      console.log('supriya-state-sync lock acquired');
      return;
    }

    logger.log(
      LogSource.Internals,
      'BREAKOUT_ROOM',
      'Switch rooms permission changed',
      {
        previousValue: stateRef.current.canUserSwitchRoom,
        newValue: value,
        isHost: isHostRef.current,
        roomCount: stateRef.current.breakoutGroups.length,
      },
    );
    console.log(
      'supriya-state-sync dispatching SET_ALLOW_PEOPLE_TO_SWITCH_ROOM',
    );

    dispatch({
      type: BreakoutGroupActionTypes.SET_ALLOW_PEOPLE_TO_SWITCH_ROOM,
      payload: {
        canUserSwitchRoom: value,
      },
    });
  };

  const createBreakoutRoomGroup = () => {
    if (!acquireOperationLock('CREATE_GROUP')) return;

    logger.log(
      LogSource.Internals,
      'BREAKOUT_ROOM',
      'Creating new breakout room',
      {
        currentRoomCount: stateRef.current.breakoutGroups.length,
        isHost: isHostRef.current,
        sessionId: stateRef.current.breakoutSessionId,
      },
    );

    dispatch({
      type: BreakoutGroupActionTypes.CREATE_GROUP,
    });
  };

  const handleAssignParticipants = (strategy: RoomAssignmentStrategy) => {
    if (stateRef.current.breakoutGroups.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'No breakout rooms found.',
        visibilityTime: 3000,
      });
      return;
    }
    if (!acquireOperationLock(`ASSIGN_${strategy}`)) {
      return;
    }

    logger.log(LogSource.Internals, 'BREAKOUT_ROOM', 'Assigning participants', {
      strategy,
      unassignedCount: stateRef.current.unassignedParticipants.length,
      roomCount: stateRef.current.breakoutGroups.length,
      isHost: isHostRef.current,
    });

    if (strategy === RoomAssignmentStrategy.AUTO_ASSIGN) {
      dispatch({
        type: BreakoutGroupActionTypes.AUTO_ASSIGN_PARTICPANTS,
        payload: {
          localUid,
        },
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
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          'Move to main room failed - no user provided',
        );
        return;
      }

      // 🛡️ Check for API operation conflicts first
      if (!acquireOperationLock('MOVE_PARTICIPANT_TO_MAIN', false)) {
        return;
      }

      const operation = 'moveToMain';

      // 🛡️ Check if user is already being moved by another action
      if (!acquireUserLock(user.uid, operation)) {
        return; // Action blocked due to concurrent operation
      }

      // 🛡️ Use fresh state to avoid race conditions
      const currentState = stateRef.current;
      const currentGroup = currentState.breakoutGroups.find(
        group =>
          group.participants.hosts.includes(user.uid) ||
          group.participants.attendees.includes(user.uid),
      );

      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        'Moving user to main room',
        {
          userId: user.uid,
          userName: user.name,
          fromGroupId: currentGroup?.id,
          fromGroupName: currentGroup?.name,
        },
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

      // 🛡️ Release lock after successful dispatch
      releaseUserLock(user.uid, operation);
    } catch (error) {
      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        'Error moving user to main room',
        {
          userId: user.uid,
          userName: user.name,
          error: error.message,
        },
      );
      // 🛡️ Always release lock on error
      releaseUserLock(user.uid, 'moveToMain');
    }
  };

  const moveUserIntoGroup = (user: ContentInterface, toGroupId: string) => {
    try {
      if (!user) {
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          'Move to group failed - no user provided',
          {toGroupId},
        );
        return;
      }

      // 🛡️ Check for API operation conflicts first
      if (!acquireOperationLock('MOVE_PARTICIPANT_TO_GROUP', false)) {
        return;
      }

      const operation = `moveToGroup-${toGroupId}`;

      // 🛡️ Check if user is already being moved by another action
      if (!acquireUserLock(user.uid, operation)) {
        return; // Action blocked due to concurrent operation
      }

      // 🛡️ Use fresh state to avoid race conditions
      const currentState = stateRef.current;
      const currentGroup = currentState.breakoutGroups.find(
        group =>
          group.participants.hosts.includes(user.uid) ||
          group.participants.attendees.includes(user.uid),
      );
      const targetGroup = currentState.breakoutGroups.find(
        group => group.id === toGroupId,
      );

      if (!targetGroup) {
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          'Target group not found',
          {
            userId: user.uid,
            userName: user.name,
            toGroupId,
          },
        );
        // 🛡️ Release lock if target group not found
        releaseUserLock(user.uid, operation);
        return;
      }

      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        'Moving user between groups',
        {
          userId: user.uid,
          userName: user.name,
          fromGroupId: currentGroup?.id,
          fromGroupName: currentGroup?.name,
          toGroupId,
          toGroupName: targetGroup.name,
        },
      );

      dispatch({
        type: BreakoutGroupActionTypes.MOVE_PARTICIPANT_TO_GROUP,
        payload: {
          user,
          fromGroupId: currentGroup?.id,
          toGroupId,
        },
      });

      // 🛡️ Release lock after successful dispatch
      releaseUserLock(user.uid, operation);
    } catch (error) {
      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        'Error moving user to breakout room',
        {
          userId: user.uid,
          userName: user.name,
          toGroupId,
          error: error.message,
        },
      );
      // 🛡️ Always release lock on error
      releaseUserLock(user.uid, `moveToGroup-${toGroupId}`);
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
        return stateRef.current.breakoutGroups.some(
          group =>
            group.participants.hosts.includes(localUid) ||
            group.participants.attendees.includes(localUid),
        );
      }
    },
    [localUid, breakoutRoomVersion],
  );

  const getCurrentRoom = useCallback((): BreakoutGroup | null => {
    const userRoom = stateRef.current.breakoutGroups.find(
      group =>
        group.participants.hosts.includes(localUid) ||
        group.participants.attendees.includes(localUid),
    );
    return userRoom ?? null;
  }, [localUid, breakoutRoomVersion]);

  // Permissions
  useEffect(() => {
    const current = stateRef.current;

    const currentlyInRoom = isUserInRoom();
    const hasAvailableRooms = current.breakoutGroups.length > 0;
    const allowAttendeeSwitch = current.canUserSwitchRoom;

    const nextPermissions: BreakoutRoomPermissions = {
      canJoinRoom:
        hasAvailableRooms && (isHostRef.current || allowAttendeeSwitch),
      canExitRoom: isBreakoutMode && currentlyInRoom,
      canSwitchBetweenRooms:
        currentlyInRoom &&
        hasAvailableRooms &&
        (isHostRef.current || allowAttendeeSwitch),
      canScreenshare: isHostRef.current
        ? true
        : currentlyInRoom
        ? canIPresent
        : true,
      canRaiseHands:
        !isHostRef.current && !!current.breakoutSessionId && currentlyInRoom,
      canSeeRaisedHands: true,
      canAssignParticipants: isHostRef.current && !currentlyInRoom,
      canHostManageMainRoom: isHostRef.current,
      canCreateRooms: isHostRef.current,
      canMoveUsers: isHostRef.current,
      canCloseRooms:
        isHostRef.current && hasAvailableRooms && !!current.breakoutSessionId,
      canMakePresenter: isHostRef.current,
    };

    setPermissions(nextPermissions);
  }, [breakoutRoomVersion, canIPresent, isBreakoutMode]);

  const joinRoom = (
    toRoomId: string,
    permissionAtCallTime = permissions.canJoinRoom,
  ) => {
    // 🛡️ Use permission passed at call time to avoid race conditions
    if (!permissionAtCallTime) {
      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        'Join room blocked - no permission at call time',
        {
          toRoomId,
          permissionAtCallTime,
          currentPermission: permissions.canJoinRoom,
        },
      );
      return;
    }
    const user = defaultContentRef.current[localUid];
    if (!user) {
      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        'Join room failed - user not found',
        {localUid, toRoomId},
      );
      return;
    }

    logger.log(LogSource.Internals, 'BREAKOUT_ROOM', 'User joining room', {
      userId: localUid,
      userName: user.name,
      toRoomId,
      toRoomName: stateRef.current.breakoutGroups.find(r => r.id === toRoomId)
        ?.name,
    });

    moveUserIntoGroup(user, toRoomId);
    if (!isHostRef.current) {
      setSelfJoinRoomId(toRoomId);
    }
  };

  const exitRoom = useCallback(
    async (permissionAtCallTime = permissions.canExitRoom) => {
      // 🛡️ Use permission passed at call time to avoid race conditions
      if (!permissionAtCallTime) {
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          'Exit room blocked - no permission at call time',
          {
            permissionAtCallTime,
            currentPermission: permissions.canExitRoom,
          },
        );
        return;
      }

      const localUser = defaultContentRef.current[localUid];

      try {
        if (localUser) {
          // Use breakout-specific exit (doesn't destroy main RTM)
          await breakoutRoomExit();

          // 🛡️ Guard against component unmount
          if (!isMountedRef.current) {
            logger.log(
              LogSource.Internals,
              'BREAKOUT_ROOM',
              'Exit room cancelled - component unmounted',
              {userId: localUid},
            );
            return;
          }
        }
      } catch (error) {
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          'Exit room error - fallback dispatch',
          {
            userId: localUid,
            error: error.message,
          },
        );
      }
    },
    [
      localUid,
      permissions.canExitRoom, // TODO:SUP move to the method call
      breakoutRoomExit,
    ],
  );

  const closeRoom = (roomIdToClose: string) => {
    if (!acquireOperationLock('CLOSE_GROUP')) {
      return;
    }

    const roomToClose = stateRef.current.breakoutGroups.find(
      r => r.id === roomIdToClose,
    );

    logger.log(LogSource.Internals, 'BREAKOUT_ROOM', 'Closing breakout room', {
      roomId: roomIdToClose,
      roomName: roomToClose?.name,
      participantCount:
        (roomToClose?.participants.hosts.length || 0) +
        (roomToClose?.participants.attendees.length || 0),
      isHost: isHostRef.current,
    });

    dispatch({
      type: BreakoutGroupActionTypes.CLOSE_GROUP,
      payload: {groupId: roomIdToClose},
    });
  };

  const closeAllRooms = () => {
    if (!acquireOperationLock('CLOSE_ALL_GROUPS')) return;

    logger.log(
      LogSource.Internals,
      'BREAKOUT_ROOM',
      'Closing all breakout rooms',
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

    dispatch({type: BreakoutGroupActionTypes.CLOSE_ALL_GROUPS});
  };

  const sendAnnouncement = (announcement: string) => {
    logger.log(
      LogSource.Internals,
      'BREAKOUT_ROOM',
      'Sending announcement to all rooms',
      {
        announcementLength: announcement.length,
        roomCount: stateRef.current.breakoutGroups.length,
        senderUserId: localUid,
        senderUserName: defaultContentRef.current[localUid]?.name,
        isHost: isHostRef.current,
      },
    );

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
    if (!acquireOperationLock('RENAME_GROUP')) return;

    const roomToRename = stateRef.current.breakoutGroups.find(
      r => r.id === roomIdToEdit,
    );

    logger.log(LogSource.Internals, 'BREAKOUT_ROOM', 'Renaming breakout room', {
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
    logger.log(
      LogSource.Internals,
      'BREAKOUT_ROOM',
      `Make presenter - ${action}`,
      {
        targetUserId: user.uid,
        targetUserName: user.name,
        action,
        isHost: isHostRef.current,
      },
    );

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
      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        'Error making user presenter',
        {
          targetUserId: user.uid,
          targetUserName: user.name,
          action,
          error: error.message,
        },
      );
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

  const onMakeMePresenter = useCallback((action: 'start' | 'stop') => {
    logger.log(
      LogSource.Internals,
      'BREAKOUT_ROOM',
      `User became presenter - ${action}`,
    );

    if (action === 'start') {
      setICanPresent(true);
      // Show toast notification when presenter permission is granted
      Toast.show({
        type: 'success',
        text1: 'You can now present in this breakout room',
        visibilityTime: 3000,
      });
    } else if (action === 'stop') {
      if (isScreenshareActive) {
        stopScreenshare();
      }
      setICanPresent(false);
      // Show toast notification when presenter permission is removed
      Toast.show({
        type: 'info',
        text1: 'Your presenter access has been removed',
        visibilityTime: 3000,
      });
    }
  }, []);

  const clearAllPresenters = useCallback(() => {
    setPresenters([]);
  }, []);

  const getRoomMemberDropdownOptions = useCallback(
    (memberUid: UidType) => {
      const options: MemberDropdownOption[] = [];
      // Find which room the user is currently in

      const memberUser = defaultContentRef.current[memberUid];
      if (!memberUser) {
        return options;
      }

      const currentRoom = stateRef.current.breakoutGroups.find(
        group =>
          group.participants.hosts.includes(memberUid) ||
          group.participants.attendees.includes(memberUid),
      );
      console.log(
        'supriya-currentRoom',
        currentRoom,
        memberUid,
        JSON.stringify(stateRef.current.breakoutGroups),
      );
      // Move to Main Room option
      options.push({
        icon: 'double-up-arrow',
        type: 'move-to-main',
        title: 'Move to Main Room',
        onOptionPress: () => moveUserToMainRoom(memberUser),
      });
      // Move to other breakout rooms (exclude current room)
      stateRef.current.breakoutGroups
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

      // Make presenter option is available only for host
      // and if the incoming member is also a host we dont
      // need to show this option as they can already present
      console.log('supriya-dropdown optopn', defaultContentRef[memberUid]);
      if (defaultContentRef.current[memberUid]?.isHost === 'true') {
        return options;
      }
      if (isHostRef.current) {
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
    },
    [isUserPresenting, isHostRef.current, presenters, breakoutRoomVersion],
  );

  // Raise Hand
  // Send raise hand event via RTM
  const sendRaiseHandEvent = useCallback(
    (action: 'raise' | 'lower') => {
      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        `Send raise hand event - ${action}`,
        {action, userId: localUid},
      );

      const payload = {action, uid: localUid, timestamp: Date.now()};
      events.send(
        BreakoutRoomEventNames.BREAKOUT_ROOM_ATTENDEE_RAISE_HAND,
        JSON.stringify(payload),
      );
    },
    [localUid],
  );

  // Raised hand management functions
  const addRaisedHand = useCallback((uid: UidType) => {
    setRaisedHands(prev => {
      // Check if already raised to avoid duplicates
      const exists = prev.find(hand => hand.uid === uid);
      if (exists) {
        return prev;
      }
      return [...prev, {uid, timestamp: Date.now()}];
    });
    if (isHostRef.current) {
      const userName = defaultContentRef.current[uid]?.name || `User ${uid}`;
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
  }, []);

  const removeRaisedHand = useCallback((uid: UidType) => {
    if (uid) {
      setRaisedHands(prev => prev.filter(hand => hand.uid !== uid));
    }
    if (isHostRef.current) {
      const userName = defaultContentRef.current[uid]?.name || `User ${uid}`;
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
  }, []);

  const clearAllRaisedHands = useCallback(() => {
    setRaisedHands([]);
  }, []);

  // Handle incoming raise hand events (only host sees notifications)
  const onRaiseHand = useCallback(
    (action: 'raise' | 'lower', uid: UidType) => {
      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        `Received raise hand event - ${action}`,
      );

      try {
        if (action === 'raise') {
          addRaisedHand(uid);
        } else if (action === 'lower') {
          removeRaisedHand(uid);
        }
      } catch (error) {
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          'Error handling raise hand event',
          {action, fromUserId: uid, error: error.message},
        );
      }
    },
    [addRaisedHand, removeRaisedHand],
  );

  // const handleBreakoutRoomSyncState = useCallback(
  //   (payload: BreakoutRoomSyncStateEventPayload['data'], timestamp) => {
  //     console.log(
  //       'supriya-api-sync response',
  //       timestamp,
  //       JSON.stringify(payload),
  //     );

  //     // Skip events older than the last processed timestamp
  //     if (timestamp && timestamp <= lastProcessedTimestampRef.current) {
  //       console.log('supriya-api-sync Skipping old breakout room sync event', {
  //         timestamp,
  //         lastProcessed: lastProcessedTimestampRef.current,
  //       });
  //       return;
  //     }

  //     const {srcuid, data} = payload;
  //     console.log('supriya-event flow step 2', srcuid);
  //     console.log('supriya-event uids', srcuid, localUid);

  //     // if (srcuid === localUid) {
  //     //   console.log('supriya-event flow skipping');

  //     //   return;
  //     // }
  //     const {session_id, switch_room, breakout_room, assignment_type} = data;
  //     console.log('supriya-event-sync new data: ', data);
  //     console.log('supriya-event-sync old data: ', stateRef.current);

  //     logger.log(
  //       LogSource.Internals,
  //       'BREAKOUT_ROOM',
  //       'Sync state event received',
  //       {
  //         sessionId: session_id,
  //         incomingRoomCount: breakout_room?.length || 0,
  //         currentRoomCount: stateRef.current.breakoutGroups.length,
  //         switchRoom: switch_room,
  //         assignmentType: assignment_type,
  //       },
  //     );

  //     if (isAnotherHostOperating) {
  //       setIsAnotherHostOperating(false);
  //       setCurrentOperatingHostName(undefined);
  //     }
  //     // 🛡️ BEFORE snapshot - using stateRef to avoid stale closure
  //     const prevGroups = stateRef.current.breakoutGroups;
  //     console.log('supriya-event-sync prevGroups: ', prevGroups);
  //     const prevSwitchRoom = stateRef.current.canUserSwitchRoom;

  //     // Helpers to find membership
  //     const findUserRoomId = (uid: UidType, groups: BreakoutGroup[] = []) =>
  //       groups.find(g => {
  //         const hosts = Array.isArray(g?.participants?.hosts)
  //           ? g.participants.hosts
  //           : [];
  //         const attendees = Array.isArray(g?.participants?.attendees)
  //           ? g.participants.attendees
  //           : [];
  //         return hosts.includes(uid) || attendees.includes(uid);
  //       })?.id ?? null;

  //     const prevRoomId = findUserRoomId(localUid, prevGroups);
  //     const nextRoomId = findUserRoomId(localUid, breakout_room);

  //     console.log(
  //       'supriya-event-sync prevRoomId and nextRoomId: ',
  //       prevRoomId,
  //       nextRoomId,
  //     );

  //     console.log('supriya-event-sync 1: ');
  //     // Show notifications based on changes
  //     // 1. Switch room enabled notification
  //     const senderName = getDisplayName(srcuid);
  //     if (switch_room && !prevSwitchRoom) {
  //       console.log('supriya-toast 1');
  //       showDeduplicatedToast('switch-room-toggle', {
  //         leadingIconName: 'open-room',
  //         type: 'info',
  //         text1: `Host:${senderName} has opened breakout rooms.`,
  //         text2: 'Please choose a room to join.',
  //         visibilityTime: 3000,
  //       });
  //     }
  //     console.log('supriya-event-sync 2: ');

  //     // 2. User joined a room (compare previous and current state)
  //     // The notification for this comes from the main room channel_join event
  //     if (prevRoomId === nextRoomId) {
  //       // No logic
  //     }

  //     console.log('supriya-event-sync 3: ');

  //     // 3. User was moved to main room
  //     if (prevRoomId && !nextRoomId) {
  //       const prevRoom = prevGroups.find(r => r.id === prevRoomId);
  //       // Distinguish "room closed" vs "moved to main"
  //       const roomStillExists = breakout_room.some(r => r.id === prevRoomId);

  //       if (!roomStillExists) {
  //         showDeduplicatedToast(`current-room-closed-${prevRoomId}`, {
  //           leadingIconName: 'close-room',
  //           type: 'error',
  //           text1: `Host: ${senderName} has closed "${
  //             prevRoom?.name || ''
  //           }" room. `,
  //           text2: 'Returning to main room...',
  //           visibilityTime: 3000,
  //         });
  //       } else {
  //         showDeduplicatedToast(`moved-to-main-${prevRoomId}`, {
  //           leadingIconName: 'arrow-up',
  //           type: 'info',
  //           text1: `Host: ${senderName} has moved you to main room.`,
  //           visibilityTime: 3000,
  //         });
  //       }
  //       // Exit breakout room and return to main room
  //       return exitRoom(true);
  //     }

  //     console.log('supriya-event-sync 5: ');

  //     // 5. All breakout rooms closed
  //     if (breakout_room.length === 0 && prevGroups.length > 0) {
  //       console.log('supriya-toast 5', prevRoomId, nextRoomId);

  //       // Show different messages based on user's current location
  //       if (prevRoomId) {
  //         // User was in a breakout room - returning to main
  //         showDeduplicatedToast('all-rooms-closed', {
  //           leadingIconName: 'close-room',
  //           type: 'info',
  //           text1: `Host: ${senderName} has closed all breakout rooms.`,
  //           text2: 'Returning to the main room...',
  //           visibilityTime: 3000,
  //         });
  //         return exitRoom(true);
  //       } else {
  //         // User was already in main room - just notify about closure
  //         showDeduplicatedToast('all-rooms-closed', {
  //           leadingIconName: 'close-room',
  //           type: 'info',
  //           text1: `Host: ${senderName} has closed all breakout rooms`,
  //           visibilityTime: 4000,
  //         });
  //       }
  //     }

  //     console.log('supriya-event-sync 6: ');

  //     // 6) Room renamed (compare per-room names)
  //     prevGroups.forEach(prevRoom => {
  //       const after = breakout_room.find(r => r.id === prevRoom.id);
  //       if (after && after.name !== prevRoom.name) {
  //         showDeduplicatedToast(`room-renamed-${after.id}`, {
  //           type: 'info',
  //           text1: `Host: ${senderName} has renamed room "${prevRoom.name}"  to "${after.name}".`,
  //           visibilityTime: 3000,
  //         });
  //       }
  //     });

  //     console.log('supriya-event-sync 7: ');

  //     // The host clicked on the room to close in which he is a part of
  //     if (!prevRoomId && !nextRoomId) {
  //       return exitRoom(true);
  //     }
  //     // Finally, apply the authoritative state
  //     dispatch({
  //       type: BreakoutGroupActionTypes.SYNC_STATE,
  //       payload: {
  //         sessionId: session_id,
  //         assignmentStrategy: assignment_type,
  //         switchRoom: switch_room,
  //         rooms: breakout_room,
  //       },
  //     });
  //     // Update the last processed timestamp after successful processing
  //     lastProcessedTimestampRef.current = timestamp || Date.now();
  //   },
  //   [
  //     dispatch,
  //     exitRoom,
  //     localUid,
  //     showDeduplicatedToast,
  //     isAnotherHostOperating,
  //     getDisplayName,
  //   ],
  // );

  // Multi-host coordination handlers
  const handleHostOperationStart = useCallback(
    (operationName: string, hostUid: UidType, hostName: string) => {
      // Only process if current user is also a host and it's not their own event
      console.log('supriya-state-sync host operation started', operationName);
      if (!isHostRef.current || hostUid === localUid) {
        return;
      }

      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        'Another host started operation - locking UI',
        {operationName, hostUid, hostName},
      );

      // Show toast notification
      showDeduplicatedToast(`host-operation-start-${hostUid}`, {
        type: 'info',
        text1: `${hostName} is managing breakout rooms`,
        text2: 'Please wait for them to finish',
        visibilityTime: 5000,
      });
      setCurrentOperatingHostName(hostName);
    },
    [localUid, showDeduplicatedToast],
  );

  const handleHostOperationEnd = useCallback(
    (operationName: string, hostUid: UidType, hostName: string) => {
      // Only process if current user is also a host and it's not their own event
      console.log('supriya-state-sync host operation ended', operationName);

      if (!isHostRef.current || hostUid === localUid) {
        return;
      }

      setCurrentOperatingHostName(undefined);
    },
    [localUid],
  );

  // Debounced API for performance with multi-host coordination
  const debouncedUpsertAPI = useDebouncedCallback(
    async (type: 'START' | 'UPDATE', operationName?: string) => {
      setBreakoutUpdateInFlight(true);

      try {
        console.log(
          'supriya-state-sync before calling upsertBreakoutRoomAPI 2007',
        );

        await upsertBreakoutRoomAPI(type);
        console.log(
          'supriya-state-sync after calling upsertBreakoutRoomAPI 2007',
        );
        console.log('supriya-state-sync operationName', operationName);

        // Broadcast operation end after successful API call
        if (operationName) {
          console.log(
            'supriya-state-sync broadcasting host operation end',
            operationName,
          );

          broadcastHostOperationEnd(operationName);
        }
      } catch (error) {
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          'API call failed. Reverting to previous state.',
          error,
        );

        // Broadcast operation end even on failure
        if (operationName) {
          broadcastHostOperationEnd(operationName);
        }

        // 🔁 Rollback to last valid state
        if (
          prevStateRef.current &&
          validateRollbackState(prevStateRef.current)
        ) {
          baseDispatch({
            type: BreakoutGroupActionTypes.SYNC_STATE,
            payload: {
              sessionId: prevStateRef.current.breakoutSessionId,
              assignmentStrategy: prevStateRef.current.assignmentStrategy,
              switchRoom: prevStateRef.current.canUserSwitchRoom,
              rooms: prevStateRef.current.breakoutGroups,
            },
          });
          showDeduplicatedToast('breakout-api-failure', {
            type: 'error',
            text1: 'Sync failed. Reverted to previous state.',
          });
        } else {
          showDeduplicatedToast('breakout-api-failure-no-rollback', {
            type: 'error',
            text1: 'Sync failed. Could not rollback safely.',
          });
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

    console.log(
      'supriya-state-sync shouldCallAPI',
      shouldCallAPI,
      lastAction.type,
      lastOperationName,
    );
    if (shouldCallAPI) {
      debouncedUpsertAPI('UPDATE', lastOperationName);
    }
  }, [lastAction]);

  // Queue
  const _handleBreakoutRoomSyncState = useCallback(
    async (
      payload: BreakoutRoomSyncStateEventPayload['data'],
      timestamp: number,
    ) => {
      console.log(
        'supriya-api-sync response',
        timestamp,
        JSON.stringify(payload),
      );

      // Skip events older than the last processed timestamp
      if (timestamp && timestamp <= lastProcessedTimestampRef.current) {
        console.log('supriya-api-sync Skipping old breakout room sync event', {
          timestamp,
          lastProcessed: lastProcessedTimestampRef.current,
        });
        return;
      }

      const {srcuid, data} = payload;
      const {session_id, switch_room, breakout_room, assignment_type} = data;

      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        'Sync state event received',
        {
          sessionId: session_id,
          incomingRoomCount: breakout_room?.length || 0,
          currentRoomCount: stateRef.current.breakoutGroups.length,
          switchRoom: switch_room,
          assignmentType: assignment_type,
        },
      );

      // Snapshot before applying
      const prevGroups = stateRef.current.breakoutGroups;
      const prevSwitchRoom = stateRef.current.canUserSwitchRoom;

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

      const prevRoomId = findUserRoomId(localUid, prevGroups);
      const nextRoomId = findUserRoomId(localUid, breakout_room);

      const senderName = getDisplayName(srcuid);

      // 🟢 Toast logic
      if (switch_room && !prevSwitchRoom) {
        showDeduplicatedToast('switch-room-toggle', {
          leadingIconName: 'open-room',
          type: 'info',
          text1: `Host:${senderName} has opened breakout rooms.`,
          text2: 'Please choose a room to join.',
          visibilityTime: 3000,
        });
      }

      if (prevRoomId && !nextRoomId) {
        const prevRoom = prevGroups.find(r => r.id === prevRoomId);
        const roomStillExists = breakout_room.some(r => r.id === prevRoomId);

        if (!roomStillExists) {
          showDeduplicatedToast(`current-room-closed-${prevRoomId}`, {
            leadingIconName: 'close-room',
            type: 'error',
            text1: `Host: ${senderName} has closed "${
              prevRoom?.name || ''
            }" room.`,
            text2: 'Returning to main room...',
            visibilityTime: 3000,
          });
        } else {
          showDeduplicatedToast(`moved-to-main-${prevRoomId}`, {
            leadingIconName: 'arrow-up',
            type: 'info',
            text1: `Host: ${senderName} has moved you to main room.`,
            visibilityTime: 3000,
          });
        }
        return exitRoom(true);
      }

      if (breakout_room.length === 0 && prevGroups.length > 0) {
        if (prevRoomId) {
          showDeduplicatedToast('all-rooms-closed', {
            leadingIconName: 'close-room',
            type: 'info',
            text1: `Host: ${senderName} has closed all breakout rooms.`,
            text2: 'Returning to the main room...',
            visibilityTime: 3000,
          });
          return exitRoom(true);
        } else {
          showDeduplicatedToast('all-rooms-closed', {
            leadingIconName: 'close-room',
            type: 'info',
            text1: `Host: ${senderName} has closed all breakout rooms`,
            visibilityTime: 4000,
          });
        }
      }

      prevGroups.forEach(prevRoom => {
        const after = breakout_room.find(r => r.id === prevRoom.id);
        if (after && after.name !== prevRoom.name) {
          showDeduplicatedToast(`room-renamed-${after.id}`, {
            type: 'info',
            text1: `Host: ${senderName} has renamed room "${prevRoom.name}" to "${after.name}".`,
            visibilityTime: 3000,
          });
        }
      });

      if (!prevRoomId && !nextRoomId) {
        return exitRoom(true);
      }

      dispatch({
        type: BreakoutGroupActionTypes.SYNC_STATE,
        payload: {
          sessionId: session_id,
          assignmentStrategy: assignment_type,
          switchRoom: switch_room,
          rooms: breakout_room,
        },
      });

      lastProcessedTimestampRef.current = timestamp || Date.now();
    },
    [dispatch, exitRoom, localUid, showDeduplicatedToast, getDisplayName],
  );

  /**
   * While Event 1 is processing…
   * Event 2 arrives (ts=200) and Event 3 arrives (ts=300).
   * Both will overwrite latestTask:
   * Now, queue.latestTask only holds event 3, because event 2 was replaced before it could be picked up.
   */

  const enqueueBreakoutSyncEvent = useCallback(
    (payload: BreakoutRoomSyncStateEventPayload['data'], timestamp: number) => {
      const queue = breakoutSyncQueueRef.current;

      // Always keep the freshest event only
      if (
        !queue.latestTask ||
        (timestamp && timestamp > queue.latestTask.timestamp)
      ) {
        queue.latestTask = {payload, timestamp};
      }

      processBreakoutSyncQueue();
    },
    [],
  );

  const processBreakoutSyncQueue = useCallback(async () => {
    const queue = breakoutSyncQueueRef.current;
    // 1. If the queue is already being processed by another call, exit immediately.
    if (queue.isProcessing) {
      return;
    }

    try {
      // 2. "lock" the queue, so no second process can start.
      queue.isProcessing = true;

      // 3. Loop the queue
      while (queue.latestTask) {
        const {payload, timestamp} = queue.latestTask;
        queue.latestTask = null;

        try {
          // Reuse your existing sync logic
          await _handleBreakoutRoomSyncState(payload, timestamp);
        } catch (err) {
          console.error('[BreakoutSync] Error processing sync event', err);
          // Continue processing other events even if one fails
        }
      }
    } catch (err) {
      console.error('[BreakoutSync] Critical error in queue processing', err);
    } finally {
      // Always unlock the queue, even if there's an error
      queue.isProcessing = false;
    }
  }, []);

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
        handleBreakoutRoomSyncState: enqueueBreakoutSyncEvent,
        // Multi-host coordination handlers
        handleHostOperationStart,
        handleHostOperationEnd,
        permissions,
        // Loading states
        isBreakoutUpdateInFlight,
        // Multi-host coordination
        currentOperatingHostName,
        // State version for forcing re-computation in dependent hooks
        breakoutRoomVersion,
      }}>
      {children}
    </BreakoutRoomContext.Provider>
  );
};

const useBreakoutRoom = createHook(BreakoutRoomContext);

export {useBreakoutRoom, BreakoutRoomProvider};
