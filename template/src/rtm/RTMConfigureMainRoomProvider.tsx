/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the "Materials") are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.'s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/

import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  createContext,
  useCallback,
} from 'react';
import {type MessageEvent, type StorageEvent} from 'agora-react-native-rtm';
import {
  ContentInterface,
  DispatchContext,
  useLocalUid,
} from '../../agora-rn-uikit';
import {Platform} from 'react-native';
import {isAndroid, isIOS} from '../utils/common';
import {useContent} from 'customization-api';
import {
  safeJsonParse,
  getMessageTime,
  get32BitUid,
  isEventForActiveChannel,
} from './utils';
import {EventUtils, EventsQueue} from '../rtm-events';
import {PersistanceLevel} from '../rtm-events-api';
import RTMEngine from './RTMEngine';
import {filterObject} from '../utils';
import {useAsyncEffect} from '../utils/useAsyncEffect';
import {
  WaitingRoomStatus,
  useRoomInfo,
} from '../components/room-info/useRoomInfo';
import LocalEventEmitter, {
  LocalEventsEnum,
} from '../rtm-events-api/LocalEvents';
import {controlMessageEnum} from '../components/ChatContext';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import {
  nativeChannelTypeMapping,
  nativeStorageEventTypeMapping,
} from '../../bridge/rtm/web/Types';
import {useRTMCore} from './RTMCoreProvider';
import {RTMUserData, useRTMGlobalState} from './RTMGlobalStateProvider';
import {useUserGlobalPreferences} from '../components/UserGlobalPreferenceProvider';
import {ToggleState} from '../../agora-rn-uikit';
import useMuteToggleLocal from '../utils/useMuteToggleLocal';
import {
  RTM_ROOMS,
  RTM_EVENTS_ATTRIBUTES_TO_RESET_WHEN_ROOM_CHANGES,
} from './constants';
import {useRtc} from 'customization-api';
import {
  fetchChannelAttributesWithRetries,
  clearRoomScopedUserAttributes,
} from './rtm-presence-utils';

const eventTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// RTM Main Room Context
export interface RTMMainRoomData {
  hasUserJoinedRTM: boolean;
  isInitialQueueCompleted: boolean;
  onlineUsersCount: number;
  rtmInitTimstamp: number;
  syncUserState: (uid: number, data: Partial<ContentInterface>) => void;
}

const RTMMainRoomContext = createContext<RTMMainRoomData>({
  hasUserJoinedRTM: false,
  isInitialQueueCompleted: false,
  onlineUsersCount: 0,
  rtmInitTimstamp: 0,
  syncUserState: () => {},
});

export const useRTMConfigureMain = () => {
  const context = useContext(RTMMainRoomContext);
  if (!context) {
    throw new Error(
      'useRTMConfigureMain must be used within RTMConfigureMainRoomProvider',
    );
  }
  return context;
};

interface RTMConfigureMainRoomProviderProps {
  callActive: boolean;
  currentChannel: string;
  children: React.ReactNode;
}

const RTMConfigureMainRoomProvider: React.FC<
  RTMConfigureMainRoomProviderProps
