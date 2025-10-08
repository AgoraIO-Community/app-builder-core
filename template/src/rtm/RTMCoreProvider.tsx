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
  RtmLinkState,
} from 'agora-react-native-rtm';
import {UidType} from '../../agora-rn-uikit';
import RTMEngine from '../rtm/RTMEngine';
import {isWeb, isWebInternal} from '../utils/common';
import isSDK from '../utils/isSDK';
import {useAsyncEffect} from '../utils/useAsyncEffect';
import {nativeLinkStateMapping} from '../../bridge/rtm/web/Types';
import {RTMStatusBanner} from './RTMStatusBanner';

// ---- Helpers ---- //
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

async function loginWithBackoff(
  rtmClient: RTMClient,
  token: string,
  onAttempt?: (n: number) => void,
  maxAttempts = 5,
) {
  let attempt = 0;
  while (attempt <= maxAttempts) {
    try {
      try {
        await rtmClient.logout();
      } catch {}
      await delay(300);
      await rtmClient.login({token});
      return; // success
    } catch (e: any) {
      attempt += 1;
      onAttempt?.(attempt);

      if (attempt > maxAttempts) {
        const errorMsg = `RTM login failed: ${e?.message ?? e}`;
        throw new Error(errorMsg);
      }
      const backoff =
        Math.min(5000 * 2 ** (attempt - 1), 60_000) +
        Math.floor(Math.random() * 300);
      await delay(backoff);
    }
  }
}

// ---- Context ---- //
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
  connectionState: RtmLinkState;
  error: Error | null;
  isLoggedIn: boolean;
  registerCallbacks: (channelName: string, callbacks: EventCallbacks) => void;
  unregisterCallbacks: (channelName: string) => void;
}

const RTMContext = createContext<RTMContextType>({
  client: null,
  connectionState: nativeLinkStateMapping.IDLE,
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

  const mountedRef = useRef(true);
  const cleaningRef = useRef(false);
  const callbackRegistry = useRef<Map<string, EventCallbacks>>(new Map());
  const errorRef = useRef<Error | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Sync error ref with state to prevent state clearing
  useEffect(() => {
    errorRef.current = error;
  }, [error]);

  // Keep error persistent if we have a failed state
  useEffect(() => {
    if (
      connectionState === nativeLinkStateMapping.FAILED &&
      !error &&
      errorRef.current
    ) {
      setError(errorRef.current);
    }
  }, [connectionState, error]);

  // Memoize userInfo
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

  const setAttribute = useCallback(async (rtmClient: RTMClient, userInfo) => {
    const rtmAttributes = [
      {key: 'screenUid', value: String(userInfo.screenShareUid)},
      {key: 'isHost', value: String(userInfo.isHost)},
    ];
    try {
      const data: Metadata = {items: rtmAttributes};
      const options: SetOrUpdateUserMetadataOptions = {
        userId: `${userInfo.localUid}`,
      };
      // await rtmClient.storage.removeUserMetadata();
      await rtmClient.storage.setUserMetadata(data, options);
    } catch (setAttributeError) {
      console.log('setAttributeError: ', setAttributeError);
    }
  }, []);

  const registerCallbacks = useCallback(
    (channelName: string, callbacks: EventCallbacks) => {
      callbackRegistry.current.set(channelName, callbacks);
    },
    [],
  );

  const unregisterCallbacks = useCallback((channelName: string) => {
    callbackRegistry.current.delete(channelName);
  }, []);

  // Global event listeners
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
        try {
          callbacks.storage?.(storage);
        } catch (globalStorageCbError) {
          console.log('globalStorageCbError: ', globalStorageCbError);
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
        try {
          callbacks.presence?.(presence);
        } catch (globalPresenceCbError) {
          console.log('globalPresenceCbError: ', globalPresenceCbError);
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
        try {
          callbacks.message?.(message);
        } catch (globalMessageCbError) {
          console.log('globalMessageCbError: ', globalMessageCbError);
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

  // Link state listener for reconnects
  useEffect(() => {
    if (!client) {
      return;
    }

    const onLink = async (evt: LinkStateEvent) => {
      setConnectionState(evt.currentState);

      if (evt.currentState === nativeLinkStateMapping.FAILED) {
        setIsLoggedIn(false);
        // Set error if we're in FAILED state and don't have one
        if (!errorRef.current) {
          const failedError = new Error('RTM connection failed');
          errorRef.current = failedError;
          setError(failedError);
        }
      } else if (evt.currentState === nativeLinkStateMapping.DISCONNECTED) {
        setIsLoggedIn(false);
        if (stableUserInfo.rtmToken) {
          try {
            await loginWithBackoff(client, stableUserInfo.rtmToken);
            if (!mountedRef.current) {
              return;
            }
            setIsLoggedIn(true);
            // Clear error only after successful login
            errorRef.current = null;
            setError(null);
          } catch (err: any) {
            if (!mountedRef.current) {
              return;
            }
            errorRef.current = err;
            setError(err);
          }
        }
      } else if (evt.currentState === nativeLinkStateMapping.CONNECTED) {
        setIsLoggedIn(true);
        // Clear error on successful connection
        errorRef.current = null;
        setError(null);
      }
    };

    client.addEventListener('linkState', onLink);
    return () => {
      client.removeEventListener('linkState', onLink);
    };
  }, [client, stableUserInfo, setAttribute]);

  // Initialize RTM
  useEffect(() => {
    if (client) {
      return;
    }

    (async () => {
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

      try {
        if (stableUserInfo.rtmToken) {
          await loginWithBackoff(rtmClient, stableUserInfo.rtmToken);
          await setAttribute(rtmClient, stableUserInfo);
          if (!mountedRef.current) {
            return;
          }
          setIsLoggedIn(true);
        }
      } catch (err: any) {
        if (!mountedRef.current) {
          return;
        }
        errorRef.current = err;
        setError(err);
      }
    })();
  }, [client, stableUserInfo, setAttribute]);

  // Refresh attributes if userInfo changes while logged in
  useEffect(() => {
    if (client && isLoggedIn && stableUserInfo.rtmToken) {
      setAttribute(client, stableUserInfo).catch(console.warn);
    }
  }, [client, isLoggedIn, stableUserInfo, setAttribute]);

  const cleanupRTM = useCallback(async () => {
    if (cleaningRef.current) {
      return;
    }
    cleaningRef.current = true;
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
    } finally {
      cleaningRef.current = false;
    }
  }, []);

  useAsyncEffect(() => {
    return async () => {
      // Cleanup
      console.log('supriya-rtm-lifecycle cleanup');
      await cleanupRTM();
    };
  }, []);

  // Browser unload cleanup
  useEffect(() => {
    if (
      !$config.ENABLE_CONVERSATIONAL_AI &&
      isWebInternal() &&
      isWeb() &&
      !isSDK()
    ) {
      const handleBrowserClose = (ev: BeforeUnloadEvent) => {
        ev.preventDefault();
        ev.returnValue = 'Are you sure you want to exit?';
      };
      const handleRTMCleanup = () => {
        cleanupRTM();
      };
      window.addEventListener('beforeunload', handleBrowserClose);
      window.addEventListener('pagehide', handleRTMCleanup);
      return () => {
        window.removeEventListener('beforeunload', handleBrowserClose);
        window.removeEventListener('pagehide', handleRTMCleanup);
      };
    }
  }, [cleanupRTM]);

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
      {/* <RTMStatusBanner /> */}
      {children}
    </RTMContext.Provider>
  );
};

export const useRTMCore = () => useContext(RTMContext);
