/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React from 'react';
import {Platform as ReactNativePlatform} from 'react-native';
import Platform from '../subComponents/Platform';

import * as ReactIs from 'react-is';

const isValidReactComponent = <T,>(Component?: React.ComponentType<T>) =>
  Component && ReactIs.isValidElementType(Component) ? true : false;

const useHasBrandLogo = () => () => !!$config.LOGO;

const shouldAuthenticate: boolean =
  $config.ENABLE_APPLE_OAUTH ||
  $config.ENABLE_GOOGLE_OAUTH ||
  $config.ENABLE_MICROSOFT_OAUTH ||
  $config.ENABLE_SLACK_OAUTH;

//for our internal usage don't check Platform - electron and web will same kind ui checks. thats why we have isWeb for external usage
const isWebInternal = () => ReactNativePlatform.OS === 'web';

/**
 * Checks whether the application is running as a web app and returns true/false.
 * @returns function
 */
const isWeb = () => Platform === 'web' && ReactNativePlatform.OS === 'web';

/**
 * Checks whether the application is running as an android app and returns true/false.
 * @returns function
 */
const isAndroid = () =>
  //@ts-ignore
  Platform === 'native' && ReactNativePlatform.OS === 'android';

/**
 * Checks whether the application is running as an iOS app and returns true/false.
 * @returns function
 */
//@ts-ignore
const isIOS = () => Platform === 'native' && ReactNativePlatform.OS === 'ios';

/**
 * Checks whether the application is running as an electron desktop app and returns true/false.
 * @returns function
 */
//@ts-ignore
const isDesktop = () => Platform === 'electron';

const isArray = (data: any[]) =>
  data && Array.isArray(data) && data.length ? true : false ? true : false;
export {
  useHasBrandLogo,
  isAndroid,
  isIOS,
  isWebInternal,
  isWeb,
  isDesktop,
  shouldAuthenticate,
  isArray,
  isValidReactComponent,
};
