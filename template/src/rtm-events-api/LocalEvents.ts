import {EventEmitter} from 'events';
export enum LocalEventsEnum {
  ACTIVE_SPEAKER = 'ACTIVE_SPEAKER',
}
const LocalEventEmitter = new EventEmitter();
export default LocalEventEmitter;
