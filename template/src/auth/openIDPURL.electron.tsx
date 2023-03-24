import {getOriginURL, getPlatformId, AUTH_ENDPOINT_URL} from './config';

export const getIDPAuthLoginURL = () => {
  //redirect URL not require for electron
  return `${AUTH_ENDPOINT_URL}?project_id=${
    $config.PROJECT_ID
  }&origin_url=${getOriginURL()}&platform_id=${getPlatformId()}`;
};

export const addEventListenerForToken = (history) => {
  window.addEventListener(
    'message',
    ({data, origin}: {data: {token: string}; origin: string}) => {
      if (data?.token) {
        history.push(`/authorize/${data.token}`);
      }
    },
    false,
  );
};

export const enableIDPAuth = async (history) => {
  addEventListenerForToken(history);
  //open the auth login in the popup
  window.open(getIDPAuthLoginURL(), 'modal');
};
export const exitApp = () => {};
