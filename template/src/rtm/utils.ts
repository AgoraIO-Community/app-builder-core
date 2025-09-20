import {RTM_EVENT_SCOPE} from '../rtm-events';

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
  // Case 1: Global events always pass
  if (scope === RTM_EVENT_SCOPE.GLOBAL) {
    return true;
  }
  // Case 2: Events without scope/channel → assume SERVER event → always pass
  if (!scope && !eventChannelId) {
    console.log(
      'isEventForActiveChannel: passing server event (no scope/channel)',
    );
    return true;
  }

  // Case 3: Local scope must match current channel
  if (scope === RTM_EVENT_SCOPE.LOCAL && eventChannelId !== currentChannel) {
    console.log(
      `isEventForActiveChannel: skipped local event (expected=${currentChannel}, got=${eventChannelId})`,
    );
    return false;
  }
  // Default: allow
  return true;
}
