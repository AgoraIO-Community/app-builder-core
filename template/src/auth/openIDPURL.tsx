import {Linking} from 'react-native';
import {getIDPAuthRedirectURL, getOriginURL, getPlatformId} from './config';

const AUTH_ENDPOINT_URL = `${$config.BACKEND_ENDPOINT}/v1/idp/login`;

export const enableIDPAuth = () => {
  const URL = `${AUTH_ENDPOINT_URL}?project_id=${
    $config.PROJECT_ID
  }&redirect_url=${getIDPAuthRedirectURL()}&origin_url=${getOriginURL()}&platform_id=${getPlatformId()}`;
  Linking.openURL(URL);
};
