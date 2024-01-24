import {I18nBaseType} from '../i18nTypes';

export interface I18nJoinScreenLabelsInterface {
  roomId?: I18nBaseType;
  streamId?: I18nBaseType;
  enterRoomId?: I18nBaseType;
  enterStreamId?: I18nBaseType;
  joinRoom?: I18nBaseType;
  joinStream?: I18nBaseType;
  createStream?: I18nBaseType;
  invalidRoomIdToastHeading?: I18nBaseType;
  invalidRoomIdToastSubheading?: I18nBaseType;
}

export const JoinScreenLabels: I18nJoinScreenLabelsInterface = {
  roomId: 'Room ID',
  streamId: 'Stream ID',
  enterRoomId: 'Enter Room ID',
  enterStreamId: 'Enter Stream ID',
  joinRoom: 'Join Room',
  joinStream: 'Join Stream',
  createStream: 'Create a Stream',
  invalidRoomIdToastHeading: 'Room ID Invalid.',
  invalidRoomIdToastSubheading: 'Please enter a valid Room ID',
};
