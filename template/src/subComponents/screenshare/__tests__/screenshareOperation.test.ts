import {
  getScreenshareStartDecision,
  getScreenshareStopDecision,
} from '../screenshareOperation';

describe('screen-share operation decisions', () => {
  it.each([
    ['inactive', 'accept'],
    ['starting', 'skip'],
    ['active', 'skip'],
    ['stopping', 'skip'],
  ] as const)('handles Start while %s', (state, expected) => {
    expect(getScreenshareStartDecision(state)).toBe(expected);
  });

  it('queues the first Stop received while Start is pending', () => {
    expect(getScreenshareStopDecision('starting', false)).toBe('queue');
  });

  it('skips additional Stops when one is already queued', () => {
    expect(getScreenshareStopDecision('starting', true)).toBe('skip');
  });

  it.each([
    ['inactive', 'skip'],
    ['active', 'execute'],
    ['stopping', 'skip'],
  ] as const)('handles Stop while %s', (state, expected) => {
    expect(getScreenshareStopDecision(state, false)).toBe(expected);
  });
});
