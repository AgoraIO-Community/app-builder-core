import {UidType} from '../../../agora-rn-uikit';
import {ScreenShareObjectInterface} from '../../components/contexts/ScreenShareContext';

export interface ScreenshareRecoveryCandidate {
  uid: UidType;
  previousPinnedUid: UidType;
  previousSecondaryPinnedUid?: UidType;
  previousLayout: string;
  screenshareStartedAt: number;
  activeScreenshareUidsAtDetection: UidType[];
  detectedAt: number;
  joinedLogged: boolean;
}

interface CaptureRecoveryCandidateArgs {
  previousActiveUids: UidType[];
  currentActiveUids: UidType[];
  previousPinnedUid?: UidType;
  previousSecondaryPinnedUid?: UidType;
  previousLayout: string;
  screenShareData: ScreenShareObjectInterface;
  detectedAt: number;
}

export const captureScreenshareRecoveryCandidate = ({
  previousActiveUids,
  currentActiveUids,
  previousPinnedUid,
  previousSecondaryPinnedUid,
  previousLayout,
  screenShareData,
  detectedAt,
}: CaptureRecoveryCandidateArgs): ScreenshareRecoveryCandidate | null => {
  // Recovery applies only when the tile that disappeared was the pinned tile,
  // was present in the previous RTC render list, and is still logically active
  // according to screen-share signaling. Intentional stops therefore do not
  // create recovery candidates.
  if (
    !previousPinnedUid ||
    !previousActiveUids.includes(previousPinnedUid) ||
    currentActiveUids.includes(previousPinnedUid) ||
    !screenShareData?.[previousPinnedUid]?.isActive
  ) {
    return null;
  }

  return {
    uid: previousPinnedUid,
    previousPinnedUid,
    previousSecondaryPinnedUid,
    previousLayout,
    screenshareStartedAt: screenShareData[previousPinnedUid]?.ts || 0,
    // Remember every share that already existed so a newly started share can
    // be distinguished from recovery of this interrupted UID.
    activeScreenshareUidsAtDetection: Object.entries(screenShareData)
      .filter(([, share]) => share?.isActive)
      .map(([uid]) => Number(uid)),
    detectedAt,
    joinedLogged: false,
  };
};

export type ScreenshareRecoveryDecision =
  | 'waiting_for_join'
  | 'waiting_for_video'
  | 'restore'
  | 'cancel_stopped'
  | 'cancel_replaced'
  | 'cancel_user_override';

interface GetRecoveryDecisionArgs {
  candidate: ScreenshareRecoveryCandidate;
  activeUids: UidType[];
  pinnedUid?: UidType;
  isVideoPublished: boolean;
  screenShareData: ScreenShareObjectInterface;
}

export const getScreenshareRecoveryDecision = ({
  candidate,
  activeUids,
  pinnedUid,
  isVideoPublished,
  screenShareData,
}: GetRecoveryDecisionArgs): ScreenshareRecoveryDecision => {
  const recoveredShare = screenShareData?.[candidate.uid];
  // RTM or local cleanup marked the share inactive, so RTC rejoin events must
  // not resurrect a screen share that was intentionally stopped.
  if (!recoveredShare?.isActive) {
    return 'cancel_stopped';
  }

  // A screen UID that became active after interruption represents a newer
  // share and takes precedence over restoring the old pinned tile.
  const newerActiveShareExists = Object.entries(screenShareData || {}).some(
    ([uid, share]) =>
      share?.isActive &&
      !candidate.activeScreenshareUidsAtDetection.includes(Number(uid)),
  );
  if (newerActiveShareExists) {
    return 'cancel_replaced';
  }
  // The same UID can be reused for a later share. Its start timestamp prevents
  // that new session from being mistaken for recovery of the old one.
  if (recoveredShare.ts !== candidate.screenshareStartedAt) {
    return 'cancel_replaced';
  }

  // Respect a pin selected by the user while recovery was pending.
  if (pinnedUid && pinnedUid !== candidate.uid) {
    return 'cancel_user_override';
  }
  // Joining and publishing are separate RTC events. Wait for both so the
  // layout never restores a tile before its video is available.
  if (!activeUids.includes(candidate.uid)) {
    return 'waiting_for_join';
  }
  if (!isVideoPublished) {
    return 'waiting_for_video';
  }
  return 'restore';
};
