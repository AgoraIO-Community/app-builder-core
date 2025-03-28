import React from 'react';
import {useContext} from 'react';
import {ClientRoleType, PropsContext} from '../../../agora-rn-uikit/src';
import {useRoomInfo} from '../room-info/useRoomInfo';
import {joinRoomPreference} from '../../utils/useJoinRoom';
import isMobileOrTablet from '../../utils/isMobileOrTablet';

/**
 * ControlPermissionKey represents the different keys
 * for meeting control permissions.
 */
export type ControlPermissionKey =
  | 'chatControl'
  | 'inviteControl'
  | 'participantControl'
  | 'screenshareControl'
  | 'settingsControl';

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
  chatControl: ({preference}) => $config.CHAT && !preference.disableChat,
  inviteControl: ({preference}) => !preference.disableInvite,
  participantControl: ({preference}) => !preference.disableParticipants,
  settingsControl: ({preference}) => !preference.disableSettings,
  screenshareControl: ({preference}) =>
    $config.SCREEN_SHARING && !preference.disableScreenShare,
  // !(
  //   $config.EVENT_MODE &&
  //   role == ClientRoleType.ClientRoleAudience &&
  //   !$config.RAISE_HAND
  // ),
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
