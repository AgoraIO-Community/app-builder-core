import {ClientRoleType} from '../../../agora-rn-uikit';
import {I18nBaseType, I18nConditionalType} from '../i18nTypes';
import {VBMode} from '../../components/virtual-background/useVB';

export interface PrecallJoinBtnTextInterface {
  ready: boolean;
  role?: ClientRoleType;
  waitingRoom?: boolean;
}
export interface PrecallWaitingRoomJoinBtnTextInterface {
  ready: boolean;
  isAutoRequest: boolean;
  isAutoApproval: boolean;
}

export const permissionPopupHeading = `permissionPopupHeading`;
export const permissionPopupSubHeading = `permissionPopupSubHeading`;
export const permissionPopupDismissBtnText = `permissionPopupDismissBtnText`;
export const permissionPopupErrorToastHeading = `permissionPopupErrorToastHeading`;
export const permissionPopupErrorToastSubHeading = `permissionPopupErrorToastSubHeading`;

export const settingsPanelHeading = `settingsPanelHeading`;
export const settingsPanelMicrophoneLabel = 'settingsPanelMicrophoneLabel';
export const settingsPanelNoMicrophoneDetectedText =
  'settingsPanelNoMicrophoneDetectedText';
export const settingsPanelNoMicrophoneSelectedText =
  'settingsPanelNoMicrophoneSelectedText';
export const settingsPanelCameraLabel = 'settingsPanelCameraLabel';
export const settingsPanelNoCameraDetectedText =
  'settingsPanelNoCameraDetectedText';
export const settingsPanelNoCameraSelectedText =
  'settingsPanelNoCameraSelectedText';
export const settingsPanelSpeakerLabel = 'settingsPanelSpeakerLabel';
export const settingsPanelNoSpeakerDetectedText =
  'settingsPanelNoSpeakerDetectedText';
export const settingsPanelNoSpeakerSelectedText =
  'settingsPanelNoSpeakerSelectedText';
export const settingsPanelSystemDefaultSpeakerText =
  'settingsPanelSystemDefaultSpeakerText';
export const settingsPanelLiveStreamingAttendeeInfo =
  'settingsPanelLiveStreamingAttendeeInfo';
export const settingsPanelUpdatingText = 'settingsPanelUpdatingText';

export const settingsPanelLanguageLabel = 'settingsPanelLanguageLabel';

export const precallYouAreJoiningAsHeading = 'precallYouAreJoiningAsHeading';
export const precallNameInputPlaceholderText =
  'precallNameInputPlaceholderText';
export const precallJoinBtnText = 'precallJoinBtnText';
export const precallWaitingRoomJoinBtnText = 'precallWaitingRoomJoinBtnText';
export const precallInputGettingName = 'precallInputGettingName';

export const vbPanelHeading = 'vbPanelHeading';
export const vbPanelInfo = 'vbPanelInfo';

export const vbOptionText = 'vbOptionText';

export interface I18nPrecallScreenLabelsInterface {
  [permissionPopupHeading]?: I18nBaseType;
  [permissionPopupSubHeading]?: I18nBaseType;
  [permissionPopupDismissBtnText]?: I18nBaseType;
  [permissionPopupErrorToastHeading]?: I18nBaseType;
  [permissionPopupErrorToastSubHeading]?: I18nBaseType;

  [settingsPanelHeading]?: I18nBaseType;

  [settingsPanelCameraLabel]?: I18nBaseType;
  [settingsPanelNoCameraDetectedText]?: I18nBaseType;
  [settingsPanelNoCameraSelectedText]?: I18nBaseType;

  [settingsPanelMicrophoneLabel]?: I18nBaseType;
  [settingsPanelNoMicrophoneDetectedText]?: I18nBaseType;
  [settingsPanelNoMicrophoneSelectedText]?: I18nBaseType;

  [settingsPanelSpeakerLabel]?: I18nBaseType;
  [settingsPanelNoSpeakerDetectedText]?: I18nBaseType;
  [settingsPanelNoSpeakerSelectedText]?: I18nBaseType;
  [settingsPanelSystemDefaultSpeakerText]?: I18nBaseType;

