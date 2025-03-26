import React from 'react';
import UserActionMenuOptionsOptions from '../../src/components/participants/UserActionMenuOptions';
import {IconsInterface} from './CustomIcon';

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

export const DEFAULT_ACTION_KEYS: string[] = [
  'view-in-large',
  'pin-to-top',
  'change-name',
  'message-privately',
  'mute-audio',
  'mute-video',
  'remove-from-room',
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
export type UserActionMenuItemLabelCallback = (languageCode: string) => string;
export type UserActionMenuItemLabel = string | UserActionMenuItemLabelCallback;

export interface UserActionMenuDefaultItem {
  hide?: boolean;
  order?: number;
  label?: UserActionMenuItemLabel; // for static items
  icon?: keyof IconsInterface;
  iconColor?: string;
  textColor?: string;
  onPress?: () => void; // replace existing logic
  onAction?: () => void; // add additional logic

  // toggleable props - optional
  onLabel?: UserActionMenuItemLabel;
  offLabel?: UserActionMenuItemLabel;
  onIcon?: keyof IconsInterface;
  offIcon?: keyof IconsInterface;
  onHoverOnIcon?: keyof IconsInterface;
  onHoverOffIcon?: keyof IconsInterface;

  visibility?: ActionVisibility[]; // to whom  custom action item should be visible , build in actions menu is already handled
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

// 'ban-user': {
//   component: <BanUser />,
//   order: 5,
//   hide: false,
//   label: 'Ban this user',
// }

const UserActionMenuPreset: React.FC<UserActionMenuPresetProps> = ({items}) => {
  return <UserActionMenuOptionsOptions items={items} />;
};

export default UserActionMenuPreset;
