import {
  getCurrentActiveSpeaker,
  resetCurrentActiveSpeakerForTests,
  setCurrentActiveSpeaker,
} from '../activeSpeakerState';

describe('activeSpeakerState', () => {
  afterEach(() => {
    resetCurrentActiveSpeakerForTests();
  });

  it('stores the current active speaker for remount hydration', () => {
    expect(getCurrentActiveSpeaker()).toBeUndefined();
    expect(setCurrentActiveSpeaker(101)).toBe(101);
    expect(getCurrentActiveSpeaker()).toBe(101);
  });

  it('clears the cache when nobody is speaking (uid 0)', () => {
    setCurrentActiveSpeaker(101);
    expect(setCurrentActiveSpeaker(0)).toBeUndefined();
    expect(getCurrentActiveSpeaker()).toBeUndefined();
  });
});
