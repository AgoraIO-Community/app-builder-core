// const url = `${oauth.auth_uri}?response_type=code&scope=${oauth.scope}&include_granted_scopes=true&state=${oauth.state}&client_id=${oauth.client_id}&redirect_uri=${oauth.redirect_uri}`;

// https://login.microsoftonline.com/common/oauth2/v2.0/authorize? scope=openid&include_granted_scopes=true&response_type=code& state=site%3Dmicrosoft%26platform%3Dweb%26redirect%3Dhttp%3A%2F%2Flocalhost%3A8080%2F%26backend%3Dhttps%3A%2F%2Fcryptic-dawn-34132.herokuapp.com&redirect_uri=https://cryptic-dawn-34132.herokuapp.com/oauth&client_id=1ff51624-3bf0-46be-9ee2-2b82e5d1deac
// https://slack.com/oauth/authorize? scope=users.profile:read&include_granted_scopes=true&response_type=code& state=site%3Dslack%26platform%3Dweb%26redirect%3Dhttp%3A%2F%2Flocalhost%3A8080%2F%26backend%3Dhttps%3A%2F%2Fcryptic-dawn-34132.herokuapp.com&redirect_uri=https://cryptic-dawn-34132.herokuapp.com/oauth&client_id=2066062302291.2065854837538"
// https://appleid.apple.com/auth/authorize? scope=name email&include_granted_scopes=true&response_type=code& response_mode=form_post& state=site%3Dapple%26platform%3Dweb%26redirect%3Dhttp%3A%2F%2Flocalhost%3A8080%2F%26backend%3Dhttps%3A%2F%2Fcryptic-dawn-34132.herokuapp.com&redirect_uri=https://cryptic-dawn-34132.herokuapp.com/oauth&client_id=io.agora.appbuildertestingservice

// scope
  // microsoft = openid
  // slack = users.profile:read
  // apple = name email

// include_granted_scopes
  // microsoft = true
  // slack = true
  // apple = true

// response_type
  // microsoft = code
  // slack = code
  // apple = code

