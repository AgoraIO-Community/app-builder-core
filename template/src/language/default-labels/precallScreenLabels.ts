import {i18nInterface} from '../i18nTypes';

export const PrecallScreenLabels: i18nInterface['data'] = {
  precallLabel: 'Precall',
  selectInputDeviceLabel: 'Select Input Device',
  userNamePlaceholder: 'Display name*',
  fetchingNamePlaceholder: 'Getting name...',
  loadingWithDots: 'Loading...',
  joinRoomButton: (ready) => (ready ? 'Join Room' : 'Loading...'),
};
