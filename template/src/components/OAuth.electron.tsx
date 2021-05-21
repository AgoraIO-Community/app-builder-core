import React, {useEffect} from 'react';
import {Text} from 'react-native';
import {useHistory} from './Router';
import SelectOAuth from '../subComponents/SelectOAuth';
import { url } from './OAuthConfig';

const Oauth = () => {
  const history = useHistory();
  const onSelectOAuthSystem = ({ oAuthSystemType }) => {
    console.log('electron OAuth');
    const oAuthUrl = url({ platform: 'desktop'})[`${oAuthSystemType}Url`];
    // @ts-ignore
    window.addEventListener(
      'message',
      ({data, origin}: {data: {token: string}; origin: string}) => {
        if (data.token) {
          console.log(data, origin);
          history.push(`/auth-token/${data.token}`);
        }
      },
      false,
    );
    window.open(oAuthUrl, 'modal');
  };
  return <SelectOAuth onSelectOAuth={onSelectOAuthSystem} />;
};
export default Oauth;
