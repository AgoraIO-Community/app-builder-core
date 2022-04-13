import {BaseI18nType} from '../i18nTypes';

export interface CommonLabelsInterface {
  goBackButton?: BaseI18nType;
  logoutButton?: BaseI18nType;
  googleAuthButton?: BaseI18nType;
  microsoftAuthButton?: BaseI18nType;
  slackAuthButton?: BaseI18nType;
  appleAuthButton?: BaseI18nType;
}

export const CommonLabels: CommonLabelsInterface = {
  goBackButton: 'Go back',
  logoutButton: 'Logout',
  googleAuthButton: 'Google',
  microsoftAuthButton: 'Microsoft',
  slackAuthButton: 'Slack',
  appleAuthButton: 'Apple',
};