> = ({callActive, currentChannel, children}) => {
  const rtmInitTimstamp = new Date().getTime();
  const {dispatch} = useContext(DispatchContext);
  const {defaultContent, activeUids} = useContent();
  const {
    waitingRoomStatus,
    data: {isHost},
  } = useRoomInfo();
  const localUid = useLocalUid();
  const {applyUserPreferences, syncUserPreferences} =
    useUserGlobalPreferences();
  const toggleMute = useMuteToggleLocal();
  const {rtcTracksReady} = useRtc();
  const [hasUserJoinedRTM, setHasUserJoinedRTM] = useState<boolean>(false);
  const [isInitialQueueCompleted, setIsInitialQueueCompleted] = useState(false);
  const [onlineUsersCount, setTotalOnlineUsers] = useState<number>(0);

  // RTM
  const {client, isLoggedIn} = useRTMCore();
  const {mainRoomRTMUsers, setMainRoomRTMUsers} = useRTMGlobalState();

  // Main channel message registration (RTMConfigureMainRoom is always for main channel)
  const {
    registerMainChannelMessageHandler,
    unregisterMainChannelMessageHandler,
    registerMainChannelStorageHandler,
    unregisterMainChannelStorageHandler,
  } = useRTMGlobalState();

  // refs
  const isRTMMounted = useRef(true);
  const channelAttributesTimerRef: any = useRef(5);
  const channelAttributesTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const isHostRef = useRef({isHost: isHost});
  useEffect(() => {
    isHostRef.current.isHost = isHost;
  }, [isHost]);

  const waitingRoomStatusRef = useRef({waitingRoomStatus: waitingRoomStatus});
  useEffect(() => {
    waitingRoomStatusRef.current.waitingRoomStatus = waitingRoomStatus;
  }, [waitingRoomStatus]);

  const activeUidsRef = useRef({activeUids: activeUids});
  useEffect(() => {
    activeUidsRef.current.activeUids = activeUids;
  }, [activeUids]);

  const defaultContentRef = useRef(defaultContent);

  useEffect(() => {
    defaultContentRef.current = defaultContent;
  }, [defaultContent]);

  // Set online users
  React.useEffect(() => {
    setTotalOnlineUsers(
      Object.keys(
        filterObject(
          defaultContent,
          ([k, v]) =>
            v?.type === 'rtc' &&
            !v.offline &&
            activeUidsRef.current.activeUids.indexOf(v?.uid) !== -1,
        ),
      ).length,
    );
  }, [defaultContent, activeUids]);

  // Set user preferences when main room mounts
  useEffect(() => {
    if (rtcTracksReady && localUid) {
      console.log(
        'UP: trackesready',
        JSON.stringify(defaultContentRef.current[localUid]),
      );
      applyUserPreferences(defaultContentRef.current[localUid], toggleMute);
    }
  }, [rtcTracksReady, localUid]);

  // Sync current audio/video state audio video changes
  useEffect(() => {
    const userData = defaultContent[localUid];
    if (rtcTracksReady && userData) {
      console.log('UP: syncing userData: ', userData);
      const preferences = {
        audioMuted: userData.audio === ToggleState.disabled,
        videoMuted: userData.video === ToggleState.disabled,
      };
      console.log('UP: saved preferences: ', preferences);
      syncUserPreferences(preferences);
    }
  }, [defaultContent, localUid, syncUserPreferences, rtcTracksReady]);

  // Set Main room specific syncUserState function
  const syncUserState = useCallback(
    (uid: number, data: any) => {
      // Extract only RTM-related fields that are actually passed
      const rtmData: Partial<RTMUserData> = {};

      // Only add fields if they exist in the passed data
      if ('name' in data) {
        rtmData.name = data.name;
      }
      if ('screenUid' in data) {
        rtmData.screenUid = data.screenUid;
      }
      if ('offline' in data) {
        rtmData.offline = data.offline;
      }
      if ('lastMessageTimeStamp' in data) {
        rtmData.lastMessageTimeStamp = data.lastMessageTimeStamp;
      }
      if ('isInWaitingRoom' in data) {
        rtmData.isInWaitingRoom = data.isInWaitingRoom;
      }
      if ('isHost' in data) {
        rtmData.isHost = data.isHost;
      }
      if ('type' in data) {
        rtmData.type = data.type;
      }
      if ('parentUid' in data) {
        rtmData.parentUid = data.parentUid;
      }
      if ('uid' in data) {
        rtmData.uid = data.uid;
      }
      // Only update if we have RTM data to update
      if (Object.keys(rtmData).length > 0) {
        setMainRoomRTMUsers(prev => {
          return {
            ...prev,
            [uid]: {
              ...prev[uid],
              ...rtmData,
            },
          };
        });
      }
    },
    [setMainRoomRTMUsers],
  );

  useEffect(() => {
    Object.entries(mainRoomRTMUsers).forEach(([uidStr, rtmUser]) => {
      const uid = parseInt(uidStr, 10);

      // Create only RTM data
      const userData: RTMUserData = {
        // RTM data
        name: rtmUser.name || '',
        screenUid: rtmUser.screenUid || 0,
        offline: !!rtmUser.offline,
        lastMessageTimeStamp: rtmUser.lastMessageTimeStamp || 0,
        isInWaitingRoom: rtmUser?.isInWaitingRoom || false,
        isHost: rtmUser.isHost,
        type: rtmUser.type,
      };

      // Dispatch directly for each user
      dispatch({type: 'UpdateRenderList', value: [uid, userData]});
    });
  }, [mainRoomRTMUsers, dispatch]);

  const rehydrateSessionAttributes = async () => {
    try {
      const uid = localUid.toString();
      const attr = await client.storage.getUserMetadata({userId: uid});
      console.log('supriya-wasInBreakoutRoom: attr: ', attr);

      if (!attr?.items) {
        return;
      }

      attr.items.forEach(item => {
        try {
          // Check if this is a room-aware session attribute for current room
          if (item.key && item.key.startsWith(`${RTM_ROOMS.MAIN}__`)) {
            const parsed = JSON.parse(item.value);
            if (parsed.persistLevel === PersistanceLevel.Session) {
              // Replay into eventDispatcher so state gets rebuilt
              eventDispatcher(
                {evt: item.key, value: item.value},
                uid,
                Date.now(),
              );
            }
          }
        } catch (e) {
          console.log('Failed to rehydrate session attribute', item.key, e);
        }
      });
    } catch (error) {
      console.log('Failed to rehydrate session attributes', error);
    }
  };

  const init = async () => {
    // Set main room as active channel when this provider mounts again active
    const currentActiveChannel = RTMEngine.getInstance().getActiveChannelName();
    const wasInBreakoutRoom = currentActiveChannel === RTM_ROOMS.BREAKOUT;

    if (currentActiveChannel !== RTM_ROOMS.MAIN) {
      RTMEngine.getInstance().setActiveChannelName(RTM_ROOMS.MAIN);
    }
    // Clear room-scoped RTM attributes to ensure fresh state
    await clearRoomScopedUserAttributes(
      client,
      RTM_EVENTS_ATTRIBUTES_TO_RESET_WHEN_ROOM_CHANGES,
    );

    // Rehydrate session attributes ONLY when returning from breakout room
    if (wasInBreakoutRoom) {
      await rehydrateSessionAttributes();
    }

    await getChannelAttributes();

    setHasUserJoinedRTM(true);
    await runQueuedEvents();
    setIsInitialQueueCompleted(true);
  };

  const getChannelAttributes = async () => {
    try {
      await fetchChannelAttributesWithRetries(
        client,
        currentChannel,
        eventData => EventsQueue.enqueue(eventData),
      );
      channelAttributesTimerRef.current = 5;
      // Clear any pending retry timeout since we succeeded
      if (channelAttributesTimeoutRef.current) {
        clearTimeout(channelAttributesTimeoutRef.current);
        channelAttributesTimeoutRef.current = null;
      }
    } catch (error) {
      console.log(
        'rudra-core-client: RTM getchannelattributes failed..Trying again',
        error,
      );
      channelAttributesTimeoutRef.current = setTimeout(async () => {
        // Cap the timer to prevent excessive delays (max 30 seconds)
        channelAttributesTimerRef.current = Math.min(
          channelAttributesTimerRef.current * 2,
          30,
        );
        getChannelAttributes();
      }, channelAttributesTimerRef.current * 1000);
    }
  };

  const runQueuedEvents = async () => {
    try {
      while (!EventsQueue.isEmpty()) {
        const currEvt = EventsQueue.dequeue();
        console.log('supriya-session inside queue currEvt: ', currEvt);
        await eventDispatcher(currEvt.data, `${currEvt.uid}`, currEvt.ts);
      }
    } catch (error) {
      logger.error(
        LogSource.Events,
        'CUSTOM_EVENTS',
        'error while running queue events',
        {error},
      );
    }
  };

  const eventDispatcher = async (
    data: {
      evt: string;
      value: string;
      feat?: string;
      etyp?: string;
    },
    sender: string,
    ts: number,
  ) => {
    console.log(
      LogSource.Events,
      'CUSTOM_EVENTS',
      'inside eventDispatcher ',
      data,
    );

    let evt = '',
      value = '';

    if (data?.feat === 'BREAKOUT_ROOM') {
      const outputData = {
        evt: `${data.feat}_${data.etyp}`,
        payload: JSON.stringify({
          data: data.data,
          action: data.act,
        }),
        persistLevel: 1,
        source: 'core',
      };
      const formattedData = JSON.stringify(outputData);
      evt = data.feat + '_' + data.etyp;
      value = formattedData;
    } else if (data?.feat === 'WAITING_ROOM') {
      if (data?.etyp === 'REQUEST') {
        const outputData = {
          evt: `${data.feat}_${data.etyp}`,
          payload: JSON.stringify({
            attendee_uid: data.data.data.attendee_uid,
            attendee_screenshare_uid: data.data.data.attendee_screenshare_uid,
          }),
          persistLevel: 1,
          source: 'core',
        };
        const formattedData = JSON.stringify(outputData);
        evt = data.feat + '_' + data.etyp;
        value = formattedData;
      }
      if (data?.etyp === 'RESPONSE') {
        const outputData = {
          evt: `${data.feat}_${data.etyp}`,
          payload: JSON.stringify({
            approved: data.data.data.approved,
            channelName: data.data.data.channel_name,
            mainUser: data.data.data.mainUser,
            screenShare: data.data.data.screenShare,
            whiteboard: data.data.data.whiteboard,
            chat: data.data.data?.chat,
          }),
          persistLevel: 1,
          source: 'core',
        };
        const formattedData = JSON.stringify(outputData);
        evt = data.feat + '_' + data.etyp;
        value = formattedData;
      }
    } else {
      if (
        $config.ENABLE_WAITING_ROOM &&
        !isHostRef.current?.isHost &&
        waitingRoomStatusRef.current?.waitingRoomStatus !==
          WaitingRoomStatus.APPROVED
      ) {
        if (
          data.evt === controlMessageEnum.muteAudio ||
          data.evt === controlMessageEnum.muteVideo
        ) {
          return;
        } else {
          evt = data.evt;
          value = data.value;
        }
      } else {
        evt = data.evt;
        value = data.value;
      }
    }

    try {
      let parsedValue;
      try {
        parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
      } catch (error) {
        logger.error(
          LogSource.Events,
          'CUSTOM_EVENTS',
          'RTM Failed to parse event value in event dispatcher:',
          {error},
        );
        return;
      }
      const {payload, persistLevel, source, _scope, _channelId} = parsedValue;
      console.log(
        'supriya-session-attributes [MAIN] _scope and _channelId: ',
        source,
        _scope,
        _channelId,
        currentChannel,
        payload,
      );
      // Filter if its for this channel
      if (!isEventForActiveChannel(_scope, _channelId, currentChannel)) {
        console.log('supriya-session-attributes SKIPPING', payload);
        return;
      }

      // Step 2: Emit the event (no metadata persistence - handled by RTMGlobalStateProvider)
      console.log(LogSource.Events, 'CUSTOM_EVENTS', 'emiting event..: ', evt);
      EventUtils.emitEvent(evt, source, {payload, persistLevel, sender, ts});
      // Because async gets evaluated in a different order when in an sdk
      if (evt === 'name') {
        // 1. Cancel existing timeout for this sender
        if (eventTimeouts.has(sender)) {
          clearTimeout(eventTimeouts.get(sender)!);
        }
        // 2. Create new timeout with tracking
        const timeout = setTimeout(() => {
          // 3. Guard against unmounted component
          if (!isRTMMounted.current) {
            return;
          }
          EventUtils.emitEvent(evt, source, {
            payload,
            persistLevel,
            sender,
            ts,
          });
          // 4. Clean up after execution
          eventTimeouts.delete(sender);
        }, 200);
        // 5. Track the timeout for cleanup
        eventTimeouts.set(sender, timeout);
      }
    } catch (error) {
      console.error(
        LogSource.Events,
        'CUSTOM_EVENTS',
        'error while emiting event:',
        {error},
      );
    }
  };

  // Listeners
  const handleMainChannelStorageEvent = (storage: StorageEvent) => {
    // when remote user sets/updates metadata - 3
    if (
      storage.eventType === nativeStorageEventTypeMapping.SET ||
      storage.eventType === nativeStorageEventTypeMapping.UPDATE
    ) {
      const storageTypeStr = storage.storageType === 1 ? 'user' : 'channel';
      const eventTypeStr = storage.eventType === 2 ? 'SET' : 'UPDATE';
      logger.log(
        LogSource.AgoraSDK,
        'Event',
        `RTM storage event of type: [${eventTypeStr} ${storageTypeStr} metadata]`,
        storage,
      );
      try {
        if (storage.data?.items && Array.isArray(storage.data.items)) {
          storage.data.items.forEach(item => {
            try {
              if (!item || !item.key) {
                logger.warn(
                  LogSource.Events,
                  'CUSTOM_EVENTS',
                  'Invalid storage item:',
                  item,
                );
                return;
              }

              const {key, value, authorUserId, updateTs} = item;
              const timestamp = getMessageTime(updateTs);
              const sender = Platform.OS
                ? get32BitUid(authorUserId)
                : parseInt(authorUserId, 10);
              eventDispatcher(
                {
                  evt: key,
                  value,
                },
                `${sender}`,
                timestamp,
              );
            } catch (error) {
              logger.error(
                LogSource.Events,
                'CUSTOM_EVENTS',
                `Failed to process storage item: ${JSON.stringify(item)}`,
                {error},
              );
            }
          });
        }
      } catch (error) {
        logger.error(
          LogSource.Events,
          'CUSTOM_EVENTS',
          'error while dispatching through eventDispatcher',
          {error},
        );
      }
    }
  };

  const handleMainChannelMessageEvent = (message: MessageEvent) => {
    console.log('supriya current message channel: ', currentChannel);
    console.log('supriya message event is', message);
    // message - 1 (channel)
    if (message.channelType === nativeChannelTypeMapping.MESSAGE) {
      // here the channel name will be the channel name
      logger.debug(
        LogSource.Events,
        'CUSTOM_EVENTS',
        'messageEvent of type [1 - CHANNEL] (channelMessageReceived)',
        message,
      );
      const {publisher: uid, message: text, timestamp: ts} = message;
      //whiteboard upload
      if (parseInt(uid, 10) === 1010101) {
        const [err, res] = safeJsonParse(text);
        if (err) {
          logger.error(
            LogSource.Events,
            'CUSTOM_EVENTS',
            'JSON payload incorrect, Error while parsing the payload',
            {error: err},
          );
        }
        if (res?.data?.data?.images) {
          LocalEventEmitter.emit(
            LocalEventsEnum.WHITEBOARD_FILE_UPLOAD,
            res?.data?.data?.images,
          );
        }
      } else {
        const [err, msg] = safeJsonParse(text);
        if (err) {
          logger.error(
            LogSource.Events,
            'CUSTOM_EVENTS',
            'JSON payload incorrect, Error while parsing the payload',
            {error: err},
          );
        }

        const timestamp = getMessageTime(ts);
        const sender = Platform.OS ? get32BitUid(uid) : parseInt(uid, 10);
        try {
          eventDispatcher(msg, `${sender}`, timestamp);
        } catch (error) {
          logger.error(
            LogSource.Events,
            'CUSTOM_EVENTS',
            'error while dispatching through eventDispatcher',
            {error},
          );
        }
      }
    }

    // message - 3 (user)
    if (message.channelType === nativeChannelTypeMapping.USER) {
      logger.debug(
        LogSource.Events,
        'CUSTOM_EVENTS',
        'messageEvent of type [3- USER] (messageReceived)',
        message,
      );
      // here the  (message.channelname) channel name will be the to UID
      const {publisher: peerId, timestamp: ts, message: text} = message;
      const [err, msg] = safeJsonParse(text);
      if (err) {
        logger.error(
          LogSource.Events,
          'CUSTOM_EVENTS',
          'JSON payload incorrect, Error while parsing the payload',
          {error: err},
        );
      }

      const timestamp = getMessageTime(ts);

      const sender = isAndroid() ? get32BitUid(peerId) : parseInt(peerId, 10);

      try {
        eventDispatcher(msg, `${sender}`, timestamp);
      } catch (error) {
        logger.error(
          LogSource.Events,
          'CUSTOM_EVENTS',
          'error while dispatching through eventDispatcher',
          {error},
        );
      }
    }
  };

  useAsyncEffect(async () => {
    try {
      if (client && isLoggedIn && callActive && currentChannel) {
        registerMainChannelMessageHandler(handleMainChannelMessageEvent);
        registerMainChannelStorageHandler(handleMainChannelStorageEvent);
        await init();
      }
    } catch (error) {
      logger.error(LogSource.AgoraSDK, 'Log', 'RTM init failed', {error});
    }
    return async () => {
      isRTMMounted.current = false;
      logger.log(LogSource.AgoraSDK, 'API', 'RTM destroy done');
      unregisterMainChannelMessageHandler();
      unregisterMainChannelStorageHandler();
      if (isIOS() || isAndroid()) {
        EventUtils.clear();
      }
      // Clear all pending timeouts on unmount
      for (const timeout of eventTimeouts.values()) {
        clearTimeout(timeout);
      }
      eventTimeouts.clear();
      // Clear timer-based retry timeouts
      if (channelAttributesTimeoutRef.current) {
        clearTimeout(channelAttributesTimeoutRef.current);
        channelAttributesTimeoutRef.current = null;
      }
      setHasUserJoinedRTM(false);
      setIsInitialQueueCompleted(false);
      logger.debug(LogSource.AgoraSDK, 'Log', 'RTM cleanup done');
    };
  }, [client, isLoggedIn, callActive, currentChannel]);

  // Provide context data to children
  const contextValue: RTMMainRoomData = {
    hasUserJoinedRTM,
    isInitialQueueCompleted,
    onlineUsersCount,
    rtmInitTimstamp,
    syncUserState,
  };

  return (
    <RTMMainRoomContext.Provider value={contextValue}>
      {children}
    </RTMMainRoomContext.Provider>
  );
};

export default RTMConfigureMainRoomProvider;
