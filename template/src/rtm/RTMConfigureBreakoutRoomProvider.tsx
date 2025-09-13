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

import React, {useState, useContext, useEffect, useRef, createContext} from 'react';
import {
  type MessageEvent,
  type StorageEvent,
} from 'agora-react-native-rtm';
import {
  ContentInterface,
  DispatchContext,
  PropsContext,
  UidType,
  useLocalUid,
} from '../../agora-rn-uikit';
import {Platform} from 'react-native';
import {isAndroid, isIOS, isWebInternal} from '../utils/common';
import {useContent} from 'customization-api';
import {
  safeJsonParse,
  getMessageTime,
  get32BitUid,
} from './utils';
import {EventUtils, EventsQueue} from '../rtm-events';
import RTMEngine from './RTMEngine';
import {filterObject} from '../utils';
import SDKEvents from '../utils/SdkEvents';
import isSDK from '../utils/isSDK';
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

const eventTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// RTM Breakout Room Context
export interface RTMBreakoutRoomData {
  hasUserJoinedRTM: boolean;
  isInitialQueueCompleted: boolean;
  onlineUsersCount: number;
  rtmInitTimstamp: number;
}

const RTMBreakoutRoomContext = createContext<RTMBreakoutRoomData>({
  hasUserJoinedRTM: false,
  isInitialQueueCompleted: false,
  onlineUsersCount: 0,
  rtmInitTimstamp: 0,
});

export const useRTMConfigureBreakout = () => {
  const context = useContext(RTMBreakoutRoomContext);
  if (!context) {
    throw new Error('useRTMConfigureBreakout must be used within RTMConfigureBreakoutRoomProvider');
  }
  return context;
};

interface RTMConfigureBreakoutRoomProviderProps {
  callActive: boolean;
  channelName: string;
  children: React.ReactNode;
}

