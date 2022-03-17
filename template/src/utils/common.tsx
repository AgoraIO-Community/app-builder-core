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
import { Platform } from "react-native";

const cmpTypeGuard = (Cmp: any, FallBack: React.FC<any>) => {
  //TODO:hari - what if null passed and handle that also -  null or undefined should not render anything
  return typeof Cmp === 'function' ? <Cmp /> : <FallBack />;
}
const getTypeGuard = (Cmp: any, FallBack: React.FC) => {
  return typeof Cmp === 'function' ? Cmp : FallBack;
}
const hasBrandLogo: boolean = !!$config.LOGO;


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
  shouldAuthenticate,
  isWeb,
  isIOS,
  isAndroid,
  cmpTypeGuard,
  getTypeGuard
}

