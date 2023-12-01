import {EventEmitter} from 'events';
export enum LocalEventsEnum {
  ACTIVE_SPEAKER = 'ACTIVE_SPEAKER',
  WHITEBAORD_FILE_UPLOAD = 'WHITEBAORD_FILE_UPLOAD',
  WHITEBOARD_ACTIVE_LOCAL = 'WHITEBOARD_ACTIVE_LOCAL',
  BOARD_COLOR_CHANGED_LOCAL = 'BOARD_COLOR_CHANGED_LOCAL',
}
const LocalEventEmitter = new EventEmitter();
export default LocalEventEmitter;
