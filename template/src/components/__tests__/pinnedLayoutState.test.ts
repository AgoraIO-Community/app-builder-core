import {
  canViewInLarge,
  getPinnedLayoutState,
  isUidMaximized,
} from '../pinnedLayoutState';

describe('pinned layout state', () => {
  it('keeps every non-maximized UID visible when active-speaker ordering moves another UID to index zero', () => {
    expect(getPinnedLayoutState([200, 101, 100, 201], 101)).toEqual({
      maximizedUid: 101,
      sidebarUids: [200, 100, 201],
    });
  });

  it('keeps the secondary pin first without removing any other sidebar UID', () => {
    expect(getPinnedLayoutState([200, 100, 101, 201], 101, 100)).toEqual({
      maximizedUid: 101,
      sidebarUids: [100, 200, 201],
    });
  });

  it('falls back to the first render UID when there is no valid primary pin', () => {
    expect(getPinnedLayoutState([200, 100, 101], 999)).toEqual({
      maximizedUid: 200,
      sidebarUids: [100, 101],
    });
  });

  it('does not offer View in large for either pinned position', () => {
    expect(canViewInLarge(101, 101, 100)).toBe(false);
    expect(canViewInLarge(100, 101, 100)).toBe(false);
    expect(canViewInLarge(200, 101, 100)).toBe(true);
  });

  it('does not offer View in large for the fallback maximized UID', () => {
    expect(canViewInLarge(101, undefined, 100, 101)).toBe(false);
    expect(canViewInLarge(100, undefined, 100, 101)).toBe(false);
    expect(canViewInLarge(200, undefined, 100, 101)).toBe(true);
  });

  it('identifies explicit and fallback maximized UIDs for tile actions', () => {
    expect(isUidMaximized(101, 101, 200)).toBe(true);
    expect(isUidMaximized(200, 101, 200)).toBe(false);
    expect(isUidMaximized(200, undefined, 200)).toBe(true);
    expect(isUidMaximized(100, undefined, 200)).toBe(false);
  });
});
