import React, {
  useRef,
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import type {
  RTMClient,
  LinkStateEvent,
  MessageEvent,
  PresenceEvent,
  StorageEvent,
  Metadata,
  SetOrUpdateUserMetadataOptions,
} from 'agora-react-native-rtm';
import {UidType} from '../../agora-rn-uikit';
import RTMEngine from '../rtm/RTMEngine';
import {nativePresenceEventTypeMapping} from '../../bridge/rtm/web/Types';
import {isWeb, isWebInternal} from '../utils/common';
import isSDK from '../utils/isSDK';

// Event callback types
type MessageCallback = (message: MessageEvent) => void;
type PresenceCallback = (presence: PresenceEvent) => void;
type StorageCallback = (storage: StorageEvent) => void;

interface EventCallbacks {
  message?: MessageCallback;
  presence?: PresenceCallback;
  storage?: StorageCallback;
}

interface RTMContextType {
  client: RTMClient | null;
  connectionState: number;
  error: Error | null;
  isLoggedIn: boolean;
  onlineUsers: Set<string>;
  // Callback registration methods
  registerCallbacks: (channelName: string, callbacks: EventCallbacks) => void;
  unregisterCallbacks: (channelName: string) => void;
}

const RTMContext = createContext<RTMContextType>({
  client: null,
  connectionState: 0,
  error: null,
  isLoggedIn: false,
  onlineUsers: new Set<string>(),
  registerCallbacks: () => {},
  unregisterCallbacks: () => {},
});

interface RTMCoreProviderProps {
  children: React.ReactNode;
  userInfo: {
    localUid: UidType;
    screenShareUid: UidType;
    isHost: boolean;
    rtmToken?: string;
  };
}

export const RTMCoreProvider: React.FC<RTMCoreProviderProps> = ({
  userInfo,
  children,
}) => {
  const [client, setClient] = useState<RTMClient | null>(null); // Use state instead
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [connectionState, setConnectionState] = useState(0);
  console.log('supriya-rtm connectionState: ', connectionState);
  const [error, setError] = useState<Error | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  // Callback registration storage
  const callbackRegistry = useRef<Map<string, EventCallbacks>>(new Map());

  // Memoize userInfo to prevent unnecessary re-renders
  const stableUserInfo = useMemo(
    () => ({
      localUid: userInfo.localUid,
      screenShareUid: userInfo.screenShareUid,
      isHost: userInfo.isHost,
      rtmToken: userInfo.rtmToken,
    }),
    [
      userInfo.localUid,
      userInfo.screenShareUid,
      userInfo.isHost,
      userInfo.rtmToken,
    ],
  );

  // Login function
  const loginToRTM = async (
    rtmClient: RTMClient,
    loginToken: string,
    retryCount = 0,
  ) => {
    try {
      try {
        // 1. Handle ghost sessions, so do logout to leave any ghost sessions
        await rtmClient.logout();
        // 2. Wait for sometime
        await new Promise(resolve => setTimeout(resolve, 500));
        // 3. Login again
        await rtmClient.login({token: loginToken});
        // 4. Wait for sometime
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (logoutError) {
        console.log('logoutError: ', logoutError);
      }
    } catch (loginError) {
      if (retryCount < 5) {
        // Retry with exponential backoff (capped at 30s)
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return loginToRTM(rtmClient, loginToken, retryCount + 1);
      } else {
        const contextError = new Error(
          `RTM login failed after retries: ${error.message}`,
        );
        setError(contextError);
      }
    }
  };

  const setAttribute = useCallback(async (rtmClient: RTMClient, userInfo) => {
    const rtmAttributes = [
      {key: 'screenUid', value: String(userInfo.screenShareUid)},
      {key: 'isHost', value: String(userInfo.isHost)},
    ];
    try {
      const data: Metadata = {
        items: rtmAttributes,
      };
      const options: SetOrUpdateUserMetadataOptions = {
        userId: `${userInfo.localUid}`,
      };
      await rtmClient.storage.setUserMetadata(data, options);
    } catch (setAttributeError) {
      console.log('setAttributeError: ', setAttributeError);
    }
  }, []);

  // Callback registration methods
  const registerCallbacks = (
    channelName: string,
    callbacks: EventCallbacks,
  ) => {
    callbackRegistry.current.set(channelName, callbacks);
  };

  const unregisterCallbacks = (channelName: string) => {
    callbackRegistry.current.delete(channelName);
  };

  // Global event listeners - centralized in RTMCoreProvider
  useEffect(() => {
    if (!client) {
      return;
    }
    const handleGlobalStorageEvent = (storage: StorageEvent) => {
      console.log(
        'supriya-rtm-global ********************** ---StorageEvent event: ',
        storage,
      );
      // Distribute to all registered callbacks
      callbackRegistry.current.forEach((callbacks, channelName) => {
        if (callbacks.storage) {
          try {
            callbacks.storage(storage);
          } catch (globalStorageCbError) {
            console.log('globalStorageCbError: ', globalStorageCbError);
          }
        }
      });
    };

    const handleGlobalPresenceEvent = (presence: PresenceEvent) => {
      console.log(
        'supriya-rtm-global @@@@@@@@@@@@@@@@@@@@@@@  ---PresenceEvent: ',
        presence,
      );
      if (presence.type === nativePresenceEventTypeMapping.SNAPSHOT) {
        // Initial snapshot - set all online users
        setOnlineUsers(
          new Set(presence.snapshot?.userStateList.map(u => u.userId) || []),
        );
      } else if (presence.type === nativePresenceEventTypeMapping.REMOTE_JOIN) {
        setOnlineUsers(prev => new Set([...prev, presence.publisher]));
      } else if (
        presence.type === nativePresenceEventTypeMapping.REMOTE_LEAVE
      ) {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(presence.publisher);
          return newSet;
        });
      }
      // Distribute to all registered callbacks
      callbackRegistry.current.forEach((callbacks, channelName) => {
        if (callbacks.presence) {
          try {
            callbacks.presence(presence);
          } catch (globalPresenceCbError) {
            console.log('globalPresenceCbError: ', globalPresenceCbError);
          }
        }
      });
    };

    const handleGlobalMessageEvent = (message: MessageEvent) => {
      console.log(
        'supriya-rtm-global ######################## ---MessageEvent event: ',
        message,
      );
      // Distribute to all registered callbacks
      callbackRegistry.current.forEach((callbacks, channelName) => {
        if (callbacks.message) {
          try {
            callbacks.message(message);
          } catch (globalMessageCbError) {
            console.log('globalMessageCbError: ', globalMessageCbError);
          }
        }
      });
    };

    client.addEventListener('storage', handleGlobalStorageEvent);
    client.addEventListener('presence', handleGlobalPresenceEvent);
    client.addEventListener('message', handleGlobalMessageEvent);

    return () => {
      // Remove global event listeners
      client.removeEventListener('storage', handleGlobalStorageEvent);
      client.removeEventListener('presence', handleGlobalPresenceEvent);
      client.removeEventListener('message', handleGlobalMessageEvent);
    };
  }, [client]);

  useEffect(() => {
    if (client) {
      return;
    }
    const initializeRTM = async () => {
      // 1, Check if engine is already connected
      // 2. Initialize RTM Engine
      if (!RTMEngine.getInstance()?.isEngineReady) {
        RTMEngine.getInstance().setLocalUID(stableUserInfo.localUid);
      }
      const rtmClient = RTMEngine.getInstance().engine;
      if (!rtmClient) {
        throw new Error('Failed to create RTM client');
      }
      setClient(rtmClient); // Set client after successful setup

      // 3. Global linkState listener
      const onLink = async (evt: LinkStateEvent) => {
        setConnectionState(evt.currentState);
        if (evt.currentState === 0 /* DISCONNECTED */) {
          setIsLoggedIn(false);
          console.warn('RTM disconnected. Attempting re-login...');
          if (stableUserInfo.rtmToken) {
            try {
              await loginToRTM(rtmClient, stableUserInfo.rtmToken);
              await setAttribute(rtmClient, stableUserInfo);
              console.log('RTM re-login successful.');
            } catch (err) {
              console.error('RTM re-login failed:', err);
            }
          }
        }
      };
      rtmClient.addEventListener('linkState', onLink);

      try {
        // 4. Client Login
        if (stableUserInfo.rtmToken) {
          await loginToRTM(rtmClient, stableUserInfo.rtmToken);
          // 5. Set user attributes after successful login
          await setAttribute(rtmClient, stableUserInfo);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error('RTM login failed', err);
      }
    };

    initializeRTM();

    return () => {
      // Cleanup
      console.log('supriya-rtm RTM cleanup is happening');
      if (client) {
        console.log('supriya RTM cleanup is happening');
        RTMEngine.getInstance().destroy();
        setClient(null);
      }
    };
  }, [client, stableUserInfo, setAttribute]);

  // Handle browser close/reload events for RTM cleanup
  useEffect(() => {
    if (!$config.ENABLE_CONVERSATIONAL_AI) {
      const handleBrowserClose = (ev: BeforeUnloadEvent) => {
        ev.preventDefault();
        return (ev.returnValue = 'Are you sure you want to exit?');
      };

      const handleRTMLogout = () => {
        if (client && isLoggedIn) {
          console.log('Browser closing, logging out from RTM');
          client.logout().catch(() => {});
        }
      };

      if (!isWebInternal()) {
        return;
      }

      window.addEventListener(
        'beforeunload',
        isWeb() && !isSDK() ? handleBrowserClose : () => {},
      );

      window.addEventListener('pagehide', handleRTMLogout);

      return () => {
        window.removeEventListener(
          'beforeunload',
          isWeb() && !isSDK() ? handleBrowserClose : () => {},
        );
        window.removeEventListener('pagehide', handleRTMLogout);
      };
    }
  }, [client, isLoggedIn]);

  return (
    <RTMContext.Provider
      value={{
        client,
        isLoggedIn,
        connectionState,
        error,
        onlineUsers,
        registerCallbacks,
        unregisterCallbacks,
      }}>
      {children}
    </RTMContext.Provider>
  );
};

export const useRTMCore = () => {
  const context = useContext(RTMContext);
  if (!context) {
    throw new Error('useRTMCore must be used within RTMCoreProvider');
  }
  return context;
};
