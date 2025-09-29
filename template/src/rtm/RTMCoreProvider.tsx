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
import {isWeb, isWebInternal} from '../utils/common';
import isSDK from '../utils/isSDK';
import {useAsyncEffect} from '../utils/useAsyncEffect';

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
  // Callback registration methods
  registerCallbacks: (channelName: string, callbacks: EventCallbacks) => void;
  unregisterCallbacks: (channelName: string) => void;
}

const RTMContext = createContext<RTMContextType>({
  client: null,
  connectionState: 0,
  error: null,
  isLoggedIn: false,
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
  const [client, setClient] = useState<RTMClient | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [connectionState, setConnectionState] = useState(0);
  console.log('supriya-rtm connectionState: ', connectionState);
  const [error, setError] = useState<Error | null>(null);
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
      await rtmClient.storage.removeUserMetadata();
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
    if (!client || !userInfo?.localUid) {
      return;
    }
    const handleGlobalStorageEvent = (storage: StorageEvent) => {
      console.log(
        'rudra-core-client ********************** ---StorageEvent event: ',
        storage,
        callbackRegistry,
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
        'rudra-core-client @@@@@@@@@@@@@@@@@@@@@@@  ---PresenceEvent: ',
        presence,
        callbackRegistry,
      );
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
        'rudra-core-client ######################## ---MessageEvent event: ',
        message,
      );
      if (String(userInfo.localUid) === message.publisher) {
        console.log(
          'rudra-core-client ######################## SKIPPING this message event as it is local',
          message,
          callbackRegistry,
        );
        return;
      }
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
  }, [client, userInfo?.localUid]);

  useEffect(() => {
    if (client) {
      return;
    }
    const initializeRTM = async () => {
      console.log('supriya-rtm-lifecycle init');
      // 1, Check if engine is already connected
      // 2. Initialize RTM Engine
      if (!RTMEngine.getInstance()?.isEngineReady) {
        RTMEngine.getInstance().setLocalUID(stableUserInfo.localUid);
      }
      const rtmClient = RTMEngine.getInstance().engine;
      if (!rtmClient) {
        throw new Error('Failed to create RTM client');
      }
      // 3. Set client after successful setup
      setClient(rtmClient);
      // 4 .Global linkState listener
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
        // 5. Client Login
        if (stableUserInfo.rtmToken) {
          await loginToRTM(rtmClient, stableUserInfo.rtmToken);
          await setAttribute(rtmClient, stableUserInfo);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error('RTM login failed', err);
      }
    };

    initializeRTM();
  }, [client, stableUserInfo, setAttribute]);

  const cleanupRTM = async () => {
    try {
      const engine = RTMEngine.getInstance();
      if (engine?.engine) {
        console.log('RTM cleanup: destroying engine...');
        await engine.destroy();
        console.log('RTM cleanup: engine destroyed.');
      }
      setClient(null);
    } catch (err) {
      console.error('RTM cleanup failed:', err);
    }
  };

  useAsyncEffect(() => {
    return async () => {
      // Cleanup
      console.log('supriya-rtm-lifecycle cleanup');
      await cleanupRTM();
      // if (currentClient) {
      //   console.log('supriya-rtm-lifecycle cleanup calling destroy');
      //   await RTMEngine.getInstance().destroy();
      //   console.log(
      //     'supriya-rtm-lifecycle setting client null',
      //     RTMEngine.getInstance().engine,
      //   );
      //   setClient(null);
      // }
    };
  }, []);
  // Handle browser close/reload events for RTM cleanup
  useEffect(() => {
    if (!$config.ENABLE_CONVERSATIONAL_AI && isWebInternal()) {
      const handleBrowserClose = (ev: BeforeUnloadEvent) => {
        ev.preventDefault();
        return (ev.returnValue = 'Are you sure you want to exit?');
      };

      const handleRTMCleanup = () => {
        console.log('Browser closing: calling cleanupRTM()');
        // Fire-and-forget, no await because page is unloading
        cleanupRTM();
        // Optional: add beacon for debugging
        // navigator.sendBeacon?.(
        //   '/cleanup-log',
        //   JSON.stringify({msg: 'RTM cleanup triggered on pagehide'}),
        // );
      };

      window.addEventListener(
        'beforeunload',
        isWeb() && !isSDK() ? handleBrowserClose : () => {},
      );

      window.addEventListener('pagehide', handleRTMCleanup);

      return () => {
        window.removeEventListener(
          'beforeunload',
          isWeb() && !isSDK() ? handleBrowserClose : () => {},
        );
        window.removeEventListener('pagehide', handleRTMCleanup);
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
