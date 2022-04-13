import {ChannelProfile, ClientRole} from '../../../agora-rn-uikit';
import {BaseI18nType} from '../i18nTypes';

export interface joinRoomButtonTextInterface {
  ready: boolean;
  mode: ChannelProfile;
  role?: ClientRole;
}
export interface PrecallScreenLabelsInterface {
  precallLabel?: BaseI18nType;
  selectInputDeviceLabel?: BaseI18nType;
  userNamePlaceholder?: BaseI18nType;
  fetchingNamePlaceholder?: BaseI18nType;
  loadingWithDots?: BaseI18nType;
  joinRoomButton?: BaseI18nType<joinRoomButtonTextInterface>;
}

export const PrecallScreenLabels: PrecallScreenLabelsInterface = {
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
