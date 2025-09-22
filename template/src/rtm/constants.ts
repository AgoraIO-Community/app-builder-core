export enum RTM_ROOMS {
  BREAKOUT = 'BREAKOUT',
  MAIN = 'MAIN',
}

// RTM attributes to reset when room changes
export const RTM_ATTRIBUTES_TO_RESET_WHEN_ROOM_CHANGES = [
  'raised',         // EventNames.RAISED_ATTRIBUTE
  'STT_IS_ACTIVE',  // EventNames.STT_ACTIVE
  'STT_LANGUAGE_CHANGED', // EventNames.STT_LANGUAGE
  'role',           // EventNames.ROLE_ATTRIBUTE
] as const;
