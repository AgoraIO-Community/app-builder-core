import {EventEmitter} from 'events';
export enum LocalEventsEnum {
  ACTIVE_SPEAKER = 'ACTIVE_SPEAKER',
  WHITEBAORD_FILE_UPLOAD = 'WHITEBAORD_FILE_UPLOAD',
  WHITEBOARD_ON = 'WHITEBOARD_ON',
  WHITEBOARD_OFF = 'WHITEBOARD_OFF',
}
const LocalEventEmitter = new EventEmitter();
export default LocalEventEmitter;
