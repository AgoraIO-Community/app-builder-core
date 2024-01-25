import {I18nBaseType} from '../i18nTypes';

export interface I18nShareLinkScreenLabelsInterface {
  roomLink?: I18nBaseType;
  attendeeLink?: I18nBaseType;
  attendeeId?: I18nBaseType;
  hostLink?: I18nBaseType;
  hostId?: I18nBaseType;
  PSTN?: I18nBaseType;
  number?: I18nBaseType;
  pin?: I18nBaseType;
  copyInviteButton?: I18nBaseType;
  copiedToClipboard?: I18nBaseType;
  shareWithAttendee?: I18nBaseType;
  shareWithCoHost?: I18nBaseType;
  startStream?: I18nBaseType;
  startRoom?: I18nBaseType;
  sharePhoneNumber?: I18nBaseType;
}

export const ShareLinkScreenLabels: I18nShareLinkScreenLabelsInterface = {
  roomLink: 'Room Link',
  attendeeLink: 'Attendee Link',
  attendeeId: 'Attendee ID',
  hostLink: 'Host Link',
  hostId: 'Host ID',
  PSTN: 'PSTN',
  number: 'Number',
  pin: 'Pin',
  copyInviteButton: 'Copy invite to clipboard',
  copiedToClipboard: 'Copied to clipboard',
  shareWithAttendee: 'Share this with attendees you want to invite.',
  shareWithCoHost: 'Share this with other co-hosts you want to invite.',
  startRoom: 'Start Room (as host)',
  startStream: 'Start Stream (as host)',
  sharePhoneNumber: 'Share this phone number and pin to dial from phone.',
};
