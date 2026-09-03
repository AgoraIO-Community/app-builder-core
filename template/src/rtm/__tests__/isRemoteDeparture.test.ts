import {describe, expect, it} from '@jest/globals';
import {isRemoteDeparture} from '../isRemoteDeparture';

describe('isRemoteDeparture', () => {
  it('always treats an explicit remote leave as a departure', () => {
    expect(isRemoteDeparture(4, false)).toBe(true);
    expect(isRemoteDeparture(4, true)).toBe(true);
  });

  it('treats a remote timeout as a departure only when enabled', () => {
    expect(isRemoteDeparture(5, true)).toBe(true);
    expect(isRemoteDeparture(5, false)).toBe(false);
  });

  it('ignores unrelated presence event types', () => {
    expect(isRemoteDeparture(3, true)).toBe(false);
    expect(isRemoteDeparture(6, true)).toBe(false);
  });
});
