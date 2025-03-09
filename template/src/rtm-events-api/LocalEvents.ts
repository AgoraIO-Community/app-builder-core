import {EventEmitter} from 'events';
export enum LocalEventsEnum {
  ACTIVE_SPEAKER = 'ACTIVE_SPEAKER',
  WHITEBOARD_FILE_UPLOAD = 'WHITEBOARD_FILE_UPLOAD',
  WHITEBOARD_ACTIVE_LOCAL = 'WHITEBOARD_ACTIVE_LOCAL',
  BOARD_COLOR_CHANGED_LOCAL = 'BOARD_COLOR_CHANGED_LOCAL',
  WHITEBOARD_LAST_IMAGE_UPLOAD_POSITION_LOCAL = 'WHITEBOARD_LAST_IMAGE_UPLOAD_POSITION_LOCAL',
  WHITEBOARD_ON = 'WHITEBOARD_ON',
  WHITEBOARD_OFF = 'WHITEBOARD_OFF',
  MIC_CHANGED = 'MIC_CHANGED',
  CLEAR_WHITEBOARD = 'CLEAR_WHITEBOARD',
  USER_KICKED_OFF_BY_REMOTE_HOST = 'USER_KICKED_OFF_BY_REMOTE_HOST',
  AGENT_TRANSCRIPT_CHANGE = 'AGENT_TRANSCRIPT_CHANGE',
}
const LocalEventEmitter = new EventEmitter();
export default LocalEventEmitter;
