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
  useCallback,
  useRef,
  useState,
} from 'react';
import {
  ToggleState,
  PermissionState,
  DefaultContentInterface,
  ContentInterface,
} from '../../agora-rn-uikit';
import {MUTE_LOCAL_TYPE} from '../utils/useMuteToggleLocal';

// RTM User Preferences interface - session-scoped preferences that survive room transitions
export interface UserGlobalPreferences {
  audioMuted: boolean; // false = unmuted (0), true = muted (1)
  videoMuted: boolean; // false = unmuted (0), true = muted (1)
  virtualBackground?: {
    type: 'blur' | 'image' | 'none';
    imageUrl?: string;
    blurIntensity?: number;
  };
}

// Default user preferences
export const DEFAULT_USER_PREFERENCES: UserGlobalPreferences = {
  audioMuted: false, // Default unmuted (0 = unmuted)
  videoMuted: false, // Default unmuted (0 = unmuted)
  virtualBackground: {
    type: 'none',
  },
};

interface UserGlobalPreferenceInterface {
  userGlobalPreferences: UserGlobalPreferences;
  syncUserPreferences: (prefs: Partial<UserGlobalPreferences>) => void;
  applyUserPreferences: (
    currentUserData: ContentInterface,
    toggleMuteFn: (type: number, action?: number) => Promise<void>,
  ) => Promise<void>;
}

const UserGlobalPreferenceContext =
  createContext<UserGlobalPreferenceInterface | null>(null);

interface UserGlobalPreferenceProviderProps {
  children: React.ReactNode;
}

export const UserGlobalPreferenceProvider: React.FC<
  UserGlobalPreferenceProviderProps
> = ({children}) => {
  // User preferences (survives room transitions)
  const [userGlobalPreferences, setUserGlobalPreferences] =
    useState<UserGlobalPreferences>(DEFAULT_USER_PREFERENCES);
  console.log('UP: userGlobalPreferences changed: ', userGlobalPreferences);

  const hasAppliedPreferences = useRef(false);

  const syncUserPreferences = useCallback(
    (prefs: Partial<UserGlobalPreferences>) => {
      console.log('UserGlobalPreference: Syncing preferences', prefs);
      setUserGlobalPreferences(prev => ({
        ...prev,
        ...prefs,
      }));
    },
    [setUserGlobalPreferences],
  );

  const applyUserPreferences = useCallback(
    async (
      currentUserData: DefaultContentInterface,
      toggleMuteFn: (
        type: MUTE_LOCAL_TYPE,
        action?: ToggleState,
      ) => Promise<void>,
    ) => {
      console.log('UP: 1', userGlobalPreferences);
      // Only apply preferences once per component lifecycle
      if (hasAppliedPreferences.current) {
        console.log('UP: 2');
        console.log(
          'UserGlobalPreference: Preferences already applied, skipping',
        );
        return;
      }
      console.log('UP: 3');
      try {
        console.log(
          'UserGlobalPreference: Applying preferences',
          userGlobalPreferences,
        );
        console.log('UP: 4');

        const currentAudioState = currentUserData.audio;
        const currentVideoState = currentUserData.video;
        const permissionStatus = currentUserData.permissionStatus;
        const audioForceDisabled = currentUserData.audioForceDisabled;
        const videoForceDisabled = currentUserData.videoForceDisabled;

        console.log('UP: 5', {
          currentAudioState,
          currentVideoState,
          permissionStatus,
          audioForceDisabled,
          videoForceDisabled,
        });

        // Check if audio permissions are available and not force disabled
        const hasAudioPermission =
          (permissionStatus === PermissionState.GRANTED_FOR_CAM_AND_MIC ||
            permissionStatus === PermissionState.GRANTED_FOR_MIC_ONLY) &&
          !audioForceDisabled;

        // Check if video permissions are available and not force disabled
        const hasVideoPermission =
          (permissionStatus === PermissionState.GRANTED_FOR_CAM_AND_MIC ||
            permissionStatus === PermissionState.GRANTED_FOR_CAM_ONLY) &&
          !videoForceDisabled;

        // Apply audio mute preference only if user has audio permission and not force disabled
        if (hasAudioPermission) {
          const desiredAudioState = userGlobalPreferences.audioMuted
            ? ToggleState.disabled
            : ToggleState.enabled;
          console.log('UP: 6', desiredAudioState);

          if (currentAudioState !== desiredAudioState) {
            console.log('UP: 7 changed', currentAudioState, desiredAudioState);

            console.log(
              `UP: UserGlobalPreference: Applying audio state: ${
                desiredAudioState === ToggleState.disabled ? 'muted' : 'unmuted'
              }`,
              desiredAudioState,
            );
            await toggleMuteFn(MUTE_LOCAL_TYPE.audio, desiredAudioState);
          }
        } else {
          console.log(
            'UP: Skipping audio preference - no audio permission or force disabled',
          );
        }

        // Apply video mute preference only if user has video permission and not force disabled
        if (hasVideoPermission) {
          const desiredVideoState = userGlobalPreferences.videoMuted
            ? ToggleState.disabled
            : ToggleState.enabled;
          console.log('UP: 8', currentVideoState, desiredVideoState);

          if (currentVideoState !== desiredVideoState) {
            console.log('UP: 9 changed');

            console.log(
              `UserGlobalPreference: Applying video state: ${
                desiredVideoState === ToggleState.disabled ? 'muted' : 'unmuted'
              }`,
            );
            await toggleMuteFn(MUTE_LOCAL_TYPE.video, desiredVideoState);
          }
        } else {
          console.log(
            'UP: Skipping video preference - no video permission or force disabled',
          );
        }

        // Virtual background preferences will be handled by useVB hook
        // since it reads from userGlobalPreferences state on component mount

        hasAppliedPreferences.current = true;
        console.log('UserGlobalPreference: Preferences applied successfully');
      } catch (error) {
        console.warn(
          'UserGlobalPreference: Failed to apply preferences:',
          error,
        );
      }
    },
    [userGlobalPreferences],
  );

  // Reset the application flag when preferences change
  // This allows re-application if preferences are updated
  React.useEffect(() => {
    hasAppliedPreferences.current = false;
  }, [userGlobalPreferences]);

  const contextValue: UserGlobalPreferenceInterface = {
    userGlobalPreferences,
    syncUserPreferences,
    applyUserPreferences,
  };

  return (
    <UserGlobalPreferenceContext.Provider value={contextValue}>
      {children}
    </UserGlobalPreferenceContext.Provider>
  );
};

export const useUserGlobalPreferences = (): UserGlobalPreferenceInterface => {
  const context = useContext(UserGlobalPreferenceContext);
  if (!context) {
    throw new Error(
      'useUserGlobalPreferences must be used within UserGlobalPreferenceProvider',
    );
  }
  return context;
};

export default UserGlobalPreferenceProvider;
