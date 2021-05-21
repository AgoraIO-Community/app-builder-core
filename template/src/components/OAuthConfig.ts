  // platform = web|mobile|desktop

  export const oAuthGoogle = ({ platform }) => ({
    client_id: $config.GOOGLE_CLIENT_ID, 
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    redirect_uri: `${$config.backEndURL}/oauth`,
    scope: encodeURIComponent(
      'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    ),
    state: encodeURIComponent(
      `site=google&platform=${platform}&backend=${$config.backEndURL}&redirect=${window.location.origin}/auth-token/`,
    ),
  });  
  
  export const oAuthMicrosoft = ({ platform }) =>  ({
    client_id: $config.MICROSOFT_CLIENT_ID, //124
    auth_uri: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    redirect_uri: `${$config.backEndURL}/oauth`,
    scope: 'openid',
    state: encodeURIComponent(
      `site=microsoft&platform=${platform}&redirect=${window.location.origin}/auth-token/&backend=${$config.backEndURL}`
    ),
  })
  
  export const oAuthSlack = ({ platform }) => ({
    client_id: $config.SLACK_CLIENT_ID,
    auth_uri: 'https://slack.com/oauth/authorize',
    redirect_uri: `${$config.backEndURL}/oauth`,
    scope: 'users.profile:read',
    state: encodeURIComponent(
       `site=slack&platform=${platform}&redirect=${window.location.origin}/auth-token/&backend=${$config.backEndURL}`
    ),
  })
  
  export const oAuthApple = ({ platform }) => ({
    client_id: $config.APPLE_CLIENT_ID,
    auth_uri: 'https://appleid.apple.com/auth/authorize',
    redirect_uri: `${$config.backEndURL}/oauth`,
    scope: 'name email',
    state: encodeURIComponent(
      `site=apple&platform=${platform}&redirect=${window.location.origin}/auth-token/&backend=${$config.backEndURL}`
    ),
  })
  
//   export const googleUrl = `${oAuthGoogle.auth_uri}?response_type=code&scope=${oAuthGoogle.scope}&include_granted_scopes=true&state=${oAuthGoogle.state}&client_id=${oAuthGoogle.client_id}&redirect_uri=${oAuthGoogle.redirect_uri}`;
//   export const microsoftUrl = `${oAuthMicrosoft.auth_uri}?response_type=code&scope=${oAuthMicrosoft.scope}&include_granted_scopes=true&state=${oAuthMicrosoft.state}&client_id=${oAuthMicrosoft.client_id}&redirect_uri=${oAuthMicrosoft.redirect_uri}`;
//   export const slackUrl = `${oAuthSlack.auth_uri}?response_type=code&scope=${oAuthSlack.scope}&include_granted_scopes=true&state=${oAuthSlack.state}&client_id=${oAuthSlack.client_id}&redirect_uri=${oAuthSlack.redirect_uri}`;
//   export const appleUrl = `${oAuthApple.auth_uri}?response_type=code&scope=${oAuthApple.scope}&include_granted_scopes=true&state=${oAuthApple.state}&response_mode=form_post&client_id=${oAuthApple.client_id}&redirect_uri=${oAuthApple.redirect_uri}`;
  
  export const url = ({ platform }) => {
    const configGoogle = oAuthGoogle({ platform })
    const configMicrosoft = oAuthMicrosoft({ platform })
    const configSlack = oAuthSlack({ platform })
    const configApple = oAuthApple({ platform })
    return {
        googleUrl: `${configGoogle.auth_uri}?response_type=code&scope=${configGoogle.scope}&include_granted_scopes=true&state=${configGoogle.state}&client_id=${configGoogle.client_id}&redirect_uri=${configGoogle.redirect_uri}`,
        microsoftUrl:  `${configMicrosoft.auth_uri}?response_type=code&scope=${configMicrosoft.scope}&include_granted_scopes=true&state=${configMicrosoft.state}&client_id=${configMicrosoft.client_id}&redirect_uri=${configMicrosoft.redirect_uri}`,
        slackUrl: `${configSlack.auth_uri}?response_type=code&scope=${configSlack.scope}&include_granted_scopes=true&state=${configSlack.state}&client_id=${configSlack.client_id}&redirect_uri=${configSlack.redirect_uri}`,
        appleUrl:  `${configApple.auth_uri}?response_type=code&scope=${configApple.scope}&include_granted_scopes=true&state=${configApple.state}&response_mode=form_post&client_id=${configApple.client_id}&redirect_uri=${configApple.redirect_uri}`,
   }
}