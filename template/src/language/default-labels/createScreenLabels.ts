import {BaseI18nType, ConditionalI18nType} from '../i18nTypes';

export interface CreateScreenLabelsInterface {
  meetingNameInputPlaceholder?: BaseI18nType;
  createMeetingButton?: BaseI18nType;
  haveMeetingID?: BaseI18nType;
  usePSTN?: BaseI18nType;
  hostControlsToggle?: ConditionalI18nType;
}

export const CreateScreenLabels: CreateScreenLabelsInterface = {
  meetingNameInputPlaceholder: 'Name your Meeting',
  createMeetingButton: 'Create Meeting',
  haveMeetingID: 'Have a Meeting ID?',
  usePSTN: 'Use PSTN (Join by dialing a number)',
  hostControlsToggle: (toggle) =>
    toggle
      ? 'Restrict Host Controls (Separate host link)'
      : 'Restrict Host Controls (Everyone is a Host)',
};
