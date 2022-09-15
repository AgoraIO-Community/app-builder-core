import {UidType} from '../../agora-rn-uikit';

export type ReceiverUid = UidType | UidType[];

export type EventPayload = string | Record<string, never>;

export enum EventSource {
  core = 'core',
  fpe = 'fpe',
}
export enum EventPersistLevel {
  'LEVEL1' = 1,
  'LEVEL2',
  'LEVEL3',
}
interface CbPayload {
  payload: string;
  persistLevel: EventPersistLevel;
  sender: UidType;
  ts: number;
}
export type EventCallbackPayload = (args: CbPayload) => void;
