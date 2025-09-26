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
  type PresenceEvent,
  type StorageEvent,
  type SetOrUpdateUserMetadataOptions,
  type MessageEvent,
} from 'agora-react-native-rtm';
import {timeNow, hasJsonStructure} from '../rtm/utils';
import {EventsQueue} from '../rtm-events';
import {PersistanceLevel} from '../rtm-events-api';
import RTMEngine from '../rtm/RTMEngine';
import {useRTMCore} from './RTMCoreProvider';
import {RtcPropsInterface, UidType} from '../../agora-rn-uikit';
import {
  nativePresenceEventTypeMapping,
  nativeStorageEventTypeMapping,
} from '../../bridge/rtm/web/Types';
import {RTM_ROOMS} from './constants';
import {
  fetchOnlineMembersWithRetries,
  fetchUserAttributesWithRetries,
  mapUserAttributesToState,
  fetchChannelAttributesWithRetries,
  processUserAttributeForQueue,
} from './rtm-presence-utils';
import {SDKEvents} from '../utils/eventEmitter';

export enum UserType {
  ScreenShare = 'screenshare',
}

// RTM-specific user data interface
export interface RTMUserData {
  uid?: UidType;
  screenUid?: number; // Screen sharing UID reference (stored in RTM user metadata)
  parentUid?: UidType; // Only available for screenshare
  type: 'rtc' | 'screenshare' | 'bot';
  name?: string; // User's display name (stored in RTM user metadata)
  offline: boolean; // User online/offline status (managed through RTM presence events)
  lastMessageTimeStamp: number; // Timestamp of last message (RTM message tracking)
  isInWaitingRoom?: boolean; // Waiting room status (RTM-based feature state)
  isHost: string; // Host privileges (stored in RTM user metadata as 'isHost')
}

interface RTMGlobalStateProviderProps {
  children: React.ReactNode;
  rtmLoginInfo: {
    uid: UidType;
    channel: string;
  };
}

// Context for message and storage handler registration
const RTMGlobalStateContext = React.createContext<{
  mainRoomRTMUsers: {[uid: number]: RTMUserData};
  setMainRoomRTMUsers: React.Dispatch<
    React.SetStateAction<{[uid: number]: RTMUserData}>
  >;
  // Custom state for developer features (main room scope, cross-room accessible)
  customRTMMainRoomData: {[key: string]: any};
  setCustomRTMMainRoomData: React.Dispatch<
    React.SetStateAction<{[key: string]: any}>
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
  mainRoomRTMUsers: {},
  setMainRoomRTMUsers: () => {},
  customRTMMainRoomData: {},
  setCustomRTMMainRoomData: () => {},
  registerMainChannelMessageHandler: () => {},
  unregisterMainChannelMessageHandler: () => {},
  registerMainChannelStorageHandler: () => {},
  unregisterMainChannelStorageHandler: () => {},
});

