// DECLARE ENUMS & CONTANTS
import {RtcPropsInterface} from '../../../agora-rn-uikit';
import {Dispatch, SetStateAction} from 'react';

export type RaiseHandAttributeKey = 'raised';

export enum RaiseHandValue {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
}

export interface raiseHandListInterface {
  [key: string]: raiseHandItemInterface;
}

export interface raiseHandItemInterface {
  raised: RaiseHandValue;
  ts: number;
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
}

export const LSNotificationObject = {
  [LiveStreamControlMessageEnum.raiseHandRequest]:
    'You have raised your hand. Request sent to host for approval',
  [LiveStreamControlMessageEnum.raiseHandRequestReceived]:
    'has raised their hand',
  [LiveStreamControlMessageEnum.raiseHandRequestAccepted]:
    'Your request was approved, unmute to start talking',
  [LiveStreamControlMessageEnum.raiseHandRequestRejected]:
    'Your request was rejected by the host',
  [LiveStreamControlMessageEnum.raiseHandRequestRecall]:
    'has lowered their hand',
  [LiveStreamControlMessageEnum.raiseHandRequestRecallLocal]:
    'You have lowered your hand',
  [LiveStreamControlMessageEnum.raiseHandApprovedRequestRecall]:
    'The host has revoked streaming permissions',
};

export interface liveStreamPropsInterface {
  isHost: boolean;
  setRtcProps: Dispatch<SetStateAction<RtcPropsInterface>>;
  children: JSX.Element;
}

export interface liveStreamContext {
  setLastCheckedRequestTimestamp: (timestamp: number) => void;
  isPendingRequestToReview: boolean;
  raiseHandList: Partial<Record<string, raiseHandItemInterface>>;
  hostApprovesRequestOfUID: (uid: number) => void;
  hostRejectsRequestOfUID: (uid: number) => void;
  audienceSendsRequest: () => void;
  audienceRecallsRequest: () => void;
}