const RTMConfigureBreakoutRoomProvider: React.FC<RTMConfigureBreakoutRoomProviderProps> = ({
  callActive,
  channelName,
  children,
}) => {
  const rtmInitTimstamp = new Date().getTime();
  const localUid = useLocalUid();
  const {dispatch} = useContext(DispatchContext);
  const {defaultContent, activeUids} = useContent();
  const {
    waitingRoomStatus,
    data: {isHost},
  } = useRoomInfo();
  const [hasUserJoinedRTM, setHasUserJoinedRTM] = useState<boolean>(false);
  const [isInitialQueueCompleted, setIsInitialQueueCompleted] = useState(false);
  const [onlineUsersCount, setTotalOnlineUsers] = useState<number>(0);
  
  // Track RTM connection state (equivalent to v1.5x connectionState check)
  const {client, isLoggedIn, registerCallbacks, unregisterCallbacks} =
    useRTMCore();

  /**
   * inside event callback state won't have latest value.
   * so creating ref to access the state
   */
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

  const defaultContentRef = useRef({defaultContent: defaultContent});
  useEffect(() => {
    defaultContentRef.current.defaultContent = defaultContent;
  }, [defaultContent]);

  // Eventdispatcher timeout refs clean
  const isRTMMounted = useRef(true);
  useEffect(() => {
    return () => {
      isRTMMounted.current = false;
      // Clear all pending timeouts on unmount
      for (const timeout of eventTimeouts.values()) {
        clearTimeout(timeout);
      }
      eventTimeouts.clear();
    };
  }, []);

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
  }, [defaultContent]);


  const init = async () => {
    await runQueuedEvents();
    setIsInitialQueueCompleted(true);
  };

  const runQueuedEvents = async () => {
    try {
      while (!EventsQueue.isEmpty()) {
        const currEvt = EventsQueue.dequeue();
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

  // Simplified event emitter for storage events (no metadata persistence)
  const emitStorageEvent = async (
    evt: string,
    value: string,
    sender: string,
    ts: number,
  ) => {
    try {
      let parsedValue;
      try {
        parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
      } catch (error) {
        logger.error(
          LogSource.Events,
          'CUSTOM_EVENTS',
          'RTM Failed to parse event value for storage event:',
          {error},
        );
        return;
      }
      const {payload, persistLevel, source} = parsedValue;
      
      // Only emit the event (no metadata persistence for breakout rooms)
      console.log(LogSource.Events, 'CUSTOM_EVENTS', 'emiting breakout storage event..: ', evt);
      EventUtils.emitEvent(evt, source, {payload, persistLevel, sender, ts});
      
      // Handle special case for 'name' event
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
        'error while emiting breakout storage event:',
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
      'inside breakout eventDispatcher ',
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
    } else {
      evt = data.evt;
      value = data.value;
    }

    try {
      let parsedValue;
      try {
        parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
      } catch (error) {
        logger.error(
          LogSource.Events,
          'CUSTOM_EVENTS',
          'RTM Failed to parse event value in breakout event dispatcher:',
          {error},
        );
        return;
      }
      const {payload, persistLevel, source} = parsedValue;
      
      // Step 2: Emit the event (no metadata persistence for breakout rooms)
      console.log(LogSource.Events, 'CUSTOM_EVENTS', 'emiting breakout event..: ', evt);
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
        'error while emiting breakout event:',
        {error},
      );
    }
  };

  // Register listeners when client is created
  useEffect(() => {
    if (!client) {
      return;
    }

    const handleStorageEvent = (storage: StorageEvent) => {
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
          `RTM breakout storage event of type: [${eventTypeStr} ${storageTypeStr} metadata]`,
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
                    'Invalid breakout storage item:',
                    item,
                  );
                  return;
                }

                const {key, value, authorUserId, updateTs} = item;
                const timestamp = getMessageTime(updateTs);
                const sender = Platform.OS
                  ? get32BitUid(authorUserId)
                  : parseInt(authorUserId, 10);
                emitStorageEvent(
                  key,
                  value,
                  `${sender}`,
                  timestamp,
                );
              } catch (error) {
                logger.error(
                  LogSource.Events,
                  'CUSTOM_EVENTS',
                  `Failed to process breakout storage item: ${JSON.stringify(item)}`,
                  {error},
                );
              }
            });
          }
        } catch (error) {
          logger.error(
            LogSource.Events,
            'CUSTOM_EVENTS',
            'error while dispatching through breakout eventDispatcher',
            {error},
          );
        }
      }
    };

    const handleMessageEvent = (message: MessageEvent) => {
      console.log('supriya current breakout message channel: ', channelName);
      console.log('supriya breakout message event is', message);
      // message - 1 (channel)
      if (message.channelType === nativeChannelTypeMapping.MESSAGE) {
        // here the channel name will be the channel name
        logger.debug(
          LogSource.Events,
          'CUSTOM_EVENTS',
          'breakout messageEvent of type [1 - CHANNEL] (channelMessageReceived)',
          message,
        );
        const {
          publisher: uid,
          channelName,
          message: text,
          timestamp: ts,
        } = message;
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
              'error while dispatching through breakout eventDispatcher',
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
          'breakout messageEvent of type [3- USER] (messageReceived)',
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
            'error while dispatching through breakout eventDispatcher',
            {error},
          );
        }
      }
    };

    // Register directly with RTMCore for breakout room
    registerCallbacks(channelName, {
      storage: handleStorageEvent,
      message: handleMessageEvent,
    });
    console.log('RTMConfigureBreakoutRoom: Registered breakout room handlers for', channelName);

    return () => {
      unregisterCallbacks(channelName);
      console.log('RTMConfigureBreakoutRoom: Unregistered breakout room handlers for', channelName);
    };
  }, [client, channelName]);

  useAsyncEffect(async () => {
    try {
      if (isLoggedIn && callActive) {
        await init();
      }
    } catch (error) {
      logger.error(LogSource.AgoraSDK, 'Log', 'RTM breakout init failed', {error});
    }
    return async () => {
      logger.log(LogSource.AgoraSDK, 'API', 'RTM breakout destroy done');
      if (isIOS() || isAndroid()) {
        EventUtils.clear();
      }
      setHasUserJoinedRTM(false);
      setIsInitialQueueCompleted(false);
      logger.debug(LogSource.AgoraSDK, 'Log', 'RTM breakout cleanup done');
    };
  }, [isLoggedIn, callActive, channelName]);

  // Provide context data to children
  const contextValue: RTMBreakoutRoomData = {
    hasUserJoinedRTM,
    isInitialQueueCompleted,
    onlineUsersCount,
    rtmInitTimstamp,
  };

  return (
    <RTMBreakoutRoomContext.Provider value={contextValue}>
      {children}
    </RTMBreakoutRoomContext.Provider>
  );
};

export default RTMConfigureBreakoutRoomProvider;