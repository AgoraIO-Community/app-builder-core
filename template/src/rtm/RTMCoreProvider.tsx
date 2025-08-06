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
import {nativeLinkStateMapping} from '../../bridge/rtm/web/Types';

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
  const [client, setClient] = useState<RTMClient | null>(null); // Use state instead
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [connectionState, setConnectionState] = useState(0);
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
  const loginToRTM = async (rtmClient: RTMClient, loginToken: string) => {
    try {
      try {
        // Handle ghost sessions
        await rtmClient.logout();
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (logoutError) {
        console.log('logoutError: ', logoutError);
      }
      await rtmClient.login({token: loginToken});
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (loginError) {
      const contextError = new Error(`RTM login failed: ${loginError.message}`);
      setError(contextError);
      throw contextError;
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
      console.log('supriya handleGlobalStorageEvent event: ', storage);
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
      console.log('supriya handleGlobalPresenceEvent: ', presence);
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
      console.log('supriya handleGlobalMessageEvent event: ', message);

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
      console.log('supriya removing up global listeners');
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
      const onLink = (evt: LinkStateEvent) =>
        setConnectionState(evt.currentState);
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
      if (client) {
        console.log('supriya RTM cleanup is happening');
        client.removeAllListeners();
        client.logout().catch(() => {});
        RTMEngine.getInstance().destroy();
        setClient(null);
      }
    };
  }, [client, stableUserInfo, setAttribute]);

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
