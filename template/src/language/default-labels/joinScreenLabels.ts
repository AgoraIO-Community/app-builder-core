import {BaseI18nType} from '../i18nTypes';

export interface JoinScreenLabelsInterface {
  meetingIdInputPlaceholder?: BaseI18nType;
  enterMeetingButton?: BaseI18nType;
}

export const JoinScreenLabels: JoinScreenLabelsInterface = {
  meetingIdInputPlaceholder: 'Enter Meeting ID',
  enterMeetingButton: 'Enter Meeting',
};
