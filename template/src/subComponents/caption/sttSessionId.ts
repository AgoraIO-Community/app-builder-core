export const STT_SESSION_ID_KEY = 'STT_SESSION_ID';

export const ensureSTTSessionId = async (
  _channelName: string,
): Promise<string | undefined> => undefined;

export const isOnlyLocalRTMParticipant = async (
  _channelName: string,
  _localUid: string,
): Promise<boolean> => false;

export const clearSTTSessionIdIfLast = async (
  _channelName: string,
  _localUid: string,
): Promise<boolean> => false;

export const cleanupSTTSessionOnEnd = async (
  _channelName: string,
  _localUid: string,
  _isSTTActive: boolean,
  _stopSTT: () => Promise<void>,
): Promise<void> => {};

export const resetSTTSessionIdCache = (_channelName?: string): void => {};
