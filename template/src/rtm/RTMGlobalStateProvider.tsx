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

import React, {useState, useEffect, useRef} from 'react';
import {
  type GetChannelMetadataResponse,
  type GetOnlineUsersResponse,
  type GetUserMetadataResponse,
  type PresenceEvent,
  type StorageEvent,
  type SetOrUpdateUserMetadataOptions,
  type MessageEvent,
} from 'agora-react-native-rtm';
import {backOff} from 'exponential-backoff';
import {timeNow, hasJsonStructure} from '../rtm/utils';
import {EventsQueue} from '../rtm-events';
import {PersistanceLevel} from '../rtm-events-api';
import RTMEngine from '../rtm/RTMEngine';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import {RECORDING_BOT_UID} from '../utils/constants';
import {useRTMCore} from './RTMCoreProvider';
import {
  ContentInterface,
  RtcPropsInterface,
  useLocalUid,
} from '../../agora-rn-uikit';
import {
  nativePresenceEventTypeMapping,
  nativeStorageEventTypeMapping,
} from '../../bridge/rtm/web/Types';
import {RTM_ROOMS} from './constants';

export enum UserType {
  ScreenShare = 'screenshare',
}

const eventTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

interface RTMGlobalStateProviderProps {
  children: React.ReactNode;
  mainChannelRtcProps: Partial<RtcPropsInterface>;
}

// Context for message and storage handler registration
const RTMGlobalStateContext = React.createContext<{
  mainRoomUsers: {[uid: number]: ContentInterface};
  setMainRoomUsers: React.Dispatch<
    React.SetStateAction<{[uid: number]: ContentInterface}>
  >;
  registerMainChannelMessageHandler: (
    handler: (message: MessageEvent) => void,
  ) => void;
  unregisterMainChannelMessageHandler: () => void;
  registerMainChannelStorageHandler: (
    handler: (storage: StorageEvent) => void,
  ) => void;
  unregisterMainChannelStorageHandler: () => void;
}>({
  mainRoomUsers: {},
  setMainRoomUsers: () => {},
  registerMainChannelMessageHandler: () => {},
  unregisterMainChannelMessageHandler: () => {},
  registerMainChannelStorageHandler: () => {},
  unregisterMainChannelStorageHandler: () => {},
});

