import {I18nBaseType, I18nConditionalType} from '../i18nTypes';

export interface I18nCreateScreenLabelsInterface {
  meetingNameInputPlaceholder?: I18nBaseType;
  createMeetingButton?: I18nBaseType;
  haveMeetingID?: I18nBaseType;
  usePSTN?: I18nBaseType;
  hostControlsToggle?: I18nConditionalType;
}

export const CreateScreenLabels: I18nCreateScreenLabelsInterface = {
  meetingNameInputPlaceholder: 'Name your Meeting',
  createMeetingButton: 'Create Meeting',
  haveMeetingID: 'Have a Meeting ID?',
  usePSTN: 'Use PSTN (Join by dialing a number)',
  hostControlsToggle: (toggle) =>
    toggle
      ? 'Restrict Host Controls (Separate host link)'
      : 'Restrict Host Controls (Everyone is a Host)',
};
