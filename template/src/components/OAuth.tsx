import React from 'react';
import {Linking} from 'react-native';
import SelectOAuth from '../subComponents/SelectOAuth';
import {url, oAuthSystemType} from './OAuthConfig';

const Oauth = () => {
  const onSelectOAuthSystem = ({
    oAuthSystem,
  }: {
    oAuthSystem: oAuthSystemType;
  }) => {
    const oAuthUrl = url({platform: 'web'})[`${oAuthSystem}Url`];
    console.log(oAuthUrl);
    Linking.openURL(oAuthUrl);
  };
  return <SelectOAuth onSelectOAuth={onSelectOAuthSystem} />;
};

export default Oauth;
