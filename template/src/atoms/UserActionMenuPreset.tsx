import React, {ComponentType} from 'react';
import UserActionMenuOptionsOptions from '../../src/components/participants/UserActionMenuOptions';
import {UidType} from '../../agora-rn-uikit';

//current_role-target_role
export type ActionVisibility =
  | 'host-self'
  | 'host-remote'
  | 'attendee-self'
  | 'attendee-remote'
  | 'event-host-remote'
  | 'event-host-self'
  | 'event-attendee-remote'
  | 'event-attendee-self';

export const ActionMenuKeys = {
  REMOVE_FROM_ROOM: 'remove-from-room',
  MUTE_AUDIO: 'mute-audio',
  MUTE_VIDEO: 'mute-video',
  PIN_TO_TOP: 'pin-to-top',
  VIEW_IN_LARGE: 'view-in-large',
  MESSAGE_PRIVATELY: 'message-privately',
  REMOVE_SCREENSHARE: 'remove-screenshare',
  CHANGE_NAME: 'change-name',
  // Add others here
} as const;

export type ActionMenuKey =
  (typeof ActionMenuKeys)[keyof typeof ActionMenuKeys];

export const DEFAULT_ACTION_KEYS: ActionMenuKey[] = [
  ActionMenuKeys.REMOVE_FROM_ROOM,
  ActionMenuKeys.MUTE_AUDIO,
  ActionMenuKeys.MUTE_VIDEO,
  ActionMenuKeys.PIN_TO_TOP,
  ActionMenuKeys.VIEW_IN_LARGE,
  ActionMenuKeys.MESSAGE_PRIVATELY,
  ActionMenuKeys.REMOVE_SCREENSHARE,
  ActionMenuKeys.CHANGE_NAME,
];

export type HostSelfActionKeys = 'view-in-large' | 'change-name';

export type HostRemoteActionKeys =
  | 'view-in-large'
  | 'pin-to-top'
  | 'message-privately'
  | 'mute-audio'
  | 'mute-video'
  | 'remove-from-room'
  | 'remove-screenshare';

export type AttendeeSelfActionKeys = 'view-in-large' | 'change-name';

export type AttendeeRemoteActionKeys = 'view-in-large' | 'message-privately';

export interface UserActionMenuDefaultItem {
  hide?: boolean;
  order?: number;
  disabled?: boolean;
  onPress?: () => void; // replace existing logic
  onAction?: (uid?: UidType, hostMeetingId?: string) => void; // add additional logic
  visibility?: ActionVisibility[]; // to whom  custom action item should be visible , build in actions menu is already handled
  component?: React.ComponentType<{
    closeActionMenu: () => void;
    targetUid: UidType;
    hostMeetingId?: string;
    targetUidType: string;
  }>; // to override default component or add new
}
export type UserActionDefaultItemsConfig = {
  [key: string]: UserActionMenuDefaultItem;
};

export type HostSelfActionConfig =
  | {
      [key in HostSelfActionKeys]?: UserActionMenuDefaultItem;
    };
export type HostRemoteActionConfig =
  | {
      [key in HostRemoteActionKeys]?: UserActionMenuDefaultItem;
    };

export type AttendeeSelfActionConfig =
  | {
      [key in AttendeeSelfActionKeys]?: UserActionMenuDefaultItem;
    };

export type AttendeeRemoteActionConfig =
  | {
      [key in AttendeeRemoteActionKeys]?: UserActionMenuDefaultItem;
    };

export type UserActionMenuItemsConfig =
  | HostSelfActionConfig
  | HostRemoteActionConfig
  | AttendeeSelfActionConfig
  | AttendeeRemoteActionConfig
  | UserActionDefaultItemsConfig;

export type UserActionMenuPresetProps = {
  items?: UserActionMenuItemsConfig;
};

// const UserActionMenuPreset: React.FC<UserActionMenuPresetProps> = ({items}) => {
//   return <UserActionMenuOptionsOptions items={items} />;
// };

// export default UserActionMenuPreset;