  [settingsPanelLiveStreamingAttendeeInfo]?: I18nBaseType;
  [settingsPanelUpdatingText]?: I18nBaseType;
  [settingsPanelLanguageLabel]?: I18nBaseType;

  [precallYouAreJoiningAsHeading]?: I18nBaseType;
  [precallNameInputPlaceholderText]?: I18nBaseType;
  [precallJoinBtnText]?: I18nBaseType<PrecallJoinBtnTextInterface>;
  [precallWaitingRoomJoinBtnText]?: I18nBaseType<PrecallWaitingRoomJoinBtnTextInterface>;

  [vbPanelHeading]?: I18nBaseType;
  [vbPanelInfo]?: I18nConditionalType;

  [vbOptionText]?: I18nBaseType<VBMode>;

  [precallInputGettingName]?: I18nBaseType;
}

export const PrecallScreenLabels: I18nPrecallScreenLabelsInterface = {
  //permission popup
  [permissionPopupHeading]: ({audioRoom}) =>
    audioRoom
      ? 'Allow access to microphone'
      : 'Allow access to camera and microphone',
  [permissionPopupSubHeading]: ({audioRoom}) =>
    audioRoom
      ? 'Select “Allow” for others to hear you'
      : 'Select “Allow” for others to see and hear you',
  [permissionPopupDismissBtnText]: 'Dismiss',
  [permissionPopupErrorToastHeading]: ({audioRoom}) =>
    `Can't find your ${audioRoom ? ' Microphone' : ' Camera'}`,
  [permissionPopupErrorToastSubHeading]: audioRoom =>
    `Check your system settings to make sure that a ${
      audioRoom ? 'microphone' : 'camera'
    } is available. If not, plug one in and restart your browser`,

  [settingsPanelHeading]: 'Settings',

  [settingsPanelCameraLabel]: 'Camera',
  [settingsPanelNoCameraDetectedText]: 'No Camera Detected',
  [settingsPanelNoCameraSelectedText]: 'No Camera Selected',

  [settingsPanelMicrophoneLabel]: 'Microphone',
  [settingsPanelNoMicrophoneDetectedText]: 'No Microphone Detected',
  [settingsPanelNoMicrophoneSelectedText]: 'No Microphone Selected',

  [settingsPanelSpeakerLabel]: 'Speaker',
  [settingsPanelNoSpeakerDetectedText]: 'No Speaker Detected',
  [settingsPanelNoSpeakerSelectedText]: 'No Speaker Selected',
  [settingsPanelSystemDefaultSpeakerText]: 'System Default Speaker Device',

  [settingsPanelLiveStreamingAttendeeInfo]:
    'Attendees need to raise their hand to access the devices.',
  [settingsPanelUpdatingText]: 'Updating',

  [settingsPanelLanguageLabel]: 'Language',

  [precallYouAreJoiningAsHeading]: 'You are joining',
  [precallNameInputPlaceholderText]: 'Enter Your Name',
  [precallInputGettingName]: 'Getting name...',
  [precallWaitingRoomJoinBtnText]: ({ready, isAutoRequest, isAutoApproval}) => {
    return  ready
      ? isAutoRequest? 'Meeting Started,  Join Now !': 'Ask To Join'
      : isAutoApproval?'Joining...': `Waiting for approval...`
  },

  [precallJoinBtnText]: ({waitingRoom, ready, role}) => {
    if (waitingRoom) {
      return ready ? 'Ask To Join' : `Waiting for approval...`;
    } else {
      return ready
        ? !role
          ? 'JOIN ROOM'
          : `JOIN ROOM AS ${
              role === ClientRoleType.ClientRoleBroadcaster
                ? 'HOST'
                : 'AUDIENCE'
            }`
        : `Loading...`;
    }
  },

  [vbPanelHeading]: 'Virtual Background',
  [vbPanelInfo]: (isCamOn: boolean) =>
    isCamOn
      ? 'Camera is currently off. Selected background will be applied as soon as your camera turns on.'
      : 'Your camera is switched off. Save a background to apply once it’s turned on.',

  [vbOptionText]: mode => {
    switch (mode) {
      case 'none':
        return 'None';
      case 'custom':
        return 'Custom';
      case 'blur':
        return 'Blur';
      default:
        return '';
    }
  },
};
