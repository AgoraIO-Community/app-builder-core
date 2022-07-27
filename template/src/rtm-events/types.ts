export enum eventMessageType {
  CONTROL_GROUP = 1,
  CONTROL_PRIVATE,
  NORMAL_GROUP,
  NORMAL_PRIVATE,
  CUSTOM_EVENT,
}

export interface IQueueEvent {
  data: any;
  uid: number | string;
  ts: number;
}
