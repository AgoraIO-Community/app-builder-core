/** ***** EVENTS ACTIONS BEGINS***** */

import {BreakoutRoomEventNames} from '../components/breakout-room/events/constants';

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
const RECORDING_DELETED = 'RECORDING_DELETED';
const SPOTLIGHT_USER_CHANGED = 'SPOTLIGHT_USER_CHANGED';
// 9. General raise hand
// Later on we will only have one raise hand i.e which will tied with livestream ad breakout
const BREAKOUT_RAISE_HAND_ATTRIBUTE = 'breakout_raise_hand';
// 10. Cross-room raise hand notifications (messages, not attributes)
const CROSS_ROOM_RAISE_HAND_NOTIFICATION = 'cross_room_raise_hand_notification';
// 11. Breakout room presenter attribute
const BREAKOUT_PRESENTER_ATTRIBUTE = 'breakout_presenter';

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
  RECORDING_DELETED,
  SPOTLIGHT_USER_CHANGED,
  BREAKOUT_RAISE_HAND_ATTRIBUTE,
  CROSS_ROOM_RAISE_HAND_NOTIFICATION,
  BREAKOUT_PRESENTER_ATTRIBUTE,
};
/** ***** EVENT NAMES ENDS ***** */

/** SCOPE OF EVENTS */
const RTM_GLOBAL_SCOPE_EVENTS = [
  EventNames.NAME_ATTRIBUTE,
  EventNames.CROSS_ROOM_RAISE_HAND_NOTIFICATION,
  BreakoutRoomEventNames.BREAKOUT_ROOM_MAKE_PRESENTER,
];
const RTM_SESSION_SCOPE_EVENTS = [];
// const RTM_SESSION_SCOPE_EVENTS = [
//   EventNames.RECORDING_STATE_ATTRIBUTE,
//   EventNames.RECORDING_STARTED_BY_ATTRIBUTE,
// ];

enum RTM_EVENT_SCOPE {
  GLOBAL = 'GLOBAL', // These event-attributes dont change ex: name, screenuid even when room chanes (main -> breakout)
  SESSION = 'SESSION', // These event-attributes are stored as per channel but there needs to be persistance..when user returns to main room..he should have the state of that channel ex: recording, whiteboard active
  LOCAL = 'LOCAL', // These event-attributes are specific to channel and can be reseted or removed, ex: raise_hand, screenshare
}

export {
  EventActions,
  EventNames,
  RTM_GLOBAL_SCOPE_EVENTS,
  RTM_EVENT_SCOPE,
  RTM_SESSION_SCOPE_EVENTS,
};
