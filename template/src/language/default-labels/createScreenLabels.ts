import {I18nBaseType, I18nConditionalType} from '../i18nTypes';

export interface I18nCreateScreenLabelsInterface {
  meetingNameInputPlaceholder?: I18nBaseType; //
  //commented for v1 release
  // createMeetingButton?: I18nBaseType; //
  // haveMeetingID?: I18nBaseType;
  // pstnToggle?: I18nConditionalType; //
  // hostControlsToggle?: I18nConditionalType; //
}

export const CreateScreenLabels: I18nCreateScreenLabelsInterface = {
  meetingNameInputPlaceholder: 'Name your Room',
  //commented for v1 release
  // createMeetingButton: 'Create Room',
  // haveMeetingID: 'Have a Room ID?',
  // pstnToggle: 'Use PSTN (Join by dialing a number)',
  // hostControlsToggle: (toggle) =>
  //   toggle
  //     ? 'Restrict Host Controls (Separate host link)'
  //     : 'Restrict Host Controls (Everyone is a Host)',
};
