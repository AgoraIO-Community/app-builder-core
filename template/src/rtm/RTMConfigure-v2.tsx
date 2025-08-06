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

import React, {useState, useContext, useEffect, useRef} from 'react';
import {
  type GetChannelMetadataResponse,
  type GetOnlineUsersResponse,
  type MessageEvent,
  type PresenceEvent,
  type StorageEvent,
  type GetUserMetadataResponse,
  type SetOrUpdateUserMetadataOptions,
  type Metadata,
} from 'agora-react-native-rtm';
import {
  ContentInterface,
  DispatchContext,
  PropsContext,
  useLocalUid,
} from '../../agora-rn-uikit';
import ChatContext from '../components/ChatContext';
import {Platform} from 'react-native';
import {backOff} from 'exponential-backoff';
import {isAndroid} from '../utils/common';
import {useContent} from 'customization-api';
import {
  safeJsonParse,
  timeNow,
  hasJsonStructure,
  getMessageTime,
  get32BitUid,
} from '../rtm/utils';
import {EventUtils, EventsQueue} from '../rtm-events';
import {PersistanceLevel} from '../rtm-events-api';
import {filterObject} from '../utils';
import SDKEvents from '../utils/SdkEvents';
import isSDK from '../utils/isSDK';
import {
  WaitingRoomStatus,
  useRoomInfo,
} from '../components/room-info/useRoomInfo';
import LocalEventEmitter, {
  LocalEventsEnum,
} from '../rtm-events-api/LocalEvents';
import {controlMessageEnum} from '../components/ChatContext';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import {RECORDING_BOT_UID} from '../utils/constants';
import {
  nativeChannelTypeMapping,
  nativePresenceEventTypeMapping,
  nativeStorageEventTypeMapping,
} from '../../bridge/rtm/web/Types';
import {useRTMCore} from './RTMCoreProvider';
import RTMEngine from './RTMEngine';

export enum UserType {
  ScreenShare = 'screenshare',
}

const eventTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

interface RTMConfigureProps {
  children: React.ReactNode;
  channelName: string;
  callActive: boolean;
}

