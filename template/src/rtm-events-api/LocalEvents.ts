import {EventEmitter} from 'events';
export enum LocalEventsEnum {
  ACTIVE_SPEAKER = 'ACTIVE_SPEAKER',
  WHITEBOARD_ON = 'WHITEBOARD_ON',
  WHITEBOARD_OFF = 'WHITEBOARD_OFF',
  MIC_CHANGED = 'MIC_CHANGED',
}
const LocalEventEmitter = new EventEmitter();
export default LocalEventEmitter;
