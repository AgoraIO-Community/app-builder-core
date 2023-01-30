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
import {
  Platform as ReactNativePlatform,
  useWindowDimensions,
} from 'react-native';
import Platform from '../subComponents/Platform';

import * as ReactIs from 'react-is';

const trimText = (text: string, length: number = 25) => {
  if (!text) {
    return '';
  }
  return text?.substring(0, length) + (text?.length > length ? '...' : '');
};
const maxInputLimit = 60;
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

/**
 * Checks whether the application is running on mobile device (user agent) and returns true/false.
 * @returns function
 */
//@ts-ignore
const isMobileUA = () => {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
        a,
      ) ||
      isAndroid() ||
      isIOS()
    )
      check = true;
  })(navigator?.userAgent || navigator?.vendor || window?.opera);
  return check;
};

const isArray = (data: any[]) =>
  data && Array.isArray(data) && data.length ? true : false ? true : false;

interface calculatedPositionProps {
  px: number;
  py: number;
  localWidth: number;
  localHeight: number;
  globalWidth: number;
  globalHeight: number;
  extra?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}
const calculatedPosition = (params: calculatedPositionProps) => {
  const {
    px,
    py,
    localWidth,
    localHeight,
    globalWidth,
    globalHeight,
    extra: {top = 0, bottom = 0, left = 0, right = 0} = {},
  } = params;
  //right hand side
  if (px > globalWidth / 2) {
    // if actionmenu overflow - horizontal
    const w = globalWidth - px + 220;
    let minus = 0;
    if (w > globalWidth) {
      minus = w - globalWidth + 10;
    }
    //right bottom
    if (py > globalHeight / 2) {
      return {
        bottom: globalHeight - py + bottom,
        right: globalWidth - px - minus + right,
      };
    }
    //right top
    else {
      return {
        top: py + localHeight + top,
        right: globalWidth - px - minus + right,
      };
    }
  }
  //left hand side
  else {
    // if actionmenu overflow - horizontal
    const w = px + localWidth + 220;
    let minus = 0;
    if (w > globalWidth) {
      minus = w - globalWidth + 10;
    }
    //left bottom
    if (py > globalHeight / 2) {
      return {
        bottom: globalHeight - py + bottom,
        left: px + localWidth - minus + left,
      };
    }
    //left top
    else {
      return {
        top: py + localHeight + top + top,
        left: px + localWidth - minus + left,
      };
    }
  }
};

const BREAKPOINTS = {
  xs: 360,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

const useIsDesktop = () => {
  const {width, height} = useWindowDimensions();
  return (from: 'default' | 'toolbar' | 'popup' = 'default') => {
    if (from === 'default') {
      return width > height + 150 ? true : false;
    } else if (from === 'toolbar') {
      return width > 1224;
    } else if (from === 'popup') {
      return width > 675;
    }
    return width >= BREAKPOINTS.xl;
  };
};
const useIsSmall = () => {
  const {width} = useWindowDimensions();
  return (number = 576) => {
    return width < number;
  };
};

const MOBILE_BREAK_POINT = 360;
const TABLET_BREAK_POINT = 740;
const useResponsive = () => {
  const {width} = useWindowDimensions();
  return (input: number) => {
    if (width < MOBILE_BREAK_POINT) {
      return input / 3;
    } else if (width < TABLET_BREAK_POINT) {
      return input / 2;
    } else {
      return input;
    }
  };
};
export {
  useIsDesktop,
  useIsSmall,
  //BREAKPOINTS,
  useHasBrandLogo,
  isMobileUA,
  isAndroid,
  isIOS,
  isWebInternal,
  isWeb,
  isDesktop,
  shouldAuthenticate,
  isArray,
  isValidReactComponent,
  maxInputLimit,
  trimText,
  calculatedPosition,
  useResponsive,
};