//response_mode
  // apple = form_post

  export const oAuthGoogle = {
    client_id: $config.CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    redirect_uri: `${$config.backEndURL}/oauth/web`,
    scope: encodeURIComponent(
      'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    ),
    state: encodeURIComponent(
      `site=google&backend=${$config.backEndURL}&redirect=${window.location.origin}/auth-token/`,
    ),
  };  
  
  export const oAuthMicrosoft = {
    client_id: $config.CLIENT_ID,
    auth_uri: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    redirect_uri: 'https://cryptic-dawn-34132.herokuapp.com/oauth',
    scope: 'openid',
    state: encodeURIComponent(
      // `site=google&backend=${$config.backEndURL}&redirect=${window.location.origin}/auth-token/`,
      // 'site=microsoft&platform=web&redirect=http://localhost:8080/&backend=https://cryptic-dawn-34132.herokuapp.com&redirect_uri=https://cryptic-dawn-34132.herokuapp.com/oauth&client_id=1ff51624-3bf0-46be-9ee2-2b82e5d1deac'
      `site=microsoft&platform=web&redirect=${window.location.origin}/auth-token/&backend=https://cryptic-dawn-34132.herokuapp.com&redirect_uri=https://cryptic-dawn-34132.herokuapp.com/oauth&client_id=1ff51624-3bf0-46be-9ee2-2b82e5d1deac`
    ),
  }
  
  export const oAuthSlack = {
    client_id: $config.CLIENT_ID,
    auth_uri: 'https://slack.com/oauth/authorize',
    redirect_uri: 'https://cryptic-dawn-34132.herokuapp.com/oauth',
    scope: 'users.profile:read',
    state: encodeURIComponent(
      // `site=google&backend=${$config.backEndURL}&redirect=${window.location.origin}/auth-token/`,
      // state=site=slack&platform=web&redirect=http://localhost:8080/&backend=https://cryptic-dawn-34132.herokuapp.com&redirect_uri=https://cryptic-dawn-34132.herokuapp.com/oauth&client_id=2066062302291.2065854837538
       `site=slack&platform=web&redirect=${window.location.origin}&backend=https://cryptic-dawn-34132.herokuapp.com&redirect_uri=https://cryptic-dawn-34132.herokuapp.com/oauth&client_id=2066062302291.2065854837538`
    ),
  }
  
  export const oAuthApple = {
    client_id: $config.CLIENT_ID,
    auth_uri: 'https://appleid.apple.com/auth/authorize',
    redirect_uri: 'https://cryptic-dawn-34132.herokuapp.com/oauth',
    scope: 'name email',
    state: encodeURIComponent(
      // `site=google&backend=${$config.backEndURL}&redirect=${window.location.origin}/auth-token/`,
      // site=apple&platform=web&redirect=http://localhost:8080/&backend=https://cryptic-dawn-34132.herokuapp.com&redirect_uri=https://cryptic-dawn-34132.herokuapp.com/oauth&client_id=io.agora.appbuildertestingservice
      `site=apple&platform=web&redirect=${window.location.origin}&backend=https://cryptic-dawn-34132.herokuapp.com&redirect_uri=https://cryptic-dawn-34132.herokuapp.com/oauth&client_id=io.agora.appbuildertestingservice`
    ),
  }
  
  export const googleUrl = `${oAuthGoogle.auth_uri}?response_type=code&scope=${oAuthGoogle.scope}&include_granted_scopes=true&state=${oAuthGoogle.state}&client_id=${oAuthGoogle.client_id}&redirect_uri=${oAuthGoogle.redirect_uri}`;
  export const microsoftUrl = `${oAuthMicrosoft.auth_uri}?response_type=code&scope=${oAuthMicrosoft.scope}&include_granted_scopes=true&state=${oAuthMicrosoft.state}&client_id=${oAuthMicrosoft.client_id}&redirect_uri=${oAuthMicrosoft.redirect_uri}`;
  export const slackUrl = `${oAuthSlack.auth_uri}?response_type=code&scope=${oAuthSlack.scope}&include_granted_scopes=true&state=${oAuthSlack.state}&client_id=${oAuthSlack.client_id}&redirect_uri=${oAuthSlack.redirect_uri}`;
  export const appleUrl = `${oAuthApple.auth_uri}?response_type=code&scope=${oAuthApple.scope}&include_granted_scopes=true&state=${oAuthApple.state}&response_mode=form_post&client_id=${oAuthApple.client_id}&redirect_uri=${oAuthApple.redirect_uri}`;
  
  export const url = {
    googleUrl: `${oAuthGoogle.auth_uri}?response_type=code&scope=${oAuthGoogle.scope}&include_granted_scopes=true&state=${oAuthGoogle.state}&client_id=${oAuthGoogle.client_id}&redirect_uri=${oAuthGoogle.redirect_uri}`,
    microsoftUrl:  `${oAuthMicrosoft.auth_uri}?response_type=code&scope=${oAuthMicrosoft.scope}&include_granted_scopes=true&state=${oAuthMicrosoft.state}&client_id=${oAuthMicrosoft.client_id}&redirect_uri=${oAuthMicrosoft.redirect_uri}`,
    slackUrl: `${oAuthSlack.auth_uri}?response_type=code&scope=${oAuthSlack.scope}&include_granted_scopes=true&state=${oAuthSlack.state}&client_id=${oAuthSlack.client_id}&redirect_uri=${oAuthSlack.redirect_uri}`,
    appleUrl:  `${oAuthApple.auth_uri}?response_type=code&scope=${oAuthApple.scope}&include_granted_scopes=true&state=${oAuthApple.state}&response_mode=form_post&client_id=${oAuthApple.client_id}&redirect_uri=${oAuthApple.redirect_uri}`,
  }