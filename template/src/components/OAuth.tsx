import React, { useContext } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Linking
} from 'react-native';
import ColorContext from '../components/ColorContext';


const oauth = {
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

const url = `${oauth.auth_uri}?response_type=code&scope=${oauth.scope}&include_granted_scopes=true&state=${oauth.state}&client_id=${oauth.client_id}&redirect_uri=${oauth.redirect_uri}`;

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

 

const oAuthMicrosoft = {
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

const oAuthSlack = {
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

const oAuthApple = {
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

const url = `${oauth.auth_uri}?response_type=code&scope=${oauth.scope}&include_granted_scopes=true&state=${oauth.state}&client_id=${oauth.client_id}&redirect_uri=${oauth.redirect_uri}`;
const microsoftUrl = `${oAuthMicrosoft.auth_uri}?response_type=code&scope=${oAuthMicrosoft.scope}&include_granted_scopes=true&state=${oAuthMicrosoft.state}&client_id=${oAuthMicrosoft.client_id}&redirect_uri=${oAuthMicrosoft.redirect_uri}`;
const slackUrl = `${oAuthSlack.auth_uri}?response_type=code&scope=${oAuthSlack.scope}&include_granted_scopes=true&state=${oAuthSlack.state}&client_id=${oAuthSlack.client_id}&redirect_uri=${oAuthSlack.redirect_uri}`;
const appleUrl = `${oAuthApple.auth_uri}?response_type=code&scope=${oAuthApple.scope}&include_granted_scopes=true&state=${oAuthApple.state}&response_mode=form_post&client_id=${oAuthApple.client_id}&redirect_uri=${oAuthApple.redirect_uri}`;

const Oauth = () => {
  // Linking.openURL(url);
  const {primaryColor} = useContext(ColorContext);
  return  <View style={style.ruler} >
    <TouchableOpacity
      style={[style.secondaryBtn, {borderColor: primaryColor}]}
      onPress={() => Linking.openURL(url)}>
      <Text style={[style.secondaryBtnText, {color: primaryColor}]}>
        Login with google
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[style.secondaryBtn, {borderColor: primaryColor}]}
      onPress={() => Linking.openURL(microsoftUrl)}>
      <Text style={[style.secondaryBtnText, {color: primaryColor}]}>
        Login with Microsoft
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[style.secondaryBtn, {borderColor: primaryColor}]}
      onPress={() => Linking.openURL(slackUrl)}>
      <Text style={[style.secondaryBtnText, {color: primaryColor}]}>
        Login with Slack
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[style.secondaryBtn, {borderColor: primaryColor}]}
      onPress={() => Linking.openURL(appleUrl)}>
      <Text style={[style.secondaryBtnText, {color: primaryColor}]}>
        Login with Apple
      </Text>
    </TouchableOpacity>
  </View>
};
const style = StyleSheet.create({
  full: {flex: 1},
  illustration: {flex: 1, alignSelf: 'flex-end'},
  main: {
    flex: 2,
    justifyContent: 'space-evenly',
    marginHorizontal: '10%',
  },
  nav: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {flex: 6, flexDirection: 'row'},
  leftContent: {
    width: '100%',
    flex: 1,
    justifyContent: 'space-evenly',
    marginVertical: '5%',
    marginRight: '5%',
  },
  heading: {
    fontSize: 40,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  headline: {
    fontSize: 20,
    fontWeight: '400',
    color: '#777',
    marginBottom: 20,
  },
  inputs: {
    flex: 1,
    width: '100%',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  textInput: {
    width: '100%',
    paddingLeft: 8,
    borderColor: '#099DFD',
    borderWidth: 2,
    color: '#333',
    fontSize: 16,
    marginBottom: 15,
    maxWidth: 400,
    minHeight: 45,
  },
  primaryBtn: {
    width: '60%',
    backgroundColor: '#099DFD',
    maxWidth: 400,
    minHeight: 45,
  },
  primaryBtnDisabled: {
    width: '60%',
    backgroundColor: '#099DFD80',
    maxWidth: 400,
    minHeight: 45,
  },
  primaryBtnText: {
    width: '100%',
    height: 45,
    lineHeight: 45,
    fontSize: 16,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#fff',
  },
  ruler: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    width: '100%',
    maxWidth: 200,
  },
  secondaryBtn: {
    width: '60%',
    borderColor: '#099DFD',
    borderWidth: 3,
    maxWidth: 400,
    minHeight: 45,
  },
  secondaryBtnText: {
    width: '100%',
    height: 45,
    lineHeight: 45,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    textAlignVertical: 'center',
    color: '#099DFD',
  },
});
export default Oauth;
