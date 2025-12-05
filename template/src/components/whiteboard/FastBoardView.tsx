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

import React, {useRef, useEffect} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {useRoomInfo} from 'customization-api';
import {useString} from '../../utils/useString';
import {whiteboardInitializingText} from '../../language/default-labels/videoCallScreenLabels';
import {useFastboard, Fastboard, createFastboard, FastboardApp} from '@netless/fastboard-react/full';

import {useLocalUid} from '../../../agora-rn-uikit';
import useUserName from '../../utils/useUserName';

interface FastBoardViewProps {
  showToolbox?: boolean;
}

/**
 * Technical Note: Why we are not using the 'useFastboard' hook?
 * 
 * We replaced the standard 'useFastboard' hook with a manual 'FastboardManager' implementation
 * to solve a critical race condition in React 18+ Strict Mode.
 * 
 * Issue: "[WindowManager]: Already created cannot be created again"
 * 
 * In Strict Mode, React intentionally mounts, unmounts, and remounts components rapidly 
 * to detect side-effects. The standard hook attempts to initialize the Fastboard singleton 
 * twice in parallel. The first initialization is still "pending" when the second one starts,
 * causing the underlying WindowManager to crash because it doesn't support concurrent init calls.
 * 
 * Solution: The 'FastboardManager' below uses Reference Counting and Singleton pattern to:
 * 1. Deduplicate initialization requests (reusing the same Promise).
 * 2. Delay cleanup slightly to handle the rapid Unmount -> Mount cycle without destroying the instance.
 */
const FastBoardView: React.FC<FastBoardViewProps> = ({showToolbox = true}) => {
  const {
    data: {whiteboard: {room_token, room_uuid} = {}, isHost},
  } = useRoomInfo();
  
  const localUid = useLocalUid();
  const [name] = useUserName();

  const whiteboardInitializing = useString(whiteboardInitializingText)();

  // Generate stable UID - only once
  // Use local user's name or fallback to UID if name is not available
  const uidRef = useRef<string>(name || String(localUid));
  const [fastboard, setFastboard] = React.useState<FastboardApp | null>(null);

  // Configuration object - Memoize stringified version to detect changes
  const config = React.useMemo(() => ({
    sdkConfig: {
      appIdentifier: 'EEJBQPVbEe2Bao8ZShuoHQ/hgB5eo0qcDbVig',
      region: 'us-sv',
    },
    joinRoom: {
      uid: uidRef.current,
      uuid: room_uuid,
      roomToken: room_token,
    },
  }), [room_uuid, room_token]);

  const configStr = JSON.stringify(config);

  useEffect(() => {
    let isMounted = true;
    
    const initFastboard = async () => {
      try {
        const app = await FastboardManager.acquire(configStr, config);
        if (isMounted) {
          setFastboard(app);
        }
      } catch (error) {
        console.error("Fastboard initialization failed:", error);
      }
    };

    initFastboard();

    return () => {
      isMounted = false;
      FastboardManager.release(configStr);
    };
  }, [configStr, config]);

  // Show loading if fastboard not ready yet
  if (!fastboard) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{whiteboardInitializing}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <div style={divStyles.fastboardContainer}>
        <Fastboard app={fastboard} />
      </div>
    </View>
  );
};

// Global Manager to handle Strict Mode and Singleton constraints
const FastboardManager = {
  activeConfig: null as string | null,
  instance: null as FastboardApp | null,
  promise: null as Promise<FastboardApp> | null,
  subscribers: 0,
  
  acquire: async (configStr: string, config: any): Promise<FastboardApp> => {
    FastboardManager.subscribers++;
    
    // If config matches and we have an instance/promise, reuse it
    if (FastboardManager.activeConfig === configStr) {
      if (FastboardManager.instance) return FastboardManager.instance;
      if (FastboardManager.promise) return FastboardManager.promise;
    }
    
    // Config mismatch! We must cleanup the previous board before creating a new one.
    // This happens if component remounts with new UID (e.g. Pin to Top).
    
    // 1. If there's a pending loading operation, wait for it and destroy the result.
    if (FastboardManager.promise) {
       try {
          const oldApp = await FastboardManager.promise;
           // Double check if it wasn't already destroyed or reassigned
           if (oldApp) oldApp.destroy();
       } catch (e) {
          console.warn("Error cleaning up previous pending Fastboard:", e);
       }
    }
    
    // 2. If there's an active instance, destroy it.
    if (FastboardManager.instance) {
        try {
            FastboardManager.instance.destroy();
        } catch (e) {
             console.warn("Error cleaning up previous active Fastboard:", e);
        }
    }
    
    // Reset state
    FastboardManager.instance = null;
    FastboardManager.promise = null;
    FastboardManager.activeConfig = configStr;
    
    // 3. Create new instance
    FastboardManager.promise = createFastboard(config).then(app => {
      // Check if we are still the active config
      if (FastboardManager.activeConfig === configStr) {
         FastboardManager.instance = app;
         return app;
      } else {
         // Config changed while loading
         app.destroy();
         throw new Error("Fastboard config changed during initialization");
      }
    });
    
    return FastboardManager.promise;
  },
  
  release: (configStr: string) => {
    FastboardManager.subscribers--;
    
    // Delayed cleanup to handle Strict Mode "Unmount -> Mount" flicker
    setTimeout(() => {
      if (FastboardManager.subscribers === 0 && FastboardManager.activeConfig === configStr) {
         if (FastboardManager.instance) {
           FastboardManager.instance.destroy();
           FastboardManager.instance = null;
         }
         FastboardManager.promise = null;
         FastboardManager.activeConfig = null;
      }
    }, 200);
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  placeholder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666666',
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
  },
});

const divStyles = {
  fastboardContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
};

export default FastBoardView;