const RTMConfigure = (props: RTMConfigureProps) => {
  const {channelName, callActive, children} = props;
  const {client, isLoggedIn} = useRTMCore();
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
  const timerValueRef: any = useRef(5);
  const rtmInitTimstamp = useRef(new Date().getTime());

  // Subscribe to main channel - traditional approach for core functionality
  useEffect(() => {
    if (!isLoggedIn || !channelName || !client || !callActive) {
      return;
    }
    const subscribeToMainChannel = async () => {
      try {
        logger.log(
          LogSource.AgoraSDK,
          'RTMConfigure',
          `Subscribing to main channel: ${channelName}`,
        );

        await client.subscribe(channelName, {
          withMessage: true,
          withPresence: true,
          withMetadata: true,
          withLock: false,
        });
        RTMEngine.getInstance().addChannel(channelName);
        logger.log(
          LogSource.AgoraSDK,
          'API',
          'RTM setChannelId as subscribe is successful',
          channelName,
        );

        logger.debug(
          LogSource.SDK,
          'Event',
          'Emitting rtm joined',
          channelName,
        );
        // @ts-ignore
        SDKEvents.emit('_rtm-joined', rtcProps.channel);
        timerValueRef.current = 5;
        await getMembers();
        await readAllChannelAttributes();
      } catch (error) {
        logger.error(
          LogSource.AgoraSDK,
          'RTMConfigure',
          '❌ Main channel subscription failed:',
          error,
        );
        setTimeout(async () => {
          // Cap the timer to prevent excessive delays (max 30 seconds)
          timerValueRef.current = Math.min(timerValueRef.current * 2, 30);
          subscribeToMainChannel();
        }, timerValueRef.current * 1000);
      }
    };

    const runQueuedEvents = async () => {
      try {
        while (!EventsQueue.isEmpty()) {
          const currEvt = EventsQueue.dequeue();
          await eventDispatcher(currEvt.data, `${currEvt.uid}`, currEvt.ts);
        }
      } catch (error) {
        logger.error(
          LogSource.AgoraSDK,
          'RTMConfigure',
          'Error running queued events',
          error,
        );
      }
    };
    timerValueRef.current = 5;
    subscribeToMainChannel();
    setHasUserJoinedRTM(true);
    await runQueuedEvents();
    setIsInitialQueueCompleted(true);
    return () => {
      // Cleanup: unsubscribe from main channel
      if (client && channelName) {
        client.unsubscribe(channelName).catch(error => {
          logger.warn(
            LogSource.AgoraSDK,
            'RTMConfigure',
            `Failed to unsubscribe from ${channelName}:`,
            error,
          );
        });
        logger.log(
          LogSource.AgoraSDK,
          'RTMConfigure',
          `🔌 Unsubscribed from main channel: ${channelName}`,
        );
      }
    };
  }, [isLoggedIn, channelName, client, callActive]);

  /**
   * State refs for event callbacks
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

  // Cleanup timeouts on unmount
  const isRTMMounted = useRef(true);
  useEffect(() => {
    return () => {
      isRTMMounted.current = false;
      for (const timeout of eventTimeouts.values()) {
        clearTimeout(timeout);
      }
      eventTimeouts.clear();
    };
  }, []);

  // Set online users count
  useEffect(() => {
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

  // Handle channel joined - fetch initial data
  const handleChannelJoined = async () => {
    try {
      await Promise.all([getMembers(), readAllChannelAttributes()]);
      await runQueuedEvents();
      setIsInitialQueueCompleted(true);
      logger.log(
        LogSource.AgoraSDK,
        'RTMConfigure',
        'Channel initialization completed',
      );
    } catch (error) {
      logger.error(
        LogSource.AgoraSDK,
        'RTMConfigure',
        'Channel initialization failed',
        error,
      );
    }
  };

  const getMembers = async () => {
    if (!client || !channelName) {
      return;
    }
    try {
      const data: GetOnlineUsersResponse = await client.presence.getOnlineUsers(
        channelName,
        1,
      );
      logger.log(
        LogSource.AgoraSDK,
        'RTMConfigure',
        'Online users fetched',
        data,
      );

      await Promise.all(
        data.occupants?.map(async member => {
          try {
            const backoffAttributes = await fetchUserAttributesWithBackoffRetry(
              member.userId,
            );
            await processUserUidAttributes(backoffAttributes, member.userId);

            // Add user attributes to queue for processing
            backoffAttributes?.items?.forEach(item => {
              try {
                if (hasJsonStructure(item.value as string)) {
                  const eventData = {
                    evt: item.key,
                    value: item.value,
                  };
                  EventsQueue.enqueue({
                    data: eventData,
                    uid: member.userId,
                    ts: timeNow(),
                  });
                }
              } catch (error) {
                logger.error(
                  LogSource.AgoraSDK,
                  'RTMConfigure',
                  `Failed to process user attribute for ${member.userId}`,
                  error,
                );
              }
            });
          } catch (error) {
            logger.error(
              LogSource.AgoraSDK,
              'RTMConfigure',
              `Could not retrieve data for ${member.userId}`,
              error,
            );
          }
        }) || [],
      );
    } catch (error) {
      logger.error(
        LogSource.AgoraSDK,
        'RTMConfigure',
        'Failed to get members',
        error,
      );
    }
  };

  const readAllChannelAttributes = async () => {
    if (!client || !channelName) {
      return;
    }
    try {
      const data: GetChannelMetadataResponse =
        await client.storage.getChannelMetadata(channelName, 1);

      for (const item of data.items) {
        try {
          const {key, value, authorUserId, updateTs} = item;
          if (hasJsonStructure(value as string)) {
            const evtData = {
              evt: key,
              value,
            };
            EventsQueue.enqueue({
              data: evtData,
              uid: authorUserId,
              ts: updateTs,
            });
          }
        } catch (error) {
          logger.error(
            LogSource.AgoraSDK,
            'RTMConfigure',
            `Failed to process channel attribute: ${JSON.stringify(item)}`,
            error,
          );
        }
      }
      logger.log(
        LogSource.AgoraSDK,
        'RTMConfigure',
        'Channel attributes read successfully',
        data,
      );
    } catch (error) {
      logger.error(
        LogSource.AgoraSDK,
        'RTMConfigure',
        'Failed to read channel attributes',
        error,
      );
    }
  };

  const fetchUserAttributesWithBackoffRetry = async (
    userId: string,
  ): Promise<GetUserMetadataResponse> => {
    if (!client) throw new Error('RTM client not available');

    return backOff(
      async () => {
        const attr: GetUserMetadataResponse =
          await client.storage.getUserMetadata({
            userId: userId,
          });

        if (!attr || !attr.items || attr.items.length === 0) {
          throw new Error('No attributes found');
        }

        return attr;
      },
      {
        retry: (e, idx) => {
          logger.debug(
            LogSource.AgoraSDK,
            'RTMConfigure',
            `Retrying user attributes fetch for ${userId}, attempt ${idx}`,
            e,
          );
          return true;
        },
      },
    );
  };

  const processUserUidAttributes = async (
    attr: GetUserMetadataResponse,
    userId: string,
  ) => {
    try {
      const uid = parseInt(userId, 10);
      const screenUidItem = attr?.items?.find(item => item.key === 'screenUid');
      const isHostItem = attr?.items?.find(item => item.key === 'isHost');
      const screenUid = screenUidItem?.value
        ? parseInt(screenUidItem.value, 10)
        : undefined;

      // Update user data in RTC
      const userData = {
        screenUid: screenUid,
        type: uid === parseInt(RECORDING_BOT_UID, 10) ? 'bot' : 'rtc',
        uid,
        offline: false,
        isHost: isHostItem?.value === 'true',
        lastMessageTimeStamp: 0,
      };
      updateRenderListState(uid, userData);

      // Update screenshare data in RTC
      if (screenUid) {
        const screenShareUser = {
          type: UserType.ScreenShare,
          parentUid: uid,
        };
        updateRenderListState(screenUid, screenShareUser);
      }
    } catch (error) {
      logger.error(
        LogSource.AgoraSDK,
        'RTMConfigure',
        `Failed to process user data for ${userId}`,
        error,
      );
    }
  };

  const updateRenderListState = (
    uid: number,
    data: Partial<ContentInterface>,
  ) => {
    dispatch({type: 'UpdateRenderList', value: [uid, data]});
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
          LogSource.AgoraSDK,
          'RTMConfigure',
          'Failed to parse event value',
          error,
        );
        return;
      }

      const {payload, persistLevel, source} = parsedValue;

      // Set local attributes if needed
      if (persistLevel === PersistanceLevel.Session && client) {
        const rtmAttribute = {key: evt, value: value};
        const options: SetOrUpdateUserMetadataOptions = {
          userId: `${localUid}`,
        };
        await client.storage.setUserMetadata(
          {
            items: [rtmAttribute],
          },
          options,
        );
      }

      // Emit the event
      EventUtils.emitEvent(evt, source, {payload, persistLevel, sender, ts});

      // Handle name events with timeout
      if (evt === 'name') {
        if (eventTimeouts.has(sender)) {
          clearTimeout(eventTimeouts.get(sender)!);
        }
        const timeout = setTimeout(() => {
          if (!isRTMMounted.current) {
            return;
          }
          EventUtils.emitEvent(evt, source, {
            payload,
            persistLevel,
            sender,
            ts,
          });
          eventTimeouts.delete(sender);
        }, 200);
        eventTimeouts.set(sender, timeout);
      }
    } catch (error) {
      logger.error(
        LogSource.AgoraSDK,
        'RTMConfigure',
        'Error dispatching event',
        error,
      );
    }
  };

  // Event listeners setup
  useEffect(() => {
    if (!client) {
      return;
    }

    const handleStorageEvent = (storage: StorageEvent) => {
      if (
        storage.eventType === nativeStorageEventTypeMapping.SET ||
        storage.eventType === nativeStorageEventTypeMapping.UPDATE
      ) {
        try {
          if (storage.data?.items && Array.isArray(storage.data.items)) {
            storage.data.items.forEach(item => {
              try {
                if (!item || !item.key) return;
                const {key, value, authorUserId, updateTs} = item;
                const timestamp = getMessageTime(updateTs);
                const sender = Platform.OS
                  ? get32BitUid(authorUserId)
                  : parseInt(authorUserId, 10);
                eventDispatcher({evt: key, value}, `${sender}`, timestamp);
              } catch (error) {
                logger.error(
                  LogSource.AgoraSDK,
                  'RTMConfigure',
                  'Failed to process storage item',
                  error,
                );
              }
            });
          }
        } catch (error) {
          logger.error(
            LogSource.AgoraSDK,
            'RTMConfigure',
            'Error handling storage event',
            error,
          );
        }
      }
    };

    const handlePresenceEvent = async (presence: PresenceEvent) => {
      if (`${localUid}` === presence.publisher) {
        return;
      }

      if (presence.type === nativePresenceEventTypeMapping.REMOTE_JOIN) {
        logger.log(
          LogSource.AgoraSDK,
          'RTMConfigure',
          'Remote user joined',
          presence,
        );
        try {
          const backoffAttributes = await fetchUserAttributesWithBackoffRetry(
            presence.publisher,
          );
          await processUserUidAttributes(backoffAttributes, presence.publisher);
        } catch (error) {
          logger.error(
            LogSource.AgoraSDK,
            'RTMConfigure',
            'Failed to process joined user',
            error,
          );
        }
      }

      if (presence.type === nativePresenceEventTypeMapping.REMOTE_LEAVE) {
        logger.log(
          LogSource.AgoraSDK,
          'RTMConfigure',
          'Remote user left',
          presence,
        );
        const uid = presence?.publisher
          ? parseInt(presence.publisher, 10)
          : undefined;
        if (uid) {
          SDKEvents.emit('_rtm-left', uid);
          updateRenderListState(uid, {offline: true});
        }
      }
    };

    const handleMessageEvent = (message: MessageEvent) => {
      if (`${localUid}` === message.publisher) {
        return;
      }

      if (message.channelType === nativeChannelTypeMapping.MESSAGE) {
        const {
          publisher: uid,
          channelName: msgChannelName,
          message: text,
          timestamp: ts,
        } = message;

        // Whiteboard upload handling
        if (parseInt(uid, 10) === 1010101) {
          const [err, res] = safeJsonParse(text);
          if (!err && res?.data?.data?.images) {
            LocalEventEmitter.emit(
              LocalEventsEnum.WHITEBOARD_FILE_UPLOAD,
              res.data.data.images,
            );
          }
          return;
        }

        // Regular messages
        const [err, msg] = safeJsonParse(text);
        if (err) {
          logger.error(
            LogSource.AgoraSDK,
            'RTMConfigure',
            'Failed to parse message',
            err,
          );
          return;
        }

        const timestamp = getMessageTime(ts);
        const sender = Platform.OS ? get32BitUid(uid) : parseInt(uid, 10);

        if (msgChannelName === channelName) {
          eventDispatcher(msg, `${sender}`, timestamp);
        }
      }

      if (message.channelType === nativeChannelTypeMapping.USER) {
        const {publisher: peerId, timestamp: ts, message: text} = message;
        const [err, msg] = safeJsonParse(text);
        if (err) {
          logger.error(
            LogSource.AgoraSDK,
            'RTMConfigure',
            'Failed to parse user message',
            err,
          );
          return;
        }

        const timestamp = getMessageTime(ts);
        const sender = isAndroid() ? get32BitUid(peerId) : parseInt(peerId, 10);
        eventDispatcher(msg, `${sender}`, timestamp);
      }
    };

    // Add event listeners
    client.addEventListener('storage', handleStorageEvent);
    client.addEventListener('presence', handlePresenceEvent);
    client.addEventListener('message', handleMessageEvent);

    return () => {
      // Remove event listeners
      client.removeEventListener('storage', handleStorageEvent);
      client.removeEventListener('presence', handlePresenceEvent);
      client.removeEventListener('message', handleMessageEvent);
    };
  }, [client, channelName, localUid]);

  return (
    <ChatContext.Provider
      value={{
        isInitialQueueCompleted,
        rtmInitTimstamp: rtmInitTimstamp.current,
        hasUserJoinedRTM,
        engine: client,
        localUid: localUid,
        onlineUsersCount,
      }}>
      {children}
    </ChatContext.Provider>
  );
};

export default RTMConfigure;
