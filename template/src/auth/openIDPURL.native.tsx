import {Linking, Platform} from 'react-native';
import {getIDPAuthRedirectURL, getOriginURL, getPlatformId} from './config';
const AUTH_ENDPOINT_URL = `${$config.BACKEND_ENDPOINT}/v1/idp/login`;
import InAppBrowser from 'react-native-inappbrowser-reborn';

export const getDeepLink = (path = '') => {
  const scheme = $config.PRODUCT_ID?.toLowerCase();
  const prefix =
    Platform.OS === 'android' ? `${scheme}://my-host/` : `${scheme}://`;
  return prefix + path;
};

export const enableIDPAuth = async () => {
  try {
    const URL = `${AUTH_ENDPOINT_URL}?project_id=${
      $config.PROJECT_ID
    }&redirect_url=${encodeURIComponent(
      getDeepLink('authorize'),
    )}&origin_url=${encodeURIComponent(
      getOriginURL(),
    )}&platform_id=${getPlatformId()}`;

    if (await InAppBrowser.isAvailable()) {
      await InAppBrowser.close();
      await InAppBrowser.openAuth(URL, encodeURIComponent(getDeepLink()));
    } else {
      Linking.openURL(URL);
    }
  } catch (error) {
    console.log(error.message);
  }
};
