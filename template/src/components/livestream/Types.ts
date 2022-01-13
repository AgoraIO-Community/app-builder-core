// DECLARE ENUMS & CONTANTS
export enum LiveStreamControlMessageEnum {
  raiseHandRequest = 'RAISE_HAND_REQUEST',
  raiseHandRequestAccepted = 'RAISE_HAND_ACCEPTED',
  raiseHandRequestRejected = 'RAISE_HAND_REJECTED',
  raiseHandRequestReceived = 'RAISE_HAND_RECEIVED',
  raiseHandApprovedRequestRecall = 'RAISE_HAND_APPROVED_REQUEST_RECALL',
}

export const LSNotificationObject = {
  [LiveStreamControlMessageEnum.raiseHandRequest]:
    'Requested raised for live streaming',
  [LiveStreamControlMessageEnum.raiseHandRequestReceived]:
    'New Live-Streaming request received',
  [LiveStreamControlMessageEnum.raiseHandRequestAccepted]:
    'Live-Streaming request was approved',
  [LiveStreamControlMessageEnum.raiseHandRequestRejected]:
    'Live-Streaming request was rejected',
  [LiveStreamControlMessageEnum.raiseHandApprovedRequestRecall]:
    'You can no longer live stream',
};

export interface liveStreamContext {
  currLiveStreamRequest: Array<number>;
  approveRequestOfUID: (uid: number) => void;
  rejectRequestOfUID: (uid: number) => void;
  raiseHandRequestActive: boolean;
  setRaiseHandRequestActive: (state: boolean) => void;
}