const RTMGlobalStateProvider: React.FC<RTMGlobalStateProviderProps> = ({
  children,
  mainChannelRtcProps,
}) => {
  const mainChannelName = mainChannelRtcProps.channel;
  const localUid = useLocalUid();
  const {client, isLoggedIn, registerCallbacks, unregisterCallbacks} =
    useRTMCore();
  // Main room users
  const [mainRoomUsers, setMainRoomUsers] = useState<{
    [uid: number]: ContentInterface;
  }>({});

  const hasInitRef = useRef(false);
  // Timeout Refs
  const subscribeTimerRef: any = useRef(5);
  const channelAttributesTimerRef: any = useRef(5);
  const membersTimerRef: any = useRef(5);
  const subscribeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const channelAttributesTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const membersTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isRTMMounted = useRef(true);

  // Message handler registration for main channel
  const messageHandlerRef = useRef<((message: MessageEvent) => void) | null>(
    null,
  );
  const registerMainChannelMessageHandler = (
    handler: (message: MessageEvent) => void,
  ) => {
    console.log(
      'rudra-core-client: RTM registering main channel message handler',
    );
    if (messageHandlerRef.current) {
      console.warn(
        'RTMGlobalStateProvider: Overwriting an existing main channel message handler!',
      );
    }
    messageHandlerRef.current = handler;
  };

  const unregisterMainChannelMessageHandler = () => {
    console.log(
      'rudra-core-client: RTM unregistering main channel message handler',
    );
    messageHandlerRef.current = null;
  };

  // Storage handler registration for main channel
  const storageHandlerRef = useRef<((storage: StorageEvent) => void) | null>(
    null,
  );

  const registerMainChannelStorageHandler = (
    handler: (storage: StorageEvent) => void,
  ) => {
    console.log(
      'rudra-core-client: RTM registering main channel storage handler',
    );
    if (storageHandlerRef.current) {
      console.warn(
        'RTMGlobalStateProvider: Overwriting an existing main channel storage handler!',
      );
    }
    storageHandlerRef.current = handler;
  };

  const unregisterMainChannelStorageHandler = () => {
    console.log(
      'rudra-core-client: RTM unregistering main channel storage handler',
    );
    storageHandlerRef.current = null;
  };

  useEffect(() => {
    return () => {
      isRTMMounted.current = false;
      // Clear all pending timeouts on unmount
      for (const timeout of eventTimeouts.values()) {
        clearTimeout(timeout);
      }
      eventTimeouts.clear();

      // Clear timer-based retry timeouts
      if (subscribeTimeoutRef.current) {
        clearTimeout(subscribeTimeoutRef.current);
        subscribeTimeoutRef.current = null;
      }
      if (channelAttributesTimeoutRef.current) {
        clearTimeout(channelAttributesTimeoutRef.current);
        channelAttributesTimeoutRef.current = null;
      }
      if (membersTimeoutRef.current) {
        clearTimeout(membersTimeoutRef.current);
        membersTimeoutRef.current = null;
      }
    };
  }, []);

  const init = async () => {
    try {
      console.log('rudra-core-client: Starting RTM init for main channel');
      await subscribeChannel();
      await getMembersWithAttributes();
      await getChannelAttributes();
      console.log('rudra-core-client: RTM init completed successfully');
    } catch (error) {
      console.log('rudra-core-client: RTM init failed', error);
    }
  };

  const subscribeChannel = async () => {
    try {
      if (RTMEngine.getInstance().allChannels.includes(mainChannelName)) {
        console.log('rudra- main channel already subsribed');
      } else {
        console.log('rudra- subscribing...');
        await client.subscribe(mainChannelName, {
          withMessage: true,
          withPresence: true,
          withMetadata: true,
          withLock: false,
        });
        console.log('rudra-  subscribed main channel', mainChannelName);

        RTMEngine.getInstance().addChannel(RTM_ROOMS.MAIN, mainChannelName);
        subscribeTimerRef.current = 5;
        // Clear any pending retry timeout since we succeeded
        if (subscribeTimeoutRef.current) {
          clearTimeout(subscribeTimeoutRef.current);
          subscribeTimeoutRef.current = null;
        }
        console.log('rudra-  added to rtm engine');
      }
    } catch (error) {
      console.log(
        'rudra-core-client: RTM subscribeChannel failed..Trying again',
        error,
      );
      subscribeTimeoutRef.current = setTimeout(async () => {
        // Cap the timer to prevent excessive delays (max 30 seconds)
        subscribeTimerRef.current = Math.min(subscribeTimerRef.current * 2, 30);
        subscribeChannel();
      }, subscribeTimerRef.current * 1000);
    }
  };

  const getChannelAttributes = async () => {
    try {
      await client.storage
        .getChannelMetadata(mainChannelName, 1)
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
              console.log(
                'rudra-core-client: RTM Failed to process channel attribute item',
                item,
                error,
              );
              // Continue processing other items
            }
          }
          console.log(
            'rudra-core-client: RTM storage.getChannelMetadata data received',
            data,
          );
        });
      channelAttributesTimerRef.current = 5;
      // Clear any pending retry timeout since we succeeded
      if (channelAttributesTimeoutRef.current) {
        clearTimeout(channelAttributesTimeoutRef.current);
        channelAttributesTimeoutRef.current = null;
      }
    } catch (error) {
      channelAttributesTimeoutRef.current = setTimeout(async () => {
        // Cap the timer to prevent excessive delays (max 30 seconds)
        channelAttributesTimerRef.current = Math.min(
          channelAttributesTimerRef.current * 2,
          30,
        );
        await getChannelAttributes();
      }, channelAttributesTimerRef.current * 1000);
    }
  };

  const getMembersWithAttributes = async () => {
    try {
      console.log(
        'rudra-core-client: RTM presence.getOnlineUsers(getMembers) start',
      );
      await client.presence
        .getOnlineUsers(mainChannelName, 1)
        .then(async (data: GetOnlineUsersResponse) => {
          console.log(
            'rudra-core-client: RTM presence.getOnlineUsers data received',
            data,
          );
          await Promise.all(
            data.occupants?.map(async member => {
              try {
                const backoffAttributes =
                  await fetchUserAttributesWithBackoffRetry(member.userId);

                await processUserUidAttributes(
                  backoffAttributes,
                  member.userId,
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
                    console.log(
                      'rudra-core-client: RTM Failed to process user attribute item for',
                      member.userId,
                      item,
                      error,
                    );
                    // Continue processing other items
                  }
                });
              } catch (e) {
                console.log(
                  'rudra-core-client: RTM Could not retrieve name of',
                  member.userId,
                  e,
                );
              }
            }),
          );
          membersTimerRef.current = 5;
          // Clear any pending retry timeout since we succeeded
          if (membersTimeoutRef.current) {
            clearTimeout(membersTimeoutRef.current);
            membersTimeoutRef.current = null;
          }
          console.log(
            'rudra-core-client: RTM fetched all data and user attr...RTM init done',
          );
        });
    } catch (error) {
      membersTimeoutRef.current = setTimeout(async () => {
        // Cap the timer to prevent excessive delays (max 30 seconds)
        membersTimerRef.current = Math.min(membersTimerRef.current * 2, 30);
        await getMembersWithAttributes();
      }, membersTimerRef.current * 1000);
    }
  };

  const fetchUserAttributesWithBackoffRetry = async (
    userId: string,
  ): Promise<GetUserMetadataResponse> => {
    return backOff(
      async () => {
        console.log(
          'rudra-core-client: RTM fetching getUserMetadata for member',
          userId,
        );

        const attr: GetUserMetadataResponse =
          await client.storage.getUserMetadata({
            userId: userId,
          });

        if (!attr || !attr.items) {
          console.log('rudra-core-client: RTM attributes for member not found');
          throw attr;
        }

        console.log(
          'rudra-core-client: RTM getUserMetadata for member received',
          userId,
          attr,
        );

        if (attr.items && attr.items.length > 0) {
          return attr;
        } else {
          throw attr;
        }
      },
      {
        retry: (e, idx) => {
          console.log(
            'rudra-core-client: RTM [retrying] Attempt',
            idx,
            'Fetching',
            userId,
            'attributes',
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
      console.log('rudra-core-client: [user attributes]:', attr);
      const uid = parseInt(userId, 10);
      const screenUidItem = attr?.items?.find(item => item.key === 'screenUid');
      const isHostItem = attr?.items?.find(item => item.key === 'isHost');
      const screenUid = screenUidItem?.value
        ? parseInt(screenUidItem.value, 10)
        : undefined;

      //start - updating user data in rtc
      const userData = {
        screenUid: screenUid,
        //below thing for livestreaming
        type: uid === parseInt(RECORDING_BOT_UID, 10) ? 'bot' : 'rtc',
        uid,
        offline: false,
        isHost: isHostItem?.value || false,
        lastMessageTimeStamp: 0,
      };
      console.log('rudra-core-client: new user joined', uid, userData);
      setMainRoomUsers(prev => ({...prev, [uid]: userData}));
      //end- updating user data in rtc

      //start - updating screenshare data in rtc
      if (screenUid) {
        const screenShareUser = {
          type: UserType.ScreenShare,
          parentUid: uid,
        };
        setMainRoomUsers(prev => ({...prev, [screenUid]: screenShareUser}));
      }
      //end - updating screenshare data in rtc
    } catch (e) {
      console.log(
        'rudra-core-client: RTM Failed to process user data for',
        userId,
        e,
      );
    }
  };

  const handleMainChannelPresenceEvent = async (presence: PresenceEvent) => {
    console.log(
      'rudra-core-client: RTM presence event received for different channel',
      presence.channelName,
      'expected:',
      mainChannelName,
    );
    if (presence.channelName !== mainChannelName) {
      console.log(
        'rudra-core-client: RTM presence event received for different channel',
        presence.channelName,
        'expected:',
        mainChannelName,
      );
      return;
    }

    // remoteJoinChannel
    if (presence.type === nativePresenceEventTypeMapping.REMOTE_JOIN) {
      console.log(
        'rudra-core-client: RTM main room user joined',
        presence.publisher,
      );
      try {
        const backoffAttributes = await fetchUserAttributesWithBackoffRetry(
          presence.publisher,
        );
        await processUserUidAttributes(backoffAttributes, presence.publisher);
      } catch (error) {
        console.log(
          'rudra-core-client: RTM Failed to process user who joined main room',
          presence.publisher,
          error,
        );
      }
    }

    // remoteLeaveChannel
    if (presence.type === nativePresenceEventTypeMapping.REMOTE_LEAVE) {
      console.log(
        'rudra-core-client: RTM main room user left',
        presence.publisher,
      );
      const uid = presence?.publisher
        ? parseInt(presence.publisher, 10)
        : undefined;

      if (!uid) {
        return;
      }

      // Remove user and their screenshare from main room users
      setMainRoomUsers(prev => {
        const updated = {...prev};
        const screenUid = prev[uid]?.screenUid;
        delete updated[uid];
        // Also remove screenshare if exists
        if (screenUid) {
          delete updated[screenUid];
        }
        console.log(
          'rudra-core-client: RTM removed user from main room',
          uid,
          screenUid ? `and screenshare ${screenUid}` : '',
        );
        return updated;
      });
    }
  };

  const handleMainChannelStorageEvent = async (storage: StorageEvent) => {
    console.log(
      'rudra-core-client: RTM global storage event received',
      storage,
    );

    // Only handle SET/UPDATE events for metadata persistence
    if (
      storage.eventType === nativeStorageEventTypeMapping.SET ||
      storage.eventType === nativeStorageEventTypeMapping.UPDATE
    ) {
      const storageTypeStr = storage.storageType === 1 ? 'user' : 'channel';
      const eventTypeStr = storage.eventType === 2 ? 'SET' : 'UPDATE';
      console.log(
        `rudra-core-client: RTM processing ${eventTypeStr} ${storageTypeStr} metadata`,
      );

      // STEP 1: Handle metadata persistence FIRST (core RTM functionality)
      try {
        if (storage.data?.items && Array.isArray(storage.data.items)) {
          for (const item of storage.data.items) {
            try {
              if (!item || !item.key) {
                console.log(
                  'rudra-core-client: RTM invalid storage item:',
                  item,
                );
                continue;
              }

              const {key, value, authorUserId, updateTs} = item;

              // Parse the value to check persistLevel
              let parsedValue;
              try {
                parsedValue =
                  typeof value === 'string' ? JSON.parse(value) : value;
              } catch (parseError) {
                console.log(
                  'rudra-core-client: RTM failed to parse storage event value:',
                  parseError,
                );
                continue;
              }

              const {persistLevel} = parsedValue;

              // Handle metadata persistence for Session level events
              if (persistLevel === PersistanceLevel.Session) {
                console.log(
                  'rudra-core-client: RTM setting user metadata for key:',
                  key,
                );

                const rtmAttribute = {key: key, value: value};
                const options: SetOrUpdateUserMetadataOptions = {
                  userId: `${localUid}`,
                };

                try {
                  await client.storage.setUserMetadata(
                    {items: [rtmAttribute]},
                    options,
                  );
                  console.log(
                    'rudra-core-client: RTM successfully set user metadata for key:',
                    key,
                  );
                } catch (setMetadataError) {
                  console.log(
                    'rudra-core-client: RTM failed to set user metadata:',
                    setMetadataError,
                  );
                }
              }
            } catch (itemError) {
              console.log(
                'rudra-core-client: RTM failed to process storage item:',
                item,
                itemError,
              );
            }
          }
        }
      } catch (error) {
        console.log(
          'rudra-core-client: RTM error processing storage event:',
          error,
        );
      }

      // STEP 2: Forward to application logic AFTER metadata persistence
      if (storageHandlerRef.current) {
        try {
          storageHandlerRef.current(storage);
          console.log(
            'rudra-core-client: RTM forwarded storage event to registered handler',
          );
        } catch (error) {
          console.log(
            'rudra-core-client: RTM error forwarding storage event:',
            error,
          );
        }
      }
    }
  };

  const handleMainChannelMessageEvent = (message: MessageEvent) => {
    console.log(
      'rudra-core-client: RTM main channel message event received',
      message,
    );

    // Forward to registered message handler (RTMConfigure)
    if (messageHandlerRef.current) {
      try {
        messageHandlerRef.current(message);
        console.log(
          'rudra-core-client: RTM forwarded message event to registered handler',
        );
      } catch (error) {
        console.log(
          'rudra-core-client: RTM error forwarding message event:',
          error,
        );
      }
    } else {
      console.log(
        'rudra-core-client: RTM no message handler registered for main channel',
      );
    }
  };

  // Main initialization effect
  useEffect(() => {
    if (!client || !isLoggedIn || !mainChannelName || hasInitRef.current) {
      return;
    }
    hasInitRef.current = true;
    console.log('RTMGlobalStateProvider: Client ready, starting init');
    // Register presence, storage, and message event callbacks for main channel
    registerCallbacks(mainChannelName, {
      presence: handleMainChannelPresenceEvent,
      storage: handleMainChannelStorageEvent,
      message: handleMainChannelMessageEvent,
    });
    console.log(
      'rudra-core-client: RTM registered presence, storage, and message callbacks for main channel',
    );
    init();
    return () => {
      console.log('rudra-clean up for global state - call unsubscribe');
      hasInitRef.current = false;
      if (mainChannelName) {
        unregisterCallbacks(mainChannelName);
        //TODO:SUP check if was subscribed
        if (RTMEngine.getInstance().hasChannel(mainChannelName)) {
          client?.unsubscribe(mainChannelName).catch(() => {});
          RTMEngine.getInstance().removeChannel(mainChannelName);
        }
        console.log(
          'rudra-core-client: RTM unregistered callbacks for main channel',
        );
      }
    };
  }, [client, isLoggedIn, mainChannelName]);

  return (
    <RTMGlobalStateContext.Provider
      value={{
        mainRoomUsers,
        setMainRoomUsers,
        registerMainChannelMessageHandler,
        unregisterMainChannelMessageHandler,
        registerMainChannelStorageHandler,
        unregisterMainChannelStorageHandler,
      }}>
      {children}
    </RTMGlobalStateContext.Provider>
  );
};

// Hook to use main channel message registration
export const useRTMGlobalState = () => {
  const context = React.useContext(RTMGlobalStateContext);
  if (!context) {
    throw new Error(
      'useRTMMainChannel must be used within RTMGlobalStateProvider',
    );
  }
  return context;
};

export default RTMGlobalStateProvider;
