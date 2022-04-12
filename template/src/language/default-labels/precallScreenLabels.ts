import {ClientRole} from '../../../agora-rn-uikit';
import {i18nInterface} from '../i18nTypes';

export const PrecallScreenLabels: i18nInterface['data'] = {
  precallLabel: 'Precall',
  selectInputDeviceLabel: 'Select Input Device',
  userNamePlaceholder: 'Display name*',
  fetchingNamePlaceholder: 'Getting name...',
  loadingWithDots: 'Loading...',
  joinRoomButton: (ready) => (ready ? 'Join Room' : 'Loading...'),
  joinRoomLiveSteamingButton: (input) =>
    `Join Room as ${input === ClientRole.Broadcaster ? 'Host' : 'Audience'}`,
};
