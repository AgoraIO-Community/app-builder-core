/** ***** EVENTS ACTIONS BEGINS***** */
// 1. SCREENSHARE
const SCREENSHARE_STARTED = 'SCREENSHARE_STARTED';
const SCREENSHARE_STOPPED = 'SCREENSHARE_STOPPED';

const EventActions = {
  SCREENSHARE_STARTED,
  SCREENSHARE_STOPPED,
};

/** ***** EVENTS  ACTIONS ENDS ***** */

/** ***** EVENT NAMES BEGINS ***** */
// 1. RECORDING
const RECORDING_STATE_ATTRIBUTE = 'recording_state';
const RECORDING_STARTED_BY_ATTRIBUTE = 'recording_started_by';
// 2. SCREENSHARE
const SCREENSHARE_ATTRIBUTE = 'screenshare';
// 2. LIVE STREAMING
const RAISED_ATTRIBUTE = 'raised';
const ROLE_ATTRIBUTE = 'role';
// 3. CHAT MESSAGES
const PUBLIC_CHAT_MESSAGE = 'PUBLIC_CHAT_MESSAGE';
const PRIVATE_CHAT_MESSAGE = 'PRIVATE_CHAT_MESSAGE';
// 4. NAME ATTRIBUTE
const NAME_ATTRIBUTE = 'name';
// 5. VIDEO ROOM ROLE
const VIDEO_MEETING_HOST = 'VIDEO_MEETING_HOST';
const VIDEO_MEETING_ATTENDEE = 'VIDEO_MEETING_ATTENDEE';
// 6. STT
const STT_ACTIVE = 'STT_IS_ACTIVE';
const STT_LANGUAGE = 'STT_LANGUAGE_CHANGED';
// 7. WAITING ROOM
const WAITING_ROOM_REQUEST = 'WAITING_ROOM_REQUEST';
const WAITING_ROOM_RESPONSE = 'WAITING_ROOM_RESPONSE';
const WAITING_ROOM_STATUS_UPDATE = 'WAITING_ROOM_STATUS_UPDATE';
// 8 .WHITEBOARD
const WHITEBOARD_ACTIVE = 'WHITEBOARD_ACTIVE';
const BOARD_COLOR_CHANGED = 'BOARD_COLOR_CHANGED';
const WHITEBOARD_LAST_IMAGE_UPLOAD_POSITION = 'WHITEBOARD_L_I_U_P';
const ENABLE_CHAT_LOGIN = 'ENABLE_CHAT_LOGIN';

const EventNames = {
  RECORDING_STATE_ATTRIBUTE,
  RECORDING_STARTED_BY_ATTRIBUTE,
  RAISED_ATTRIBUTE,
  ROLE_ATTRIBUTE,
  PUBLIC_CHAT_MESSAGE,
  PRIVATE_CHAT_MESSAGE,
  SCREENSHARE_ATTRIBUTE,
  NAME_ATTRIBUTE,
  VIDEO_MEETING_HOST,
  VIDEO_MEETING_ATTENDEE,
  STT_ACTIVE,
  STT_LANGUAGE,
  WAITING_ROOM_REQUEST,
  WAITING_ROOM_RESPONSE,
  WAITING_ROOM_STATUS_UPDATE,
  WHITEBOARD_ACTIVE,
  BOARD_COLOR_CHANGED,
  WHITEBOARD_LAST_IMAGE_UPLOAD_POSITION,
  ENABLE_CHAT_LOGIN,
};
/** ***** EVENT NAMES ENDS ***** */

export {EventActions, EventNames};
