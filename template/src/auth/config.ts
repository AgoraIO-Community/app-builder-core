import {isWebInternal, isAndroid, isIOS} from '../utils/common';
import isSDK from '../utils/isSDK';

export const getPlatformId = (): string => {
  let platformID = 'turnkey_web';
  // Turnkey
  isWebInternal() && (platformID = 'turnkey_web');
  isAndroid() || (isIOS() && (platformID = 'turnkey_native'));
  // SDKs
  isSDK() && isWebInternal() && (platformID = 'sdk_web');
  isSDK() && isAndroid() && (platformID = 'sdk_android');
  isSDK() && isIOS() && (platformID = 'sdk_ios');
  return platformID;
};

export const getRequestHeaders = () => {
  return {
    'X-Project-ID': $config.PROJECT_ID,
    'X-Platform-ID': getPlatformId(),
  };
};

export const getIDPAuthRedirectURL = () => {
  return isWebInternal()
    ? `${window.location.origin}/authorize`
    : `${$config.FRONTEND_ENDPOINT}/authorize`;
};

export const getUnauthLoginRedirectURL = () => {
  // return 'https://conferencing.agora.io';
  return isWebInternal()
    ? `${window.location.origin}/create`
    : `${$config.FRONTEND_ENDPOINT}/create`;
};

export const getOriginURL = () => {
  return isWebInternal()
    ? `${window.location.origin}`
    : `${$config.FRONTEND_ENDPOINT}`;
};

export const GET_UNAUTH_FLOW_API_ENDPOINT = () =>
  `${
    $config.BACKEND_ENDPOINT
  }/v1/login?redirect_url=${getUnauthLoginRedirectURL()}&origin_url=${getOriginURL()}`;
