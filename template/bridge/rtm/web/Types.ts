import {ChannelType as WebChannelType} from 'agora-rtm-sdk';

export interface AttributesMap {
  [key: string]: string;
}

export interface ChannelAttributeOptions {
  /**
   * Indicates whether or not to notify all channel members of a channel attribute change
   * This flag is valid only within the current method call:
   * true:  Notify all channel members of a channel attribute change.
   * false: (Default) Do not notify all channel members of a channel attribute change.
   */
  enableNotificationToChannelMembers?: undefined | false | true;
}

// LINK STATE
export const nativeLinkStateMapping = {
  IDLE: 0,
  CONNECTING: 1,
  CONNECTED: 2,
  DISCONNECTED: 3,
  SUSPENDED: 4,
  FAILED: 5,
};

// Create reverse mapping: number -> string
export const webLinkStateMapping = Object.fromEntries(
  Object.entries(nativeLinkStateMapping).map(([key, value]) => [value, key]),
);

export const linkStatusReasonCodeMapping: {[key: string]: number} = {
  UNKNOWN: 0,
  LOGIN: 1,
  LOGIN_SUCCESS: 2,
  LOGIN_TIMEOUT: 3,
  LOGIN_NOT_AUTHORIZED: 4,
  LOGIN_REJECTED: 5,
  RELOGIN: 6,
  LOGOUT: 7,
  AUTO_RECONNECT: 8,
  RECONNECT_TIMEOUT: 9,
  RECONNECT_SUCCESS: 10,
  JOIN: 11,
  JOIN_SUCCESS: 12,
  JOIN_FAILED: 13,
  REJOIN: 14,
  LEAVE: 15,
  INVALID_TOKEN: 16,
  TOKEN_EXPIRED: 17,
  INCONSISTENT_APP_ID: 18,
  INVALID_CHANNEL_NAME: 19,
  INVALID_USER_ID: 20,
  NOT_INITIALIZED: 21,
  RTM_SERVICE_NOT_CONNECTED: 22,
  CHANNEL_INSTANCE_EXCEED_LIMITATION: 23,
  OPERATION_RATE_EXCEED_LIMITATION: 24,
  CHANNEL_IN_ERROR_STATE: 25,
  PRESENCE_NOT_CONNECTED: 26,
  SAME_UID_LOGIN: 27,
  KICKED_OUT_BY_SERVER: 28,
  KEEP_ALIVE_TIMEOUT: 29,
  CONNECTION_ERROR: 30,
  PRESENCE_NOT_READY: 31,
  NETWORK_CHANGE: 32,
  SERVICE_NOT_SUPPORTED: 33,
  STREAM_CHANNEL_NOT_AVAILABLE: 34,
  STORAGE_NOT_AVAILABLE: 35,
  LOCK_NOT_AVAILABLE: 36,
  LOGIN_TOO_FREQUENT: 37,
};

// CHANNEL TYPE
// string -> number
export const nativeChannelTypeMapping = {
  NONE: 0,
  MESSAGE: 1,
  STREAM: 2,
  USER: 3,
};
// number -> string
export const webChannelTypeMapping = Object.fromEntries(
  Object.entries(nativeChannelTypeMapping).map(([key, value]) => [value, key]),
);

// STORAGE TYPE
// string -> number
export const nativeStorageTypeMapping = {
  NONE: 0,
  /**
   * 1: The user storage event.
   */
  USER: 1,
  /**
   * 2: The channel storage event.
   */
  CHANNEL: 2,
};
// number -> string
export const webStorageTypeMapping = Object.fromEntries(
  Object.entries(nativeStorageTypeMapping).map(([key, value]) => [value, key]),
);

// STORAGE EVENT TYPE
export const nativeStorageEventTypeMapping = {
  /**
   * 0: Unknown event type.
   */
  NONE: 0,
  /**
   * 1: Triggered when user subscribe user metadata state or join channel with options.withMetadata = true
   */
  SNAPSHOT: 1,
  /**
   * 2: Triggered when a remote user set metadata
   */
  SET: 2,
  /**
   * 3: Triggered when a remote user update metadata
   */
  UPDATE: 3,
  /**
   * 4: Triggered when a remote user remove metadata
   */
  REMOVE: 4,
};
// number -> string
export const webStorageEventTypeMapping = Object.fromEntries(
  Object.entries(nativeStorageEventTypeMapping).map(([key, value]) => [
    value,
    key,
  ]),
);

// PRESENCE EVENT TYPE
export const nativePresenceEventTypeMapping = {
  /**
   * 0: Unknown event type
   */
  NONE: 0,
  /**
   * 1: The presence snapshot of this channel
   */
  SNAPSHOT: 1,
  /**
   * 2: The presence event triggered in interval mode
   */
  INTERVAL: 2,
  /**
   * 3: Triggered when remote user join channel
   */
  REMOTE_JOIN: 3,
  /**
   * 4: Triggered when remote user leave channel
   */
  REMOTE_LEAVE: 4,
  /**
   * 5: Triggered when remote user's connection timeout
   */
  REMOTE_TIMEOUT: 5,
  /**
   * 6: Triggered when user changed state
   */
  REMOTE_STATE_CHANGED: 6,
  /**
   * 7: Triggered when user joined channel without presence service
   */
  ERROR_OUT_OF_SERVICE: 7,
};
// number -> string
export const webPresenceEventTypeMapping = Object.fromEntries(
  Object.entries(nativePresenceEventTypeMapping).map(([key, value]) => [
    value,
    key,
  ]),
);

// MESSAGE EVENT TYPE
// string -> number
export const nativeMessageEventTypeMapping = {
  /**
   * 0: The binary message.
   */
  BINARY: 0,
  /**
   * 1: The ascii message.
   */
  STRING: 1,
};
// number -> string
export const webMessageEventTypeMapping = Object.fromEntries(
  Object.entries(nativePresenceEventTypeMapping).map(([key, value]) => [
    value,
    key,
  ]),
);
