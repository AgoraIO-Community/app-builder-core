import {ClientRole} from '../../../agora-rn-uikit';
import {I18nBaseType, I18nConditionalType} from '../i18nTypes';

export interface JoinRoomButtonTextInterface {
  ready: boolean;
  role?: ClientRole;
}
export interface I18nPrecallScreenLabelsInterface {
  allowMicPermision?: I18nBaseType;
  allowMicAndCameraPermission?: I18nBaseType;
  select?: I18nBaseType;
  allow?: I18nBaseType;
  otherToHearYou?: I18nBaseType;
  otherToSeeAndHearYou?: I18nBaseType;
  dismiss?: I18nBaseType;
  cantFindDeviceToastHeading?: I18nConditionalType;
  cantFindDeviceToastSubHeading?: I18nConditionalType;
  settings?: I18nBaseType;
  youAreJoiningAs?: I18nBaseType;
  microphone?: I18nBaseType;
  camera?: I18nBaseType;
  speaker?: I18nBaseType;
  noMicrophoneDetected?: I18nBaseType;
  noCameraDetected?: I18nBaseType;
  noSpeakerDetected?: I18nBaseType;
  noMicrophoneSelected?: I18nBaseType;
  noCameraSelected?: I18nBaseType;
  noSpeakerSelected?: I18nBaseType;
  livestreamAttendeeSettingInfo?: I18nBaseType;
  updating?: I18nBaseType;
  speakerDefaultDevice?: I18nBaseType;
  virtualBackground?: I18nBaseType;
  virtualBackgroundCameraInfo?: I18nConditionalType;
  none?: I18nBaseType;
  blur?: I18nBaseType;
  custom?: I18nBaseType;

  enterYourName?: I18nBaseType;
  yourName?: I18nBaseType;
  joiningAs?: I18nBaseType;
  gettingName?: I18nBaseType;
  nameInputPlaceholder?: I18nBaseType;

  joinRoomButton?: I18nBaseType<JoinRoomButtonTextInterface>; // need to check
  waitingRoomButton?: I18nBaseType<JoinRoomButtonTextInterface>; // need to check
}

export const PrecallScreenLabels: I18nPrecallScreenLabelsInterface = {
  allowMicPermision: 'Allow access to microphone',
  allowMicAndCameraPermission: 'Allow access to camera and microphone',
  select: 'Select',
  allow: ' “Allow” ',
  otherToHearYou: 'for others to hear you',
  otherToSeeAndHearYou: 'for others to see and hear you',
  dismiss: 'Dismiss',
  cantFindDeviceToastHeading: audioRoom =>
    `Can't find your ${audioRoom ? ' Microphone' : ' Camera'}`,
  cantFindDeviceToastSubHeading: audioRoom =>
    `Check your system settings to make sure that a ${
      audioRoom ? 'microphone' : 'camera'
    } is available. If not, plug one in and restart your browser`,

  settings: 'Settings',
  youAreJoiningAs: 'You are joining',

  microphone: 'Microphone',
  speaker: 'Speaker',
  camera: 'Camera',
  noCameraDetected: 'No Camera Detected',
  noMicrophoneDetected: 'No Microphone Detected',
  noSpeakerDetected: 'No Speaker Detected',
  noCameraSelected: 'No Camera Selected',
  noMicrophoneSelected: 'No Microphone Selected',
  noSpeakerSelected: 'No Speaker Selected',
  livestreamAttendeeSettingInfo:
    'Attendees need to raise their hand to access the devices.',

  speakerDefaultDevice: 'System Default Speaker Device',
  updating: 'Updating',

  virtualBackground: 'Virtual Background',
  virtualBackgroundCameraInfo: (isCamOn: boolean) =>
    isCamOn
      ? `Camera is currently off. Selected background will be applied as soon as your camera turns on.`
      : `Your camera is switched off. Save a background to apply once it’s turned on.`,

  none: 'None',
  blur: 'Blur',
  custom: 'Custom',

  enterYourName: 'Enter Your Name',
  yourName: 'Your Name',
  joiningAs: 'Joining as',
  gettingName: 'Getting name...',
  nameInputPlaceholder: 'Luke Skywalker',

  joinRoomButton: ({ready, role}) =>
    ready
      ? !role
        ? 'JOIN ROOM'
        : `JOIN ROOM AS ${
            role === ClientRole.Broadcaster ? 'HOST' : 'AUDIENCE'
          }`
      : `Loading...`,
  waitingRoomButton: ({ready}) =>
    ready ? 'Ask To Join' : `Waiting for approval...`,
};
