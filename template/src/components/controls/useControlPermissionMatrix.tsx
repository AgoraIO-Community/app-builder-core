import React from 'react';
import {useContext} from 'react';
import {ClientRoleType, PropsContext} from '../../../agora-rn-uikit';
import {useRoomInfo} from '../room-info/useRoomInfo';
import {joinRoomPreference} from '../../utils/useJoinRoom';
import {isWeb, isWebInternal} from '../../utils/common';
import {ENABLE_AUTH} from '../../auth/config';
import {useRoomLifecycle} from '../room-info/RoomLifecycleContext';

/**
 * ControlPermissionKey represents the different keys
 * for meeting control permissions.
 */
export type ControlPermissionKey =
  | 'showInviteTile'
  | 'chatControl'
  | 'inviteControl'
  | 'participantControl'
  | 'screenshareControl'
  | 'settingsControl'
  | 'viewAllTextTracksControl'
  | 'breakoutRoomControl'
  | 'whiteboardControl'
  | 'recordingControl'
  | 'captionsControl'
  | 'transcriptsControl';

/**
 * ControlPermissionRule defines the properties used to evaluate permission rules.
 */
export type ControlPermissionRule = {
  isHost: boolean;
  role: ClientRoleType;
  preference: joinRoomPreference;
  isInBreakoutRoom: boolean;
};

export const controlPermissionMatrix: Record<
  ControlPermissionKey,
  (rule: ControlPermissionRule) => boolean
> = {
  // Layout
  showInviteTile: ({role, isInBreakoutRoom}) => {
    // Audience in event mode should NEVER see invite tile
    if ($config.EVENT_MODE && role === ClientRoleType.ClientRoleAudience) {
      return false;
    }
    // Users inside breakout rooms should not see invite tile
    if (isInBreakoutRoom) {
      return false;
    }
    // Otherwise show
    return true;
  },
  // More Menu controls
  chatControl: ({preference}) => $config.CHAT && !preference.disableChat,
  inviteControl: ({preference}) => !preference.disableInvite,
  participantControl: ({preference}) => !preference.disableParticipants,
  settingsControl: ({preference}) => !preference.disableSettings,
  screenshareControl: ({preference}) =>
    $config.SCREEN_SHARING && !preference.disableScreenShare,
  viewAllTextTracksControl: ({isHost, isInBreakoutRoom}) =>
    isHost &&
    $config.ENABLE_STT &&
    $config.ENABLE_MEETING_TRANSCRIPT &&
    $config.ENABLE_TEXT_TRACKS &&
    isWeb(),
  whiteboardControl: ({isHost}) =>
    isHost && $config.ENABLE_WHITEBOARD && isWebInternal(),
  recordingControl: ({isHost}) => isHost && $config.CLOUD_RECORDING,
  captionsControl: ({isInBreakoutRoom}) =>
    $config.ENABLE_STT && $config.ENABLE_CAPTION && !isInBreakoutRoom,
  transcriptsControl: ({isInBreakoutRoom}) =>
    $config.ENABLE_MEETING_TRANSCRIPT && !isInBreakoutRoom,
  breakoutRoomControl: () =>
    isWeb() &&
    $config.ENABLE_BREAKOUT_ROOM &&
    ENABLE_AUTH &&
    !$config.ENABLE_CONVERSATIONAL_AI &&
    !$config.EVENT_MODE &&
    !$config.RAISE_HAND &&
    !$config.ENABLE_WAITING_ROOM,
};

export const useControlPermissionMatrix = (
  key: ControlPermissionKey,
): boolean => {
  const {data: roomData, roomPreference} = useRoomInfo();
  const {rtcProps} = useContext(PropsContext);
  const {isInBreakoutRoom} = useRoomLifecycle();

  // Build the permission rule context for the current user.
  const rule: ControlPermissionRule = {
    isHost: roomData?.isHost || false,
    role: rtcProps.role,
    preference: {...roomPreference},
    isInBreakoutRoom: isInBreakoutRoom,
  };
  // Retrieve the permission function for the given key and evaluate it.
  const permissionFn = controlPermissionMatrix[key];
  return permissionFn ? permissionFn(rule) : false;
};
