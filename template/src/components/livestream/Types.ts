// DECLARE ENUMS & CONTANTS
import {TextDataInterface} from '../../language/default-labels';
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
interface LSNotificationObjectInterface {
  [key: string]: {
    //text1: string;
    //text2: string | null;

    text1TranslationKey: keyof TextDataInterface;
    text2TranslationKey?: keyof TextDataInterface;
  };
}
export const LSNotificationObject: LSNotificationObjectInterface = {
  [LiveStreamControlMessageEnum.raiseHandRequest]: {
    text1TranslationKey: 'raiseHandRequestToastHeading',
    text2TranslationKey: 'raiseHandRequestToastSubHeading',
  },
  [LiveStreamControlMessageEnum.raiseHandRequestReceived]: {
    text1TranslationKey: 'raiseHandRequestReceivedToastHeading',
    text2TranslationKey: 'raiseHandRequestReceivedToastSubHeading',
  },
  [LiveStreamControlMessageEnum.raiseHandRequestAccepted]: {
    text1TranslationKey: 'raiseHandRequestAcceptedToastHeading',
    text2TranslationKey: 'raiseHandRequestAcceptedToastSubHeading',
  },
  [LiveStreamControlMessageEnum.raiseHandRequestRejected]: {
    text1TranslationKey: 'raiseHandRequestRejectedToastHeading',
  },
  [LiveStreamControlMessageEnum.raiseHandRequestRecall]: {
    text1TranslationKey: 'raiseHandRequestRecallToastHeading',
  },
  [LiveStreamControlMessageEnum.raiseHandRequestRecallLocal]: {
    text1TranslationKey: 'raiseHandRequestRecallLocalToastHeading',
  },
  [LiveStreamControlMessageEnum.raiseHandApprovedRequestRecall]: {
    text1TranslationKey: 'raiseHandApprovedRequestRecallToastHeading',
  },
  [LiveStreamControlMessageEnum.promoteAsCoHost]: {
    text1TranslationKey: 'promoteAsCoHostToastHeading',
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
