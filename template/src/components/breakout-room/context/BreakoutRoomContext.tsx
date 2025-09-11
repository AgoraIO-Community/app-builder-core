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

const BREAKOUT_LOCK_TIMEOUT_MS = 5000;
const HOST_OPERATION_LOCK_TIMEOUT_MS = 10000; // Emergency timeout for network failures only

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

const getSanitizedPayload = (payload: BreakoutGroup[]) => {
  return payload.map(({id, ...rest}) => {
    if (typeof id === 'string' && id.startsWith('temp')) {
      return rest;
    }
    return id !== undefined ? {...rest, id} : rest;
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
    data: BreakoutRoomSyncStateEventPayload['data']['data'],
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
  isAnotherHostOperating: boolean;
  currentOperatingHostName?: string;
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
  isAnotherHostOperating: false,
  currentOperatingHostName: undefined,
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
  const {
    data: {isHost, roomId},
  } = useRoomInfo();
  const breakoutRoomExit = useBreakoutRoomExit(handleLeaveBreakout);
  const [state, baseDispatch] = useReducer(
    breakoutRoomReducer,
    initialBreakoutRoomState,
  );
  const [isBreakoutUpdateInFlight, setBreakoutUpdateInFlight] = useState(false);

  // Permissions:
  const [permissions, setPermissions] = useState<BreakoutRoomPermissions>({
    ...defaulBreakoutRoomPermission,
  });

  // Multi-host coordination state
  const [isAnotherHostOperating, setIsAnotherHostOperating] = useState(false);
  const [currentOperatingHostName, setCurrentOperatingHostName] = useState<
    string | undefined
  >(undefined);

  // Join Room pending intent
  const [selfJoinRoomId, setSelfJoinRoomId] = useState<string | null>(null);

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
      if (isAnotherHostOperating) {
        console.log('supriya-state-sync isAnotherHostOperating is true');

        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          'Operation blocked - another host is operating',
          {
            blockedOperation: operationName,
            operatingHost: currentOperatingHostName,
          },
        );

        if (showToast) {
          showDeduplicatedToast(`operation-blocked-host-${operationName}`, {
            type: 'info',
            text1: `${
              currentOperatingHostName || 'Another host'
            } is currently managing breakout rooms`,
            text2: 'Please wait for them to finish',
            visibilityTime: 3000,
          });
        }
        return false;
      }

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
      isAnotherHostOperating,
      currentOperatingHostName,
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

  // Update unassigned participants whenever defaultContent or activeUids change
  useEffect(() => {
    // Get currently assigned participants from all rooms
    // Filter active UIDs to exclude:
    // 1. Custom content (not type 'rtc')
    // 2. Screenshare UIDs
    // 3. Offline users
    if (!stateRef?.current?.breakoutSessionId) {
      return;
    }
    const filteredParticipants = activeUids
      .filter(uid => {
        const user = defaultContentRef.current[uid];
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
        // Exclude hosts
        if (user?.isHost) {
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
        user: defaultContentRef.current[uid],
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
  }, [activeUids, localUid, dispatch, state.breakoutSessionId]);

  // Check if there is already an active breakout session
  // We can call this to trigger sync events
  const checkIfBreakoutRoomSessionExistsAPI = async (): Promise<boolean> => {
    console.log(
      'supriya-state-sync calling checkIfBreakoutRoomSessionExistsAPI',
    );
    const startTime = Date.now();
    const requestId = getUniqueID();
    const url = `${
      $config.BACKEND_ENDPOINT
    }/v1/channel/breakout-room?passphrase=${
      isHostRef.current ? roomId.host : roomId.attendee
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
  };

  // Polling for sync event
  const pollBreakoutGetAPI = useCallback(async () => {
    if (isHostRef.current && stateRef.current.breakoutSessionId) {
      await checkIfBreakoutRoomSessionExistsAPI();
    }
  }, []);

  // Automatic interval management with cleanup only host will poll
  // useEffect(() => {
  //   if (
  //     isHostRef.current &&
  //     !isPollingPaused &&
  //     (stateRef.current.breakoutSessionId || isInBreakoutRoute)
  //   ) {
  //     const interval = setInterval(pollBreakoutGetAPI, 2000);
  //     return () => clearInterval(interval);
  //   }
  // }, [isPollingPaused, isInBreakoutRoute, pollBreakoutGetAPI]);

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
          passphrase: isHostRef.current ? roomId.host : roomId.attendee,
          switch_room: stateRef.current.canUserSwitchRoom,
          session_id: sessionId,
          assignment_type: stateRef.current.assignmentStrategy,
          breakout_room:
            type === 'START'
              ? getSanitizedPayload(initialBreakoutGroups)
              : getSanitizedPayload(stateRef.current.breakoutGroups),
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
          if (data?.breakout_room) {
            dispatch({
              type: BreakoutGroupActionTypes.UPDATE_GROUPS_IDS,
              payload: data.breakout_room,
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
    [roomId.host, store.token, dispatch, selfJoinRoomId, roomId.attendee],
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
    [localUid],
  );

  const getCurrentRoom = useCallback((): BreakoutGroup | null => {
    const userRoom = stateRef.current.breakoutGroups.find(
      group =>
        group.participants.hosts.includes(localUid) ||
        group.participants.attendees.includes(localUid),
    );
    return userRoom ?? null;
  }, [localUid]);

  // Permissions
  useEffect(() => {
    const currentlyInRoom = isUserInRoom();
    const hasAvailableRooms = stateRef.current.breakoutGroups.length > 0;
    const allowAttendeeSwitch = stateRef.current.canUserSwitchRoom;

    const nextPermissions: BreakoutRoomPermissions = {
      canJoinRoom:
        !currentlyInRoom &&
        hasAvailableRooms &&
        (isHostRef.current || allowAttendeeSwitch),
      canExitRoom: currentlyInRoom,
      canSwitchBetweenRooms:
        currentlyInRoom &&
        hasAvailableRooms &&
        (isHostRef.current || allowAttendeeSwitch),
      canScreenshare: currentlyInRoom ? canIPresent : true,
      canRaiseHands: !isHostRef.current && !!stateRef.current.breakoutSessionId,
      canSeeRaisedHands: isHostRef.current,
      canAssignParticipants: isHostRef.current,
      canHostManageMainRoom: isHostRef.current && !currentlyInRoom,
      canCreateRooms: isHostRef.current,
      canMoveUsers: isHostRef.current,
      canCloseRooms:
        isHostRef.current &&
        hasAvailableRooms &&
        !!stateRef.current.breakoutSessionId,
      canMakePresenter: isHostRef.current,
    };

    setPermissions(nextPermissions);
  }, [
    state.breakoutGroups,
    state.canUserSwitchRoom,
    state.breakoutSessionId,
    isUserInRoom,
    canIPresent,
  ]);

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
    setSelfJoinRoomId(toRoomId);
  };

  const exitRoom = useCallback(
    async (
      fromRoomId?: string,
      permissionAtCallTime = permissions.canExitRoom,
    ) => {
      // 🛡️ Use permission passed at call time to avoid race conditions
      if (!permissionAtCallTime) {
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          'Exit room blocked - no permission at call time',
          {
            fromRoomId,
            permissionAtCallTime,
            currentPermission: permissions.canExitRoom,
          },
        );
        return;
      }

      const localUser = defaultContentRef.current[localUid];
      const currentRoom = getCurrentRoom();
      const currentRoomId = fromRoomId ? fromRoomId : currentRoom?.id;

      logger.log(LogSource.Internals, 'BREAKOUT_ROOM', 'User exiting room', {
        userId: localUid,
        userName: localUser?.name,
        fromRoomId: currentRoomId,
        fromRoomName: currentRoom?.name,
        hasLocalUser: !!localUser,
      });

      try {
        if (currentRoomId && localUser) {
          // Use breakout-specific exit (doesn't destroy main RTM)
          await breakoutRoomExit();

          // 🛡️ Guard against component unmount
          if (!isMountedRef.current) {
            logger.log(
              LogSource.Internals,
              'BREAKOUT_ROOM',
              'Exit room cancelled - component unmounted',
              {userId: localUid, fromRoomId: currentRoomId},
            );
            return;
          }

          dispatch({
            type: BreakoutGroupActionTypes.EXIT_GROUP,
            payload: {
              user: localUser,
              fromGroupId: currentRoomId,
            },
          });

          logger.log(
            LogSource.Internals,
            'BREAKOUT_ROOM',
            'User exit room success',
            {userId: localUid, fromRoomId: currentRoomId},
          );
        }
      } catch (error) {
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          'Exit room error - fallback dispatch',
          {
            userId: localUid,
            fromRoomId: currentRoomId,
            error: error.message,
          },
        );

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
    },
    [
      dispatch,
      getCurrentRoom,
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

  const getRoomMemberDropdownOptions = (memberUid: UidType) => {
    const options: MemberDropdownOption[] = [];
    // Find which room the user is currently in

    const memberUser = defaultContentRef.current[memberUid];
    if (!memberUser) {
      return options;
    }

    const getCurrentUserRoom = (uid: UidType) => {
      return stateRef.current.breakoutGroups.find(
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

    // Make presenter option (only for hosts)
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

  const handleBreakoutRoomSyncState = useCallback(
    (data: BreakoutRoomSyncStateEventPayload['data']['data']) => {
      const {session_id, switch_room, breakout_room, assignment_type} = data;
      console.log('supriya-state-sync new data: ', data);
      console.log('supriya-state-sync old data: ', stateRef.current);

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

      if (isAnotherHostOperating) {
        setIsAnotherHostOperating(false);
        setCurrentOperatingHostName(undefined);
      }
      // 🛡️ BEFORE snapshot - using stateRef to avoid stale closure
      const prevGroups = stateRef.current.breakoutGroups;
      const prevSwitchRoom = stateRef.current.canUserSwitchRoom;

      // Helpers to find membership
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

      const prevRoomId = findUserRoomId(localUid, prevGroups); // before
      const nextRoomId = findUserRoomId(localUid, breakout_room);

      // Show notifications based on changes
      // 1. Switch room enabled notification
      if (switch_room && !prevSwitchRoom) {
        console.log('supriya-toast 1');
        showDeduplicatedToast('switch-room-toggle', {
          leadingIconName: 'info',
          type: 'info',
          text1: 'Breakout rooms are now open. Please choose a room to join.',
          visibilityTime: 3000,
        });
      }

      // 2. User joined a room (compare previous and current state)
      if (!prevRoomId && nextRoomId) {
        console.log('supriya-toast 2', prevRoomId, nextRoomId);
        const currentRoom = breakout_room.find(r => r.id === nextRoomId);

        showDeduplicatedToast(`joined-room-${nextRoomId}`, {
          type: 'success',
          text1: `You've joined ${currentRoom?.name || 'a breakout room'}.`,
          visibilityTime: 3000,
        });
      }

      // 3. User was moved to a different room by host
      // Moved to a different room (before: A, after: B, A≠B)
      if (prevRoomId && nextRoomId && prevRoomId !== nextRoomId) {
        console.log('supriya-toast 3', prevRoomId, nextRoomId);
        const afterRoom = breakout_room.find(r => r.id === nextRoomId);
        showDeduplicatedToast(`moved-to-room-${nextRoomId}`, {
          type: 'info',
          text1: `You've been moved to ${afterRoom.name} by the host.`,
          visibilityTime: 4000,
        });
      }

      // 4. User was moved to main room
      if (prevRoomId && !nextRoomId) {
        console.log('supriya-toast 4', prevRoomId, nextRoomId);

        const prevRoom = prevGroups.find(r => r.id === prevRoomId);
        // Distinguish "room closed" vs "moved to main"
        const roomStillExists = breakout_room.some(r => r.id === prevRoomId);

        if (!roomStillExists) {
          showDeduplicatedToast(`current-room-closed-${prevRoomId}`, {
            leadingIconName: 'alert',
            type: 'error',
            text1: `${
              prevRoom?.name || 'Your room'
            } is currently closed. Returning to main room.`,
            visibilityTime: 5000,
          });
        } else {
          showDeduplicatedToast(`moved-to-main-${prevRoomId}`, {
            leadingIconName: 'arrow-up',
            type: 'info',
            text1: "You've returned to the main room.",
            visibilityTime: 3000,
          });
        }
        // Exit breakout room and return to main room
        exitRoom(prevRoomId, true);
        return;
      }

      // 5. All breakout rooms closed
      if (breakout_room.length === 0 && prevGroups.length > 0) {
        console.log('supriya-toast 5', prevRoomId, nextRoomId);

        // Show different messages based on user's current location
        if (prevRoomId) {
          // User was in a breakout room - returning to main
          showDeduplicatedToast('all-rooms-closed', {
            leadingIconName: 'close',
            type: 'info',
            text1:
              'Breakout rooms are now closed. Returning to the main room...',
            visibilityTime: 3000,
          });
          exitRoom(prevRoomId, true);
        } else {
          // User was already in main room - just notify about closure
          showDeduplicatedToast('all-rooms-closed', {
            leadingIconName: 'close',
            type: 'info',
            text1: 'All breakout rooms have been closed.',
            visibilityTime: 4000,
          });
        }
        return;
      }

      // 6) Room renamed (compare per-room names)
      prevGroups.forEach(prevRoom => {
        const after = breakout_room.find(r => r.id === prevRoom.id);
        if (after && after.name !== prevRoom.name) {
          showDeduplicatedToast(`room-renamed-${after.id}`, {
            type: 'info',
            text1: `${prevRoom.name} has been renamed to '${after.name}'.`,
            visibilityTime: 3000,
          });
        }
      });

      // Finally, apply the authoritative state
      dispatch({
        type: BreakoutGroupActionTypes.SYNC_STATE,
        payload: {
          sessionId: session_id,
          assignmentStrategy: assignment_type,
          switchRoom: switch_room,
          rooms: breakout_room,
        },
      });
    },
    [
      dispatch,
      exitRoom,
      localUid,
      showDeduplicatedToast,
      isAnotherHostOperating,
    ],
  );

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

      setIsAnotherHostOperating(true);
      setCurrentOperatingHostName(hostName);

      // Show toast notification
      showDeduplicatedToast(`host-operation-start-${hostUid}`, {
        type: 'info',
        text1: `${hostName} is managing breakout rooms`,
        text2: 'Please wait for them to finish',
        visibilityTime: 5000,
      });

      // Emergency timeout ONLY as last resort (30 seconds for network failures)
      const timeoutId = safeSetTimeout(() => {
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          'EMERGENCY: Auto-clearing host operation lock after extended timeout',
          {
            operationName,
            hostUid,
            hostName,
            timeoutMs: HOST_OPERATION_LOCK_TIMEOUT_MS,
            reason: 'Possible network failure or host disconnection',
          },
        );
        setIsAnotherHostOperating(false);
        setCurrentOperatingHostName(undefined);
        hostOperationTimeoutRef.current = null; // Clear the ref since timeout fired

        showDeduplicatedToast(`host-operation-emergency-unlock-${hostUid}`, {
          type: 'info',
          text1: 'Breakout room controls unlocked',
          text2: 'The other host may have disconnected',
          visibilityTime: 4000,
        });
      }, HOST_OPERATION_LOCK_TIMEOUT_MS);

      // Store the timeout ID so we can clear it if operation ends normally
      hostOperationTimeoutRef.current = timeoutId;
    },
    [localUid, showDeduplicatedToast, safeSetTimeout],
  );

  const handleHostOperationEnd = useCallback(
    (operationName: string, hostUid: UidType, hostName: string) => {
      // Only process if current user is also a host and it's not their own event
      console.log('supriya-state-sync host operation ended', operationName);

      if (!isHostRef.current || hostUid === localUid) {
        return;
      }

      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        'Another host ended operation - unlocking UI',
        {operationName, hostUid, hostName},
      );

      setIsAnotherHostOperating(false);
      setCurrentOperatingHostName(undefined);

      // Clear the emergency timeout since operation ended properly
      if (hostOperationTimeoutRef.current) {
        safeClearTimeout(hostOperationTimeoutRef.current);
        hostOperationTimeoutRef.current = null;
      }
    },
    [localUid],
  );

  // Debounced API for performance with multi-host coordination
  const debouncedUpsertAPI = useDebouncedCallback(
    async (type: 'START' | 'UPDATE', operationName?: string) => {
      setBreakoutUpdateInFlight(true);
      setIsPollingPaused(true);

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
        setIsPollingPaused(false);
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
  }, [dispatch, lastAction]);

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
        handleBreakoutRoomSyncState,
        // Multi-host coordination handlers
        handleHostOperationStart,
        handleHostOperationEnd,
        permissions,
        // Loading states
        isBreakoutUpdateInFlight,
        // Multi-host coordination
        isAnotherHostOperating,
        currentOperatingHostName,
      }}>
      {children}
    </BreakoutRoomContext.Provider>
  );
};

const useBreakoutRoom = createHook(BreakoutRoomContext);

export {useBreakoutRoom, BreakoutRoomProvider};
