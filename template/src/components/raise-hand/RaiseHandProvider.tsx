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

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {useCurrentRoomInfo} from '../room-info/useCurrentRoomInfo';
import {useLocalUid} from '../../../agora-rn-uikit';
import events, {PersistanceLevel} from '../../rtm-events-api';
import Toast from '../../../react-native-toast-message';
import {useMainRoomUserDisplayName} from '../../rtm/hooks/useMainRoomUserDisplayName';
import {EventNames} from '../../rtm-events';

interface RaiseHandData {
  raised: boolean;
  timestamp: number;
}

interface RaiseHandState {
  // State
  raisedHands: Record<number, RaiseHandData>;
  isHandRaised: boolean;
  isUserHandRaised: (uid: number) => boolean;

  // Actions
  raiseHand: () => void;
  lowerHand: () => void;
  toggleHand: () => void;
}

const RaiseHandContext = createContext<RaiseHandState>({
  raisedHands: {},
  isHandRaised: false,
  isUserHandRaised: () => false,
  raiseHand: () => {},
  lowerHand: () => {},
  toggleHand: () => {},
});

interface RaiseHandProviderProps {
  children: React.ReactNode;
}

export const RaiseHandProvider: React.FC<RaiseHandProviderProps> = ({
  children,
}) => {
  const [raisedHands, setRaisedHands] = useState<Record<number, RaiseHandData>>(
    {},
  );
  const localUid = useLocalUid();
  const roomInfo = useCurrentRoomInfo();
  const getDisplayName = useMainRoomUserDisplayName();

  // Get current user's hand state
  const isHandRaised = raisedHands[localUid]?.raised || false;

  // Check if any user has hand raised
  const isUserHandRaised = useCallback(
    (uid: number): boolean => {
      return raisedHands[uid]?.raised || false;
    },
    [raisedHands],
  );

  // Raise hand action
  const raiseHand = useCallback(() => {
    if (isHandRaised) {
      return;
    } // Already raised

    const timestamp = Date.now();
    // Update local state immediately
    setRaisedHands(prev => ({...prev, [localUid]: {raised: true, timestamp}}));

    // Send RTM event
    events.send(
      EventNames.BREAKOUT_RAISE_HAND_ATTRIBUTE,
      JSON.stringify({
        uid: localUid,
        raised: true,
        timestamp,
      }),
      PersistanceLevel.Sender,
    );

    // Show toast notification
    Toast.show({
      type: 'success',
      text1: 'Hand raised',
      visibilityTime: 2000,
    });
  }, [isHandRaised, localUid]);

  // Lower hand action
  const lowerHand = useCallback(() => {
    if (!isHandRaised) {
      return;
    } // Already lowered

    // Update local state immediately (keep timestamp but set raised to false)
    setRaisedHands(prev => ({
      ...prev,
      [localUid]: {raised: false, timestamp: Date.now()},
    }));

    // Send RTM event
    events.send(
      EventNames.BREAKOUT_RAISE_HAND_ATTRIBUTE,
      JSON.stringify({
        uid: localUid,
        raised: false,
        timestamp: Date.now(),
      }),
      PersistanceLevel.Sender,
    );

    // Show toast notification
    Toast.show({
      type: 'info',
      text1: 'Hand lowered',
      visibilityTime: 2000,
    });
  }, [isHandRaised, localUid]);

  // Toggle hand action
  const toggleHand = useCallback(() => {
    if (isHandRaised) {
      lowerHand();
    } else {
      raiseHand();
    }
  }, [isHandRaised, raiseHand, lowerHand]);

  // Listen for RTM events
  useEffect(() => {
    const handleRaiseHandEvent = (data: any) => {
      try {
        const {payload} = data;
        const eventData = JSON.parse(payload);
        const {uid, raised, timestamp} = eventData;

        // Update raised hands state
        setRaisedHands(prev => ({
          ...prev,
          [uid]: {raised, timestamp},
        }));

        // Show toast for other users (not for self)
        if (uid !== localUid) {
          const userName = getDisplayName(uid) || `User ${uid}`;
          Toast.show({
            type: raised ? 'success' : 'info',
            text1: raised
              ? `${userName} raised hand`
              : `${userName} lowered hand`,
            visibilityTime: 3000,
          });
        }
      } catch (error) {
        console.error('Failed to process raise hand event:', error);
      }
    };

    // Register event listener
    events.on(EventNames.BREAKOUT_RAISE_HAND_ATTRIBUTE, handleRaiseHandEvent);

    return () => {
      // Cleanup event listener
      events.off(
        EventNames.BREAKOUT_RAISE_HAND_ATTRIBUTE,
        handleRaiseHandEvent,
      );
    };
  }, [localUid, getDisplayName]);

  // Clear raised hands when room changes (optional: could be handled by RTM attribute clearing)
  useEffect(() => {
    setRaisedHands({});
  }, [roomInfo.data?.channel]);

  const contextValue: RaiseHandState = {
    raisedHands,
    isHandRaised,
    isUserHandRaised,
    raiseHand,
    lowerHand,
    toggleHand,
  };

  return (
    <RaiseHandContext.Provider value={contextValue}>
      {children}
    </RaiseHandContext.Provider>
  );
};

// Hook to use raise hand functionality
export const useRaiseHand = (): RaiseHandState => {
  const context = useContext(RaiseHandContext);
  if (!context) {
    throw new Error('useRaiseHand must be used within RaiseHandProvider');
  }
  return context;
};

export default RaiseHandProvider;
