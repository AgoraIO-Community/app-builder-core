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

const useIsWeb = () => () =>
  Platform === 'web' && ReactNativePlatform.OS === 'web';

const useIsAndroid = () => () =>
  //@ts-ignore
  Platform === 'native' && ReactNativePlatform.OS === 'android';

const useIsIOS = () => () =>
  //@ts-ignore
  Platform === 'native' && ReactNativePlatform.OS === 'ios';

//@ts-ignore
const useIsDestop = () => () => Platform === 'electron';

const isArray = (data: any[]) =>
  data && Array.isArray(data) && data.length ? true : false ? true : false;
export {
  useHasBrandLogo,
  useIsAndroid,
  useIsIOS,
  useIsWeb,
  useIsDestop,
  shouldAuthenticate,
  isArray,
  isValidReactComponent,
};
