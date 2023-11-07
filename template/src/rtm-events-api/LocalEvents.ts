import {EventEmitter} from 'events';
export enum LocalEventsEnum {
  ACTIVE_SPEAKER = 'ACTIVE_SPEAKER',
  WHITEBAORD_FILE_UPLOAD = 'WHITEBAORD_FILE_UPLOAD',
}
const LocalEventEmitter = new EventEmitter();
export default LocalEventEmitter;
