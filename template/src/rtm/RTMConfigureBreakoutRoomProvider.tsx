/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
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
import {
  type GetChannelMetadataResponse,
  type GetOnlineUsersResponse,
  type MessageEvent,
  type PresenceEvent,
  type SetOrUpdateUserMetadataOptions,
  type StorageEvent,
  type GetUserMetadataResponse,
  type RTMClient,
} from 'agora-react-native-rtm';
import {
  ContentInterface,
  DispatchContext,
  useLocalUid,
} from '../../agora-rn-uikit';
import ChatContext from '../components/ChatContext';
import {Platform} from 'react-native';
import {backOff} from 'exponential-backoff';
import {isAndroid, isIOS} from '../utils/common';
import {useContent} from 'customization-api';
import {
  safeJsonParse,
  timeNow,
  hasJsonStructure,
  getMessageTime,
  get32BitUid,
  isEventForActiveChannel,
} from '../rtm/utils';
import {EventUtils, EventsQueue} from '../rtm-events';
import {EventNames} from '../rtm-events';
import {PersistanceLevel} from '../rtm-events-api';
import RTMEngine from '../rtm/RTMEngine';
import {filterObject} from '../utils';
import SDKEvents from '../utils/SdkEvents';
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
import {RECORDING_BOT_UID} from '../utils/constants';
import {
  nativeChannelTypeMapping,
  nativePresenceEventTypeMapping,
  nativeStorageEventTypeMapping,
} from '../../bridge/rtm/web/Types';
import {useRTMCore} from '../rtm/RTMCoreProvider';
import {
  RTM_ROOMS,
  RTM_EVENTS_ATTRIBUTES_TO_RESET_WHEN_ROOM_CHANGES,
} from './constants';
import {useUserGlobalPreferences} from '../components/UserGlobalPreferenceProvider';
import {ToggleState} from '../../agora-rn-uikit';
import useMuteToggleLocal from '../utils/useMuteToggleLocal';
import {useRtc} from 'customization-api';
import {
  fetchAllOnlineMembersWithRetries,
  fetchUserAttributesWithBackoffRetry,
  processUserUidAttributes,
} from './rtm-presence-utils';

export enum UserType {
  ScreenShare = 'screenshare',
}

const eventTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// RTM Breakout Room Context
export interface RTMBreakoutRoomData {
  hasUserJoinedRTM: boolean;
  isInitialQueueCompleted: boolean;
  onlineUsersCount: number;
  rtmInitTimstamp: number;
  syncUserState: (uid: number, data: Partial<ContentInterface>) => void;
}

const RTMBreakoutRoomContext = createContext<RTMBreakoutRoomData>({
  hasUserJoinedRTM: false,
  isInitialQueueCompleted: false,
  onlineUsersCount: 0,
  rtmInitTimstamp: 0,
  syncUserState: () => {},
});

export const useRTMConfigureBreakout = () => {
  const context = useContext(RTMBreakoutRoomContext);
  if (!context) {
    throw new Error(
      'useRTMConfigureBreakout must be used within RTMConfigureBreakoutRoomProvider',
    );
  }
  return context;
};

interface RTMConfigureBreakoutRoomProviderProps {
  callActive: boolean;
  children: React.ReactNode;
  currentChannel: string;
}

