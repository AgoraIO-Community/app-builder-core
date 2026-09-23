import {TRANSCRIPT_JOURNEY} from '../transcriptJourney';

describe('transcript journey logging', () => {
  it('uses one searchable prefix', () => {
    expect(TRANSCRIPT_JOURNEY).toBe('[TRANSCRIPT_JOURNEY]');
  });
});
