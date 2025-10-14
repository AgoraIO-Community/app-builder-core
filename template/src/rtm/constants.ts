import {EventNames} from '../rtm-events';

export enum RTM_ROOMS {
  BREAKOUT = 'BREAKOUT',
  MAIN = 'MAIN',
}

// RTM attributes to reset when room changes
export const RTM_EVENTS_ATTRIBUTES_TO_RESET_WHEN_ROOM_CHANGES = [
  EventNames.RAISED_ATTRIBUTE, // (livestream)
  EventNames.BREAKOUT_RAISE_HAND_ATTRIBUTE, // Breakout room raise hand ( will be made into independent)
] as const;
