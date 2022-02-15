// DECLARE ENUMS & CONTANTS

export enum requestStatus {
  AwaitingAction = 'AWAITING_ACTION',
  Approved = 'APPROVED',
  Cancelled = 'CANCELLED',
}

export enum LiveStreamControlMessageEnum {
  raiseHandRequest = 'RAISE_HAND_REQUEST',
  raiseHandRequestAccepted = 'RAISE_HAND_ACCEPTED',
  raiseHandRequestRejected = 'RAISE_HAND_REJECTED',
  raiseHandRequestReceived = 'RAISE_HAND_RECEIVED',
  raiseHandRequestRecall = 'RAISE_HAND_REQUEST_RECALL',
  raiseHandApprovedRequestRecall = 'RAISE_HAND_APPROVED_REQUEST_RECALL',
  notifyAllRequestApproved = 'NOTIFY_REQUEST_APPROVED',
  notifyAllRequestRejected = 'NOTIFY_REQUEST_REJECTED',
}

export const LSNotificationObject = {
  [LiveStreamControlMessageEnum.raiseHandRequest]:
    'Requested raised for Live-Streaming',
  [LiveStreamControlMessageEnum.raiseHandRequestReceived]:
    'New Live-Streaming request received',
  [LiveStreamControlMessageEnum.raiseHandRequestAccepted]:
    'Live-Streaming request was approved',
  [LiveStreamControlMessageEnum.raiseHandRequestRejected]:
    'Live-Streaming request was rejected',
  [LiveStreamControlMessageEnum.raiseHandRequestRecall]:
    'User has cancelled their request to Live-Stream',
  [LiveStreamControlMessageEnum.raiseHandApprovedRequestRecall]:
    'You can no longer Live-Stream',
};

export interface liveStreamContext {
  activeLiveStreamRequestCount: number;
  currLiveStreamRequest: Record<string, {}>;
  hostApprovesRequestOfUID: (uid: number) => void;
  hostRejectsRequestOfUID: (uid: number) => void;
  audienceSendsRequest: () => void;
  audienceRecallsRequest: () => void;
  raiseHandRequestActive: boolean;
  setRaiseHandRequestActive: (state: boolean) => void;
}
