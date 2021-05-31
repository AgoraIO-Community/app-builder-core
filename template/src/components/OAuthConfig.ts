export type oAuthSystemType = 'google' | 'microsoft' | 'slack' | 'apple';
type platformType = 'web' | 'mobile' | 'desktop';
type oAuthUrlType = {
  googleUrl: string;
  microsoftUrl: string;
  slackUrl: string;
  appleUrl: string;
};

export const oAuthGoogle = ({platform}: {platform: platformType}) => ({
  client_id: $config.GOOGLE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  redirect_uri: `${$config.BACKEND_ENDPOINT}/oauth`,
  scope: encodeURIComponent(
    'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
  ),
  state: encodeURIComponent(
    `site=google&platform=${platform}&backend=${$config.BACKEND_ENDPOINT}&redirect=${window.location.origin}/auth-token/`,
  ),
});

export const oAuthMicrosoft = ({platform}: {platform: platformType}) => ({
  client_id: $config.MICROSOFT_CLIENT_ID,
  auth_uri: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  redirect_uri: `${$config.BACKEND_ENDPOINT}/oauth`,
  scope: 'openid',
  state: encodeURIComponent(
    `site=microsoft&platform=${platform}&redirect=${window.location.origin}/auth-token/&backend=${$config.BACKEND_ENDPOINT}`,
  ),
});

export const oAuthSlack = ({platform}: {platform: platformType}) => ({
  client_id: $config.SLACK_CLIENT_ID,
  auth_uri: 'https://slack.com/oauth/authorize',
  redirect_uri: `${$config.BACKEND_ENDPOINT}/oauth`,
  scope: 'users.profile:read',
  state: encodeURIComponent(
    `site=slack&platform=${platform}&redirect=${window.location.origin}/auth-token/&backend=${$config.BACKEND_ENDPOINT}`,
  ),
});

export const oAuthApple = ({platform}: {platform: platformType}) => ({
  client_id: $config.APPLE_CLIENT_ID,
  auth_uri: 'https://appleid.apple.com/auth/authorize',
  redirect_uri: `${$config.BACKEND_ENDPOINT}/oauth`,
  scope: 'name email',
  state: encodeURIComponent(
    `site=apple&platform=${platform}&redirect=${window.location.origin}/auth-token/&backend=${$config.BACKEND_ENDPOINT}`,
  ),
});


export const url = ({platform}: {platform: platformType}): oAuthUrlType => {
  const configGoogle = oAuthGoogle({platform});
  const configMicrosoft = oAuthMicrosoft({platform});
  const configSlack = oAuthSlack({platform});
  const configApple = oAuthApple({platform});
  return {
    googleUrl: `${configGoogle.auth_uri}?response_type=code&scope=${configGoogle.scope}&include_granted_scopes=true&state=${configGoogle.state}&client_id=${configGoogle.client_id}&redirect_uri=${configGoogle.redirect_uri}`,
    microsoftUrl: `${configMicrosoft.auth_uri}?response_type=code&scope=${configMicrosoft.scope}&include_granted_scopes=true&state=${configMicrosoft.state}&client_id=${configMicrosoft.client_id}&redirect_uri=${configMicrosoft.redirect_uri}`,
    slackUrl: `${configSlack.auth_uri}?response_type=code&scope=${configSlack.scope}&include_granted_scopes=true&state=${configSlack.state}&client_id=${configSlack.client_id}&redirect_uri=${configSlack.redirect_uri}`,
    appleUrl: `${configApple.auth_uri}?response_type=code&scope=${configApple.scope}&include_granted_scopes=true&state=${configApple.state}&response_mode=form_post&client_id=${configApple.client_id}&redirect_uri=${configApple.redirect_uri}`,
  };
};
