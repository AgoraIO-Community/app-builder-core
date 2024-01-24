import {I18nBaseType, I18nDynamicType} from '../i18nTypes';

export interface I18nCreateScreenLabelsInterface {
  headingVideoMeeting?: I18nBaseType; //
  headingLiveStream?: I18nBaseType; //
  headingVoiceChat?: I18nBaseType; //
  headingAudioLivecast?: I18nBaseType; //
  loadingWithDots?: I18nBaseType; //
  inputLabelVideoMeeting?: I18nBaseType; //
  inputLabelLiveStream?: I18nBaseType; //
  inputLabelVoiceChat?: I18nBaseType; //
  inputLabelAudioLivecast?: I18nBaseType; //
  meetingNameInputPlaceholder?: I18nBaseType; //
  everyoneCoHost?: I18nBaseType; //
  everyoneCoHostTooltip?: I18nBaseType; //
  allowPhoneNumberJoining?: I18nBaseType; //
  allowPhoneNumberJoiningToolTip?: I18nBaseType; //
  createRoom?: I18nBaseType; //
  createLiveStream?: I18nBaseType; //
  createVoiceChat?: I18nBaseType; //
  createAudioLivecast?: I18nBaseType; //
  joinWithRoomID?: I18nBaseType; //
  createRoomSuccessToastHeading?: I18nDynamicType; //
  createRoomSuccessToastSubHeading?: I18nBaseType; //
}

export const CreateScreenLabels: I18nCreateScreenLabelsInterface = {
  headingVideoMeeting: 'Create a Room',
  headingLiveStream: 'Create a Livestream',
  headingVoiceChat: 'Create a Voice Chat',
  headingAudioLivecast: 'Create a Audio Livecast',
  loadingWithDots: 'Loading...',
  inputLabelVideoMeeting: 'Room Name',
  inputLabelLiveStream: 'Stream Name',
  inputLabelVoiceChat: 'Voice Chat Name',
  inputLabelAudioLivecast: 'Audio Livecast Name',
  meetingNameInputPlaceholder: 'The Annual Galactic Meet',
  everyoneCoHost: 'Make everyone a Co-Host',
  everyoneCoHostTooltip:
    'Turning on will give everyone the control of this room',
  allowPhoneNumberJoining: 'Allow joining via a phone number',
  allowPhoneNumberJoiningToolTip:
    'Attendees can dial a number and join via PSTN',
  createRoom: 'CREATE A ROOM',
  createLiveStream: 'CREATE A STREAM',
  createVoiceChat: 'CREATE A VOICE CHAT',
  createAudioLivecast: 'CREATE A AUDIO LIVECAST',
  joinWithRoomID: 'Join with a room ID',
  createRoomSuccessToastHeading: (meetingName: string) =>
    `${meetingName}  has been created`,
  createRoomSuccessToastSubHeading: 'Your New room is now live',
};
