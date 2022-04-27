import {I18nBaseType} from '../i18nTypes';

export interface I18nCommonLabelsInterface {
  goBackButton?: I18nBaseType; //
  logoutButton?: I18nBaseType; //
  googleAuthButton?: I18nBaseType; //
  microsoftAuthButton?: I18nBaseType; //
  slackAuthButton?: I18nBaseType; //
  appleAuthButton?: I18nBaseType; //
}

export const CommonLabels: I18nCommonLabelsInterface = {
  goBackButton: 'Go back',
  logoutButton: 'Logout',
  googleAuthButton: 'Google',
  microsoftAuthButton: 'Microsoft',
  slackAuthButton: 'Slack',
  appleAuthButton: 'Apple',
};
