// DECLARE ENUMS & CONTANTS
import {ClientRole} from '../../../agora-rn-uikit';

export enum RaiseHandValue {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
}

export const RaiseHandAttributeKey = 'raised';

export interface raiseHandListInterface {
  [key: string]: raiseHandItemInterface;
}

export interface raiseHandItemInterface {
  role: ClientRole;
  raised: RaiseHandValue;
  ts: number;
  isProcessed: boolean;
}

import {UidType} from '../../../agora-rn-uikit';

export enum requestStatus {
  AwaitingAction = 'AWAITING_ACTION',
  Approved = 'APPROVED',
  Cancelled = 'CANCELLED',
}

export enum attrRequestStatus {
  RaiseHand_AwaitingAction = 'AWAITING_ACTION',
  RaiseHand_Approved = 'APPROVED',
}

export enum LiveStreamControlMessageEnum {
  raiseHandRequest = 'RAISE_HAND_REQUEST',
  raiseHandRequestAccepted = 'RAISE_HAND_ACCEPTED',
  raiseHandRequestRejected = 'RAISE_HAND_REJECTED',
  raiseHandRequestReceived = 'RAISE_HAND_RECEIVED',
  raiseHandRequestRecall = 'RAISE_HAND_REQUEST_RECALL',
  raiseHandRequestRecallLocal = 'RAISE_HAND_REQUEST_RECALL_LOCAL',
  raiseHandApprovedRequestRecall = 'RAISE_HAND_APPROVED_REQUEST_RECALL',
  notifyAllRequestApproved = 'NOTIFY_REQUEST_APPROVED',
  notifyAllRequestRejected = 'NOTIFY_REQUEST_REJECTED',
  notifyHostsInChannel = 'NOTIFY_HOSTS_IN_CHANNEL',
  promoteAsCoHost = 'PROMOTE_AS_CO_HOST',
  coHostJoined = 'CO_HOST_JOINED',
  coHostRemoved = 'CO_HOST_REMOVED',
}

export const LSNotificationObject = {
  [LiveStreamControlMessageEnum.raiseHandRequest]: {
    text1: 'You’ve raised your hand.',
    text2: 'Waiting for host to approve the request',
  },
  [LiveStreamControlMessageEnum.raiseHandRequestReceived]: {
    text1: 'has raised their hand to be a Presenter',
    text2:
      'Once approved they will be able to speak, share their video and present during this call.',
  },
  [LiveStreamControlMessageEnum.raiseHandRequestAccepted]: {
    text1: 'Host has approved your request.',
    text2: 'You are now a Presenter',
  },
  [LiveStreamControlMessageEnum.raiseHandRequestRejected]: {
    text1: 'Your request was rejected by the host',
    text2: null,
  },
  [LiveStreamControlMessageEnum.raiseHandRequestRecall]: {
    text1: 'has lowered their hand',
    text2: null,
  },
  [LiveStreamControlMessageEnum.raiseHandRequestRecallLocal]: {
    text1: 'You’ve lowered your hand.',
    text2: null,
  },
  [LiveStreamControlMessageEnum.raiseHandApprovedRequestRecall]: {
    text1: 'Host has revoked streaming permissions.',
    text2: null,
  },
  [LiveStreamControlMessageEnum.promoteAsCoHost]: {
    text1: 'Host promoted you as a Presenter',
    text2: null,
  },
};

export interface liveStreamPropsInterface {
  children: React.ReactNode;
  value: {setRtcProps: any; rtcProps: any; callActive: boolean};
}

export interface liveStreamContext {
  setLastCheckedRequestTimestamp: (timestamp: number) => void;
  isPendingRequestToReview: boolean;
  raiseHandList: Record<string, raiseHandItemInterface>;
  hostApprovesRequestOfUID: (uid: number) => void;
  hostRejectsRequestOfUID: (uid: number) => void;
  audienceSendsRequest: () => void;
  audienceRecallsRequest: () => void;
  promoteAudienceAsCoHost: (uid: UidType) => void;
  coHostUids: UidType[];
}

export interface requestInterface {
  ts: number;
  status: requestStatus;
  uid: UidType;
}

export interface attrRequestInterface {
  status: attrRequestStatus;
  uid: UidType;
}
