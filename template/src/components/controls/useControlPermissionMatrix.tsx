import React from 'react';
import {useContext} from 'react';
import {ClientRoleType, PropsContext} from '../../../agora-rn-uikit/src';
import {useRoomInfo} from '../room-info/useRoomInfo';
import {isWeb, isWebInternal} from '../../utils/common';
import {joinRoomPreference} from '../../utils/useJoinRoom';
import isMobileOrTablet from '../../utils/isMobileOrTablet';

/**
 * ControlPermissionKey represents the different keys
 * for meeting control permissions.
 */
export type ControlPermissionKey =
  | 'whiteboardControl'
  | 'chatControl'
  | 'viewRecordingControl'
  | 'startRecordingControl'
  | 'screenshareControl'
  | 'captionControl'
  | 'inviteControl'
  | 'noiseCancellationControl'
  | 'virtualBackgroundControl'
  | 'sttControl'
  | 'transcriptControl'
  | 'participantControl'
  | 'settingsControl'
  | 'inviteControl'
  | 'raiseHandControl';

/**
 * ControlPermissionRule defines the properties used to evaluate permission rules.
 */
export type ControlPermissionRule = {
  isHost: boolean;
  role: ClientRoleType;
  preference: joinRoomPreference;
};

export const controlPermissionMatrix: Record<
  ControlPermissionKey,
  (rule: ControlPermissionRule) => boolean
> = {
  whiteboardControl: ({isHost}) =>
    isHost && $config.ENABLE_WHITEBOARD && isWebInternal(),
  chatControl: ({preference}) => $config.CHAT && !preference.disableChat,
  viewRecordingControl: ({isHost}) =>
    isHost && $config.CLOUD_RECORDING && isWeb(),
  startRecordingControl: ({isHost}) => isHost && $config.CLOUD_RECORDING,
  screenshareControl: ({role, preference}) =>
    $config.SCREEN_SHARING &&
    !isMobileOrTablet() &&
    !preference.disableScreenShare &&
    !(
      $config.EVENT_MODE &&
      role == ClientRoleType.ClientRoleAudience &&
      !$config.RAISE_HAND
    ),
  noiseCancellationControl: () => $config.ENABLE_NOISE_CANCELLATION,
  virtualBackgroundControl: () =>
    $config.ENABLE_VIRTUAL_BACKGROUND && !$config.AUDIO_ROOM && false,
  sttControl: () => $config.ENABLE_STT && $config.ENABLE_CAPTION,
  captionControl: () => $config.ENABLE_CAPTION,
  transcriptControl: () =>
    $config.ENABLE_STT &&
    $config.ENABLE_CAPTION &&
    $config.ENABLE_MEETING_TRANSCRIPT,
  participantControl: ({preference}) => !preference.disableParticipantsPanel,
  settingsControl: ({preference}) => !preference.disableSettings,
  inviteControl: ({preference}) => !preference.disableInvite,
  raiseHandControl: () => $config.EVENT_MODE && $config.RAISE_HAND,
};

export const useControlPermissionMatrix = (
  key: ControlPermissionKey,
): boolean => {
  const {data: roomData, roomPreference} = useRoomInfo();
  const {rtcProps} = useContext(PropsContext);

  // Build the permission rule context for the current user.
  const rule: ControlPermissionRule = {
    isHost: roomData?.isHost || false,
    role: rtcProps.role,
    preference: {...roomPreference},
  };
  // Retrieve the permission function for the given key and evaluate it.
  const permissionFn = controlPermissionMatrix[key];
  return permissionFn ? permissionFn(rule) : false;
};

export function withControlPermissionHOC<P>(
  WrappedComponent: React.ComponentType<P>,
  permissionKey: ControlPermissionKey,
) {
  return (props: P) => {
    const allowed = useControlPermissionMatrix(permissionKey);
    if (!allowed) {
      return null;
    }
    return <WrappedComponent {...props} />;
  };
}
