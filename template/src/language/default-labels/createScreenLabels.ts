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
  meetingNameInputPlaceholder: 'Name your Meeting',
  //commented for v1 release
  // createMeetingButton: 'Create Meeting',
  // haveMeetingID: 'Have a Meeting ID?',
  // pstnToggle: 'Use PSTN (Join by dialing a number)',
  // hostControlsToggle: (toggle) =>
  //   toggle
  //     ? 'Restrict Host Controls (Separate host link)'
  //     : 'Restrict Host Controls (Everyone is a Host)',
};
