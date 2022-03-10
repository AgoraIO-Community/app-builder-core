import React from 'react';
import { Platform } from "react-native";

const cmpTypeGuard = (Cmp: any, FallBack: React.FC<any>) => {
  //TODO:hari - what if null passed and handle that also -  null or undefined should not render anything
  return typeof Cmp === 'function' ? <Cmp /> : <FallBack />;
}
const getTypeGuard = (Cmp: any, FallBack: React.FC) => {
  return typeof Cmp === 'function' ? Cmp : FallBack;
}
const hasBrandLogo: boolean = !!$config.LOGO;

const isSafariBrowser = () => {
  if (!('userAgent' in navigator)) {
    console.warn('unable to detect browser');
    return false;
  }

  const userAgentString = navigator.userAgent;
  // Detect Chrome
  const chromeAgent = userAgentString.indexOf('Chrome') > -1;
  // Detect Safari
  const safariAgent = userAgentString.indexOf('Safari') > -1;

  // One additional check is required in the case of the Safari browser
  // as the user-agent of the Chrome browser also includes the Safari browser’s user-agent.
  // If both the user-agents of Chrome and Safari are in the user-agent,
  // it means that the browser is Chrome, and hence the Safari browser value is discarded.

  if (chromeAgent && safariAgent) return false; // Discard Safari since it also matches Chrome
  return true;
};

const shouldAuthenticate: boolean =
  $config.ENABLE_APPLE_OAUTH ||
  $config.ENABLE_GOOGLE_OAUTH ||
  $config.ENABLE_MICROSOFT_OAUTH ||
  $config.ENABLE_SLACK_OAUTH;

const isWeb = Platform.OS === 'web'
const isAndroid = Platform.OS === 'android'
const isIOS = Platform.OS === 'ios'
//TODO:hari export check for desktop platform
export {
  hasBrandLogo,
  isSafariBrowser,
  shouldAuthenticate,
  isWeb,
  isIOS,
  isAndroid,
  cmpTypeGuard,
  getTypeGuard
}

