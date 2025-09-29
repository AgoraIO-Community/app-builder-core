import {RTM_EVENT_SCOPE} from '../rtm-events';
import {RTM_ROOMS} from './constants';

export const hasJsonStructure = (str: string) => {
  if (typeof str !== 'string') {
    return false;
  }
  try {
    const result = JSON.parse(str);
    const type = Object.prototype.toString.call(result);
    return type === '[object Object]' || type === '[object Array]';
  } catch (err) {
    return false;
  }
};

export const safeJsonParse = (str: string) => {
  try {
    return [null, JSON.parse(str)];
  } catch (err) {
    return [err];
  }
};

export const adjustUID = (uid: number): number => {
  let adjustedUID = uid;
  if (adjustedUID < 0) {
    adjustedUID = uid + parseInt('0xffffffff') + 1;
  }
  return adjustedUID;
};

export const timeNow = () => new Date().getTime();

export const getMessageTime = (ts?: number): number => {
  if (!ts) return timeNow();
  try {
    const timestamp = new Date(ts).getTime();
    return isNaN(timestamp) ? timeNow() : timestamp;
  } catch (error) {
    return timeNow();
  }
};

export const get32BitUid = (peerId: string) => {
  let arr = new Int32Array(1);
  arr[0] = parseInt(peerId);
  return arr[0];
};

export function isEventForActiveChannel(
  scope: RTM_EVENT_SCOPE,
  eventChannelId: string | undefined,
  currentChannel: string,
): boolean {
  // Case 1: Events without scope/channel → assume SERVER event → always pass
  if (!scope && !eventChannelId) {
    console.log(
      'isEventForActiveChannel: passing server event (no scope/channel)',
    );
    return true;
  }

  // Case 2: Global events always pass
  if (scope === RTM_EVENT_SCOPE.GLOBAL) {
    return true;
  }

  // Case 3: Local and Session scope must match current channel
  if (
    (scope === RTM_EVENT_SCOPE.LOCAL || scope === RTM_EVENT_SCOPE.SESSION) &&
    eventChannelId !== currentChannel
  ) {
    console.log(
      `isEventForActiveChannel: skipped ${scope.toLowerCase()} event (expected=${currentChannel}, got=${eventChannelId})`,
    );
    return false;
  }
  // Default: allow
  return true;
}

export function stripRoomPrefixFromEventKey(
  eventKey: string,
  currentRoomKey: string,
): string | null {
  // Event key
  if (!eventKey) {
    return eventKey;
  }

  // Only handle room-aware keys
  if (!eventKey.startsWith(`${currentRoomKey}__`)) {
    return eventKey;
  }

  // Format: room__<roomKey>__<evt>
  const parts = eventKey.split('__');
  console.log('supriya-session-attribute parts: ', parts);
  const [roomKey, ...evtParts] = parts;

  console.log('supriya-session-attribute parts:', roomKey, evtParts);

  // If the roomKey matches current room, strip and return event name
  if (roomKey === currentRoomKey) {
    console.log(
      'supriya-session-attribute Matched current room, stripping prefix:',
      roomKey,
    );
    return evtParts.join('__');
  }

  // If the roomKey is "MAIN" or "BREAKOUT" but doesn't match current room → skip
  if (roomKey === RTM_ROOMS.MAIN || roomKey === RTM_ROOMS.BREAKOUT) {
    console.log(
      'supriya-session-attribute Prefix is MAIN/BREAKOUT but does not match, skipping',
    );
    return null;
  }

  // Different room → skip
  console.log(
    'supriya-session-attribute Different room, skipping event:',
    roomKey,
    currentRoomKey,
  );
  return null;
}
