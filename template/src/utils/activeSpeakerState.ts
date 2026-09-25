import {UidType} from '../../agora-rn-uikit';

/**
 * Last known active-speaker uid shared across tile mounts.
 * Video tiles remount when moving into the large slot; without this cache
 * useActiveSpeaker would start as undefined and miss the current speaker
 * until the next ACTIVE_SPEAKER event (which is deduped for the same uid).
 */
let currentActiveSpeaker: UidType | undefined = undefined;

export const getCurrentActiveSpeaker = (): UidType | undefined =>
  currentActiveSpeaker;

export const setCurrentActiveSpeaker = (
  uid: UidType | undefined,
): UidType | undefined => {
  // 0 means nobody is speaking — normalize to undefined for consumers.
  currentActiveSpeaker = uid ? uid : undefined;
  return currentActiveSpeaker;
};

/** @internal test helper */
export const resetCurrentActiveSpeakerForTests = () => {
  currentActiveSpeaker = undefined;
};