const RTMGlobalStateProvider: React.FC<RTMGlobalStateProviderProps> = ({
  children,
  rtmLoginInfo,
}) => {
  const mainChannelName = rtmLoginInfo.channel;
  const localUid = rtmLoginInfo.uid;
  const {client, isLoggedIn, registerCallbacks, unregisterCallbacks} =
    useRTMCore();
  // Main room RTM users (RTM-specific data only)
  const [mainRoomRTMUsers, setMainRoomRTMUsers] = useState<{
    [uid: number]: RTMUserData;
  }>({});

  // Custom state for developer features (main room scope, cross-room accessible)
  const [customRTMMainRoomData, setCustomRTMMainRoomData] = useState<{
    [key: string]: any;
  }>({});
  useEffect(() => {
    console.log('mainRoomRTMUsers user-attributes changed', mainRoomRTMUsers);
  }, [mainRoomRTMUsers]);

  // Timeout Refs
  const isRTMMounted = useRef(true);
  const hasInitRef = useRef(false);

  const subscribeTimerRef: any = useRef(5);
  const subscribeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const channelAttributesTimerRef: any = useRef(5);
  const channelAttributesTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const membersTimerRef: any = useRef(5);
  const membersTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Update main rtm users state
  const updateMainRoomUser = (uid: number, data: RTMUserData) => {
    setMainRoomRTMUsers(prev => ({
      ...prev,
      [uid]: {...(prev[uid] || {}), ...data},
    }));
  };

  // Init cycle starts
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
      if (RTMEngine.getInstance().allChannelIds.includes(mainChannelName)) {
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
        RTMEngine.getInstance().setActiveChannelName(RTM_ROOMS.MAIN);
        SDKEvents.emit('_rtm-joined', mainChannelName);

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

  const getMembersWithAttributes = async () => {
    try {
      console.log(
        'rudra-core-client: RTM presence.getOnlineUsers(getMembers) start',
      );
      const {allMembers, totalOccupancy} = await fetchOnlineMembersWithRetries(
        client,
        mainChannelName,
        {
          onPage: async ({occupants, total, pageToken}) => {
            console.log(
              'rudra-core-client: fetching user attributes for page: ',
              pageToken,
              occupants,
            );
            await Promise.all(
              occupants.map(async member => {
                try {
                  const userAttributes = await fetchUserAttributesWithRetries(
                    client,
                    member.userId,
                    {
                      isMounted: () => isRTMMounted.current,
                      // called later if name arrives
                      onNameFound: async retryAttr =>
                        mapUserAttributesToState(
                          retryAttr,
                          member.userId,
                          updateMainRoomUser,
                        ),
                    },
                  );
                  console.log(
                    `supriya rtm backoffAttributes user-attributes for ${member.userId}`,
                    userAttributes,
                  );
                  mapUserAttributesToState(
                    userAttributes,
                    member.userId,
                    updateMainRoomUser,
                  );

                  userAttributes?.items?.forEach(item => {
                    processUserAttributeForQueue(
                      item,
                      member.userId,
                      RTM_ROOMS.MAIN,
                      (eventKey, value, userId) => {
                        const data = {evt: eventKey, value};
                        console.log(
                          'supriya-session-test adding to queue',
                          data,
                        );
                        EventsQueue.enqueue({
                          data,
                          uid: userId,
                          ts: timeNow(),
                        });
                      },
                    );
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
          },
        },
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
      // });
    } catch (error) {
      membersTimeoutRef.current = setTimeout(async () => {
        // Cap the timer to prevent excessive delays (max 30 seconds)
        membersTimerRef.current = Math.min(membersTimerRef.current * 2, 30);
        await getMembersWithAttributes();
      }, membersTimerRef.current * 1000);
    }
  };

  const getChannelAttributes = async () => {
    try {
      await fetchChannelAttributesWithRetries(
        client,
        mainChannelName,
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

  // Listeners
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
        const userAttributes = await fetchUserAttributesWithRetries(
          client,
          presence.publisher,
          {
            isMounted: () => isRTMMounted.current,
            // This is called later if name arrives and hence we process that attribute
            onNameFound: retriedAttributes =>
              mapUserAttributesToState(
                retriedAttributes,
                presence.publisher,
                updateMainRoomUser,
              ),
          },
        );
        // This is called as soon as we receive any attributes
        mapUserAttributesToState(
          userAttributes,
          presence.publisher,
          updateMainRoomUser,
        );
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
      SDKEvents.emit('_rtm-left', uid);
      // Mark user as offline (matching legacy channelMemberLeft behavior)
      setMainRoomRTMUsers(prev => {
        const updated = {...prev};

        if (updated[uid]) {
          updated[uid] = {
            ...updated[uid],
            offline: true,
          };
        }

        // Also mark screenshare as offline if exists
        // const screenUid = prev[uid]?.screenUid;
        // if (screenUid && updated[screenUid]) {
        //   updated[screenUid] = {
        //     ...updated[screenUid],
        //     offline: true,
        //   };
        // }

        console.log(
          'rudra-core-client: RTM marked user as offline in main room',
          uid,
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

      // // STEP 1: Handle metadata persistence FIRST (core RTM functionality)
      // try {
      //   if (storage.data?.items && Array.isArray(storage.data.items)) {
      //     for (const item of storage.data.items) {
      //       try {
      //         if (!item || !item.key) {
      //           console.log(
      //             'rudra-core-client: RTM invalid storage item:',
      //             item,
      //           );
      //           continue;
      //         }

      //         const {key, value, authorUserId, updateTs} = item;

      //         // Parse the value to check persistLevel
      //         let parsedValue;
      //         try {
      //           parsedValue =
      //             typeof value === 'string' ? JSON.parse(value) : value;
      //         } catch (parseError) {
      //           console.log(
      //             'rudra-core-client: RTM failed to parse storage event value:',
      //             parseError,
      //           );
      //           continue;
      //         }

      //         const {persistLevel} = parsedValue;

      //         // Handle metadata persistence for Session level events
      //         if (persistLevel === PersistanceLevel.Session) {
      //           console.log(
      //             'rudra-core-client: RTM setting user metadata for key:',
      //             key,
      //           );

      //           const rtmAttribute = {key: key, value: value};
      //           const options: SetOrUpdateUserMetadataOptions = {
      //             userId: `${localUid}`,
      //           };

      //           try {
      //             await client.storage.setUserMetadata(
      //               {items: [rtmAttribute]},
      //               options,
      //             );
      //             console.log(
      //               'rudra-core-client: RTM successfully set user metadata for key:',
      //               key,
      //             );
      //           } catch (setMetadataError) {
      //             console.log(
      //               'rudra-core-client: RTM failed to set user metadata:',
      //               setMetadataError,
      //             );
      //           }
      //         }
      //       } catch (itemError) {
      //         console.log(
      //           'rudra-core-client: RTM failed to process storage item:',
      //           item,
      //           itemError,
      //         );
      //       }
      //     }
      //   }
      // } catch (error) {
      //   console.log(
      //     'rudra-core-client: RTM error processing storage event:',
      //     error,
      //   );
      // }

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

  const handleMainChannelMessageEvent = async (message: MessageEvent) => {
    console.log(
      'rudra-core-client: RTM main channel message event received',
      message,
    );

    // Check if this is a SESSION-level event and persist it
    try {
      if (hasJsonStructure(message.message)) {
        const parsed = JSON.parse(message.message);
        const {evt, value} = parsed;

        if (value && hasJsonStructure(value)) {
          const parsedValue = JSON.parse(value);
          const {persistLevel, _channelId} = parsedValue;

          // If this is a SESSION-level event from main channel, store it on local user's attributes
          if (
            persistLevel === PersistanceLevel.Session &&
            _channelId === mainChannelName
          ) {
            // const roomAwareKey = `${RTM_ROOMS.MAIN}__${evt}`;
            const rtmAttribute = {key: evt, value: value};

            const options: SetOrUpdateUserMetadataOptions = {
              userId: `${localUid}`,
            };
            await client.storage.setUserMetadata(
              {items: [rtmAttribute]},
              options,
            );
            // console.log(
            //   'rudra-core-client: Stored SESSION attribute cross-room',
            //   roomAwareKey,
            // );
          }
        }
      }
    } catch (error) {
      console.log(
        'rudra-core-client: RTM error storing session attribute:',
        error,
      );
    }

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
      console.log('rudra-core-client: main state cleanup');
      hasInitRef.current = false;
      isRTMMounted.current = false;
      if (mainChannelName) {
        unregisterCallbacks(mainChannelName);
        if (RTMEngine.getInstance().hasChannel(mainChannelName)) {
          client?.unsubscribe(mainChannelName).catch(() => {});
          RTMEngine.getInstance().removeChannel(mainChannelName);
        }
      }

      // Clear timer-based retry timeouts
      if (subscribeTimeoutRef.current) {
        clearTimeout(subscribeTimeoutRef.current);
        subscribeTimeoutRef.current = null;
      }
      if (membersTimeoutRef.current) {
        clearTimeout(membersTimeoutRef.current);
        membersTimeoutRef.current = null;
      }
      if (channelAttributesTimeoutRef.current) {
        clearTimeout(channelAttributesTimeoutRef.current);
        channelAttributesTimeoutRef.current = null;
      }
    };
  }, [client, isLoggedIn, mainChannelName]);

  return (
    <RTMGlobalStateContext.Provider
      value={{
        mainRoomRTMUsers,
        setMainRoomRTMUsers,
        customRTMMainRoomData,
        setCustomRTMMainRoomData,
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
