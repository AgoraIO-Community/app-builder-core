import React, {useEffect} from 'react';
import {Text, Platform, Linking} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import {useHistory} from './Router';
import SelectOAuth from '../subComponents/SelectOAuth';

import { oAuthGoogle, googleUrl, url } from './OAuthConfig';

const processUrl = (url: string): string => {
  return url
    .replace(`${$config.projectName.toLowerCase()}://my-host`, '')
    .replace($config.frontEndURL, '');
};

const Oauth = () => {
  let history = useHistory();

  const onSelectOAuthSystem = async ({ oAuthSystemType }) => {
    try {
      // const url = `https://deep-link-tester.netlify.app`;
      const oAuthUrl = url({ platform: 'mobile'})[`${oAuthSystemType}Url`];
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.openAuth(oAuthUrl, oAuthUrl);
        console.log(JSON.stringify(result));
        if (result.type === 'success') {
          console.log('success', Linking.canOpenURL(result.url));
          history.push(processUrl(result.url));
        }
      } else {
        Linking.openURL(oAuthUrl);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return <SelectOAuth onSelectOAuth={onSelectOAuthSystem} />;
};

export default Oauth;
