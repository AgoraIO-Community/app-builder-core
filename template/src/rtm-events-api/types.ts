import {UidType} from '../../agora-rn-uikit';

export type ReceiverUid = UidType | UidType[];

export type EventPayload = string | Record<string, never>;

export enum EventSource {
  core = 'core',
  fpe = 'fpe',
}
export enum PersistanceLevel {
  'None' = 1,
  'Sender',
  'Session',
  'Channel',
}
interface EventCallbackPayload {
  payload: string;
  persistLevel: PersistanceLevel;
  sender: UidType;
  ts: number;
}
export interface RTMAttributePayload {
  evt: string;
  value: string;
}

export type EventCallback = (args: EventCallbackPayload) => void;
