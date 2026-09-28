import {UidType} from '../../agora-rn-uikit';

export const getPinnedLayoutState = (
  renderData: UidType[],
  pinnedUid?: UidType,
  secondaryPinnedUid?: UidType,
) => {
  const maximizedUid: UidType =
    (pinnedUid && renderData.includes(pinnedUid) ? pinnedUid : renderData[0]) ||
    0;
  const sidebarUids = renderData.filter(uid => uid !== maximizedUid);

  if (
    secondaryPinnedUid &&
    sidebarUids.includes(secondaryPinnedUid) &&
    sidebarUids[0] !== secondaryPinnedUid
  ) {
    return {
      maximizedUid,
      sidebarUids: [
        secondaryPinnedUid,
        ...sidebarUids.filter(uid => uid !== secondaryPinnedUid),
      ],
    };
  }

  return {maximizedUid, sidebarUids};
};

export const isUidMaximized = (
  uid: UidType,
  pinnedUid?: UidType,
  fallbackMaximizedUid?: UidType,
) => uid === (pinnedUid || fallbackMaximizedUid);

/**
 * Whether the tile action menu may offer "View in large".
 *
 * Pinned-layout rules (explicit pin, pin-to-top, fallback max at activeUids[0])
 * only apply while the current layout is pinned/sidebar. In Grid there is no
 * large tile, so the action must stay available even if pinnedUid or
 * activeUids[0] still point at this user from a prior pinned session.
 */
export const canViewInLarge = (
  uid: UidType,
  pinnedUid?: UidType,
  secondaryPinnedUid?: UidType,
  fallbackMaximizedUid?: UidType,
  isPinnedLayout: boolean = true,
) => {
  if (!isPinnedLayout) {
    return true;
  }

  return (
    !isUidMaximized(uid, pinnedUid, fallbackMaximizedUid) &&
    uid !== secondaryPinnedUid
  );
};