const RTMConfigureBreakoutRoomProvider = (
  props: RTMConfigureBreakoutRoomProviderProps,
) => {
  const rtmInitTimstamp = new Date().getTime();
  const localUid = useLocalUid();
  const {callActive, currentChannel} = props;
  const {dispatch} = useContext(DispatchContext);
  const {defaultContent, activeUids} = useContent();
  const {
    waitingRoomStatus,
    data: {isHost},
  } = useRoomInfo();
  const {applyUserPreferences, syncUserPreferences} =
    useUserGlobalPreferences();
  const toggleMute = useMuteToggleLocal();
  const [hasUserJoinedRTM, setHasUserJoinedRTM] = useState<boolean>(false);
  const [isInitialQueueCompleted, setIsInitialQueueCompleted] = useState(false);
  const [onlineUsersCount, setTotalOnlineUsers] = useState<number>(0);
  const timerValueRef: any = useRef(5);
  // Track RTM connection state (equivalent to v1.5x connectionState check)
  const {client, isLoggedIn, registerCallbacks, unregisterCallbacks} =
    useRTMCore();
  const {rtcTracksReady} = useRtc();
  const hasInitRef = useRef(false);

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

  const defaultContentRef = useRef(defaultContent);
  useEffect(() => {
    defaultContentRef.current = defaultContent;
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

  // Apply user preferences when breakout room mounts
  useEffect(() => {
    if (rtcTracksReady) {
      console.log('supriya-permissions', defaultContentRef.current[localUid]);
      applyUserPreferences(defaultContentRef.current[localUid], toggleMute);
    }
  }, [rtcTracksReady]);

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

  const syncUserState = useCallback(
    (uid: number, data: Partial<ContentInterface>) => {
      dispatch({type: 'UpdateRenderList', value: [uid, data]});
    },
    [dispatch],
  );

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

  const init = async () => {
    await subscribeChannel();
    setHasUserJoinedRTM(true);
    await runQueuedEvents();
    setIsInitialQueueCompleted(true);
    logger.log(LogSource.AgoraSDK, 'Log', 'RTM queued events finished running');
  };

  const subscribeChannel = async () => {
    try {
      if (RTMEngine.getInstance().allChannels.includes(currentChannel)) {
        logger.debug(
          LogSource.AgoraSDK,
          'Log',
          '🚫  RTM already subscribed channel skipping',
          currentChannel,
        );
      } else {
        await client.subscribe(currentChannel, {
          withMessage: true,
          withPresence: true,
          withMetadata: true,
          withLock: false,
        });
        logger.log(LogSource.AgoraSDK, 'API', 'RTM subscribeChannel', {
          data: currentChannel,
        });

        // Set channel ID AFTER successful subscribe (like v1.5x)
        console.log('setting primary channel', currentChannel);
        RTMEngine.getInstance().addChannel(RTM_ROOMS.BREAKOUT, currentChannel);
        RTMEngine.getInstance().setActiveChannel(RTM_ROOMS.BREAKOUT);

        // Clear room-scoped RTM attributes to ensure fresh state
        try {
          await client?.storage.removeUserMetadata({
            data: {
              items: RTM_EVENTS_ATTRIBUTES_TO_RESET_WHEN_ROOM_CHANGES.map(
                key => ({
                  key,
                  value: '',
                }),
              ),
            },
          });
        } catch (error) {
          logger.error(
            LogSource.AgoraSDK,
            'RTMConfigure',
            'Failed to clear room-scoped attributes in breakout room',
            {error},
          );
        }

        logger.log(
          LogSource.AgoraSDK,
          'API',
          'RTM setChannelId as subscribe is successful',
          currentChannel,
        );
        logger.debug(
          LogSource.SDK,
          'Event',
          'Emitting rtm joined',
          currentChannel,
        );
        timerValueRef.current = 5;
        await getMembers();
        await readAllChannelAttributes();
        logger.log(
          LogSource.AgoraSDK,
          'Log',
          'RTM readAllChannelAttributes and getMembers done',
        );
      }
    } catch (error) {
      logger.error(
        LogSource.AgoraSDK,
        'Log',
        'RTM subscribeChannel failed..Trying again',
        {error},
      );
      setTimeout(async () => {
        // Cap the timer to prevent excessive delays (max 30 seconds)
        timerValueRef.current = Math.min(timerValueRef.current * 2, 30);
        subscribeChannel();
      }, timerValueRef.current * 1000);
    }
  };

  const getMembers = async () => {
    try {
      logger.log(
        LogSource.AgoraSDK,
        'API',
        'RTM presence.getOnlineUsers(getMembers) start',
      );
      const {allMembers, totalOccupancy} =
        await fetchAllOnlineMembersWithRetries(client, currentChannel);

      // await client.presence
      //   .getOnlineUsers(currentChannel, 1)
      //   .then(async (data: GetOnlineUsersResponse) => {
      //     logger.log(
      //       LogSource.AgoraSDK,
      //       'API',
      //       'RTM presence.getOnlineUsers data received',
      //       data,
      //     );
      await Promise.all(
        allMembers.map(async member => {
          try {
            const backoffAttributes = await fetchUserAttributesWithBackoffRetry(
              client,
              member.userId,
              {
                isMounted: () => isRTMMounted.current,
                // 👈 called later if name arrives
                onNameFound: retryAttr =>
                  processUserUidAttributes(
                    retryAttr,
                    member.userId,
                    syncUserState,
                  ),
              },
            );
            console.log(
              'supriya rtm [breakout] attr backoffAttributes',
              backoffAttributes,
            );
            processUserUidAttributes(
              backoffAttributes,
              member.userId,
              syncUserState,
            );
            // setting screenshare data
            // name of the screenUid, isActive: false, (when the user starts screensharing it becomes true)
            // isActive to identify all active screenshare users in the call
            backoffAttributes?.items?.forEach(item => {
              try {
                if (hasJsonStructure(item.value as string)) {
                  const data = {
                    evt: item.key, // Use item.key instead of key
                    value: item.value, // Use item.value instead of value
                  };
                  // TODOSUP: Add the data to queue, dont add same mulitple events, use set so as to not repeat events
                  EventsQueue.enqueue({
                    data: data,
                    uid: member.userId,
                    ts: timeNow(),
                  });
                }
              } catch (error) {
                logger.error(
                  LogSource.AgoraSDK,
                  'Log',
                  `RTM Failed to process user attribute item for ${
                    member.userId
                  }: ${JSON.stringify(item)}`,
                  {error},
                );
                // Continue processing other items
              }
            });
          } catch (e) {
            logger.error(
              LogSource.AgoraSDK,
              'Log',
              `RTM Could not retrieve name of ${member.userId}`,
              {error: e},
            );
          }
        }),
      );
      logger.debug(
        LogSource.AgoraSDK,
        'Log',
        'RTM fetched all data and user attr...RTM init done',
      );
      // });
      timerValueRef.current = 5;
    } catch (error) {
      setTimeout(async () => {
        // Cap the timer to prevent excessive delays (max 30 seconds)
        timerValueRef.current = Math.min(timerValueRef.current * 2, 30);
        await getMembers();
      }, timerValueRef.current * 1000);
    }
  };

  const readAllChannelAttributes = async () => {
    try {
      await client.storage
        .getChannelMetadata(currentChannel, 1)
        .then(async (data: GetChannelMetadataResponse) => {
          for (const item of data.items) {
            try {
              const {key, value, authorUserId, updateTs} = item;
              if (hasJsonStructure(value as string)) {
                const evtData = {
                  evt: key,
                  value,
                };
                // TODOSUP: Add the data to queue, dont add same mulitple events, use set so as to not repeat events
                EventsQueue.enqueue({
                  data: evtData,
                  uid: authorUserId,
                  ts: updateTs,
                });
              }
            } catch (error) {
              logger.error(
                LogSource.AgoraSDK,
                'Log',
                `RTM Failed to process channel attribute item: ${JSON.stringify(
                  item,
                )}`,
                {error},
              );
              // Continue processing other items
            }
          }
          logger.log(
            LogSource.AgoraSDK,
            'API',
            'RTM storage.getChannelMetadata data received',
            data,
          );
        });
      timerValueRef.current = 5;
    } catch (error) {
      setTimeout(async () => {
        // Cap the timer to prevent excessive delays (max 30 seconds)
        timerValueRef.current = Math.min(timerValueRef.current * 2, 30);
        await readAllChannelAttributes();
      }, timerValueRef.current * 1000);
    }
  };

  // const fetchUserAttributesWithBackoffRetry = async (
  //   userId: string,
  // ): Promise<GetUserMetadataResponse> => {
  //   return backOff(
  //     async () => {
  //       logger.log(
  //         LogSource.AgoraSDK,
  //         'API',
  //         `RTM fetching getUserMetadata for member ${userId}`,
  //       );

  //       const attr: GetUserMetadataResponse =
  //         await client.storage.getUserMetadata({
  //           userId: userId,
  //         });

  //       if (!attr || !attr.items) {
  //         logger.log(
  //           LogSource.AgoraSDK,
  //           'API',
  //           'RTM attributes for member not found',
  //         );
  //         throw attr;
  //       }

  //       logger.log(
  //         LogSource.AgoraSDK,
  //         'API',
  //         `RTM getUserMetadata for member ${userId} received`,
  //         {attr},
  //       );

  //       if (attr.items && attr.items.length > 0) {
  //         return attr;
  //       } else {
  //         throw attr;
  //       }
  //     },
  //     {
  //       retry: (e, idx) => {
  //         logger.debug(
  //           LogSource.AgoraSDK,
  //           'Log',
  //           `RTM [retrying] Attempt ${idx}. Fetching ${userId}'s attributes`,
  //           e,
  //         );
  //         return true;
  //       },
  //     },
  //   );
  // };

  // const processUserUidAttributes = async (
  //   attr: GetUserMetadataResponse,
  //   userId: string,
  // ) => {
  //   try {
  //     console.log('[user attributes]:', {attr});
  //     const uid = parseInt(userId, 10);
  //     const screenUidItem = attr?.items?.find(item => item.key === 'screenUid');
  //     const isHostItem = attr?.items?.find(item => item.key === 'isHost');
  //     const nameItem = attr?.items?.find(item => item.key === 'name');
  //     const screenUid = screenUidItem?.value
  //       ? parseInt(screenUidItem.value, 10)
  //       : undefined;

  //     let userName = '';
  //     if (nameItem?.value) {
  //       try {
  //         const parsedValue = JSON.parse(nameItem.value);
  //         const payloadString = parsedValue.payload;
  //         if (payloadString) {
  //           const payload = JSON.parse(payloadString);
  //           userName = payload.name;
  //         }
  //       } catch (parseError) {}
  //     }

  //     //start - updating user data in rtc
  //     const userData = {
  //       screenUid: screenUid,
  //       //below thing for livestreaming
  //       type: uid === parseInt(RECORDING_BOT_UID, 10) ? 'bot' : 'rtc',
  //       uid,
  //       name: userName,
  //       offline: false,
  //       isHost: isHostItem?.value || false,
  //       lastMessageTimeStamp: 0,
  //     };
  //     console.log('new user joined', uid, userData);
  //     syncUserState(uid, userData);
  //     //end- updating user data in rtc

  //     //start - updating screenshare data in rtc
  //     if (screenUid) {
  //       const screenShareUser = {
  //         type: UserType.ScreenShare,
  //         parentUid: uid,
  //       };
  //       syncUserState(screenUid, screenShareUser);
  //     }
  //     //end - updating screenshare data in rtc
  //   } catch (e) {
  //     logger.error(
  //       LogSource.AgoraSDK,
  //       'Event',
  //       `RTM Failed to process user data for ${userId}`,
  //       {error: e},
  //     );
  //   }
  // };

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
    console.log('supriya rtm [BREAKOUT] dispatcher: ', data);

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

      console.log('supriya rtm [BREAKOUT] event data', data);
      console.log(
        'supriya rtm [BREAKOUT] _scope and _channelId: ',
        _scope,
        _channelId,
        currentChannel,
      );
      // Filter if its for this channel
      if (!isEventForActiveChannel(_scope, _channelId, currentChannel)) {
        return;
      }
      // Step 1: Set local attributes
      if (persistLevel === PersistanceLevel.Session) {
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
      // Step 2: Emit the event
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
              console.log('supriya-eventDispatcher item: ', item);
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

  const handlePresenceEvent = async (presence: PresenceEvent) => {
    // if (`${localUid}` === presence.publisher) {
    //   return;
    // }
    // remoteJoinChannel
    if (presence.type === nativePresenceEventTypeMapping.REMOTE_JOIN) {
      logger.log(
        LogSource.AgoraSDK,
        'Event',
        'RTM presenceEvent of type [3 - remoteJoin] (channelMemberJoined)',
      );
      const backoffAttributes = await fetchUserAttributesWithBackoffRetry(
        client,
        presence.publisher,
        {
          isMounted: () => isRTMMounted.current,
          // This is called later if name arrives and hence we process that attribute
          onNameFound: retryAttr =>
            processUserUidAttributes(
              retryAttr,
              presence.publisher,
              syncUserState,
            ),
        },
      );
      // This is called as soon as we receive any attributes
      processUserUidAttributes(
        backoffAttributes,
        presence.publisher,
        syncUserState,
      );
    }
    // remoteLeaveChannel
    if (presence.type === nativePresenceEventTypeMapping.REMOTE_LEAVE) {
      logger.log(
        LogSource.AgoraSDK,
        'Event',
        'RTM presenceEvent of type [4 - remoteLeave] (channelMemberLeft)',
        presence,
      );
      // Chat of left user becomes undefined. So don't cleanup
      const uid = presence?.publisher
        ? parseInt(presence.publisher, 10)
        : undefined;

      if (!uid) {
        return;
      }
      SDKEvents.emit('_rtm-left', uid);
      // updating the rtc data
      syncUserState(uid, {
        offline: true,
      });
    }
  };

  const handleMessageEvent = (message: MessageEvent) => {
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

  const unsubscribeAndCleanup = async (
    currentClient: RTMClient,
    channel: string,
  ) => {
    try {
      setHasUserJoinedRTM(false);
      setIsInitialQueueCompleted(false);
      currentClient.unsubscribe(channel);
      RTMEngine.getInstance().removeChannel(channel);
      logger.log(LogSource.AgoraSDK, 'API', 'RTM destroy done');
      if (isIOS() || isAndroid()) {
        EventUtils.clear();
      }
      logger.debug(LogSource.AgoraSDK, 'Log', 'RTM cleanup done');
    } catch (unsubscribeError) {
      console.log('supriya error while unsubscribing: ', unsubscribeError);
    }
  };

  useAsyncEffect(async () => {
    try {
      if (client && isLoggedIn && callActive && currentChannel) {
        hasInitRef.current = true;
        registerCallbacks(currentChannel, {
          storage: handleStorageEvent,
          presence: handlePresenceEvent,
          message: handleMessageEvent,
        });
        await init();
      }
    } catch (error) {
      logger.error(LogSource.AgoraSDK, 'Log', 'RTM init failed', {error});
    }
    return async () => {
      const currentClient = RTMEngine.getInstance().engine;
      hasInitRef.current = false;
      if (currentChannel) {
        unregisterCallbacks(currentChannel);
      }
      if (currentClient && callActive && isLoggedIn) {
        await unsubscribeAndCleanup(currentClient, currentChannel);
      }
    };
  }, [isLoggedIn, callActive, currentChannel, client]);

  const contextValue: RTMBreakoutRoomData = {
    hasUserJoinedRTM,
    isInitialQueueCompleted,
    onlineUsersCount,
    rtmInitTimstamp,
    syncUserState,
  };

  return (
    <RTMBreakoutRoomContext.Provider value={contextValue}>
      {props.children}
    </RTMBreakoutRoomContext.Provider>
  );
};

export default RTMConfigureBreakoutRoomProvider;
