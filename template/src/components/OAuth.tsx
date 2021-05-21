import React from 'react';
import {
  Linking
} from 'react-native';
import SelectOAuth from '../subComponents/SelectOAuth';
import { url } from './OAuthConfig';


const Oauth = () => {
  const onSelectOAuthSystem = ({ oAuthSystemType }) => {
    const oAuthUrl = url[`${oAuthSystemType}Url`];

    Linking.openURL(oAuthUrl)
  }
  return  <SelectOAuth onSelectOAuth={onSelectOAuthSystem}/>;
};

export default Oauth;
