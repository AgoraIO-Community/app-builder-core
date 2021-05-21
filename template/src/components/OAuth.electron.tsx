import React from 'react';
import {useHistory} from './Router';
import SelectOAuth from '../subComponents/SelectOAuth';
import {url, oAuthSystemType} from './OAuthConfig';

const Oauth = () => {
  const history = useHistory();
  const onSelectOAuthSystem = ({
    oAuthSystem,
  }: {
    oAuthSystem: oAuthSystemType;
  }) => {
    console.log('electron OAuth');
    const oAuthUrl = url({platform: 'desktop'})[`${oAuthSystem}Url`];
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
