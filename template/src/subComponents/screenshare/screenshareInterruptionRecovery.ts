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
  if (!recoveredShare?.isActive) {
    return 'cancel_stopped';
  }

  const newerActiveShareExists = Object.entries(screenShareData || {}).some(
    ([uid, share]) =>
      share?.isActive &&
      !candidate.activeScreenshareUidsAtDetection.includes(Number(uid)),
  );
  if (newerActiveShareExists) {
    return 'cancel_replaced';
  }
  if (recoveredShare.ts !== candidate.screenshareStartedAt) {
    return 'cancel_replaced';
  }

  if (pinnedUid && pinnedUid !== candidate.uid) {
    return 'cancel_user_override';
  }
  if (!activeUids.includes(candidate.uid)) {
    return 'waiting_for_join';
  }
  if (!isVideoPublished) {
    return 'waiting_for_video';
  }
  return 'restore';
};
