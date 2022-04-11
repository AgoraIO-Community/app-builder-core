import {i18nInterface} from '../utils/i18nTypes';

export const CreateScreenLabels: i18nInterface['data'] = {
  meetingNameInputPlaceholder: 'Name your Meeting',
  createMeetingButton: 'Create Meeting',
  haveMeetingID: 'Have a Meeting ID?',
  usePSTN: 'Use PSTN (Join by dialing a number)',
  hostControlsToggle: (toggle) =>
    toggle
      ? 'Restrict Host Controls (Separate host link)'
      : 'Restrict Host Controls (Everyone is a Host)',
};
