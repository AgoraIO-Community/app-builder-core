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

export const canViewInLarge = (
  uid: UidType,
  pinnedUid?: UidType,
  secondaryPinnedUid?: UidType,
  fallbackMaximizedUid?: UidType,
) =>
  !isUidMaximized(uid, pinnedUid, fallbackMaximizedUid) &&
  uid !== secondaryPinnedUid;
