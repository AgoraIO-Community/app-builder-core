import {BaseI18nType} from '../i18nTypes';

export interface ShareLinkScreenLabelsInterface {
  attendeeUrlLabel?: BaseI18nType;
  hostUrlLabel?: BaseI18nType;
  enterMeetingAfterCreateButton?: BaseI18nType;
  copyInvite?: BaseI18nType;
  pstnLabel?: BaseI18nType;
  pstnNumberLabel?: BaseI18nType;
  meetingUrlLabel?: BaseI18nType;
  hostIdLabel?: BaseI18nType;
  meetingIdLabel?: BaseI18nType;
  attendeeIdLabel?: BaseI18nType;
  copiedToClipboardNotificationLabel?: BaseI18nType;
  PSTNNumber?: BaseI18nType;
  PSTNPin?: BaseI18nType;
  meeting?: BaseI18nType;
  URLForAttendee?: BaseI18nType;
  URLForHost?: BaseI18nType;
  attendeeMeetingID?: BaseI18nType;
  hostMeetingID?: BaseI18nType;
}

export const ShareLinkScreenLabels: ShareLinkScreenLabelsInterface = {
  attendeeUrlLabel: 'Attendee URL',
  hostUrlLabel: 'Host URL',
  enterMeetingAfterCreateButton: 'Start Meeting (as host)',
  copyInvite: 'Copy invite to clipboard',
  pstnLabel: 'PSTN',
  pstnNumberLabel: 'Number',
  meetingUrlLabel: 'Meeting URL',
  hostIdLabel: 'Host ID',
  meetingIdLabel: 'Meeting ID',
  attendeeIdLabel: 'Attendee ID',
  copiedToClipboardNotificationLabel: 'Copied to Clipboard',
  PSTNNumber: 'PSTN Number',
  PSTNPin: 'PSTN Pin',
  URLForAttendee: 'URL for Attendee',
  URLForHost: 'URL for Host',
  attendeeMeetingID: 'Attendee Meeting ID',
  hostMeetingID: 'Host Meeting ID',
};
