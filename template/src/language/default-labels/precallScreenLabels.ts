import {ChannelProfile, ClientRole} from '../../../agora-rn-uikit';
import {i18nInterface} from '../i18nTypes';

export const PrecallScreenLabels: i18nInterface['data'] = {
  precallLabel: 'Precall',
  selectInputDeviceLabel: 'Select Input Device',
  userNamePlaceholder: 'Display name*',
  fetchingNamePlaceholder: 'Getting name...',
  loadingWithDots: 'Loading...',
  joinRoomButton: ({ready, mode, role}) =>
    ready
      ? mode === ChannelProfile.LiveBroadcasting
        ? `Join Room as ${
            role === ClientRole.Broadcaster ? 'Host' : 'Audience'
          }`
        : 'Join Room'
      : `Loading...`,
};
