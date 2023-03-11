import {getIDPAuthRedirectURL, getOriginURL, getPlatformId} from './config';
const AUTH_ENDPOINT_URL = `${$config.BACKEND_ENDPOINT}/v1/idp/login`;
export const enableIDPAuth = () => {
  window.addEventListener(
    'message',
    ({data, origin}: {data: {token: string}; origin: string}) => {
      if (data.token) {
        console.log('debugging token electron', data, origin);
      }
    },
    false,
  );
  const URL = `${AUTH_ENDPOINT_URL}?project_id=${
    $config.PROJECT_ID
  }&redirect_url=${getIDPAuthRedirectURL()}&origin_url=${getOriginURL()}&platform_id=${getPlatformId()}`;
  window.open(URL, 'modal');
};
