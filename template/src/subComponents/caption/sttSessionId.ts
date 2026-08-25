import RTMEngine from '../../rtm/RTMEngine';
import getUniqueID from '../../utils/getUniqueID';
import {createSTTSessionCoordinator} from './sttSessionCoordinator';

export {
  createSTTSessionCoordinator,
  STT_SESSION_ID_KEY,
} from './sttSessionCoordinator';

const coordinator = createSTTSessionCoordinator({
  getClient: () => RTMEngine.getInstance().engine,
  createId: getUniqueID,
  wait: milliseconds =>
    new Promise(resolve => setTimeout(resolve, milliseconds)),
});

export const ensureSTTSessionId = coordinator.ensureSTTSessionId;
export const isOnlyLocalRTMParticipant = coordinator.isOnlyLocalRTMParticipant;
export const clearSTTSessionIdIfLast = coordinator.clearSTTSessionIdIfLast;
export const cleanupSTTSessionOnEnd = coordinator.cleanupSTTSessionOnEnd;
export const resetSTTSessionIdCache = coordinator.resetSTTSessionIdCache;
