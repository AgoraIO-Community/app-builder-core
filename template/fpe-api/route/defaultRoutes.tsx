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
import { Redirect } from '../../src/components/Router';
import OAuth from '../../src/components/OAuth';
import StoreToken from '../../src/components/StoreToken';
import {shouldAuthenticate} from '../../src/utils/common';
import ROUTE_KEY from './keys'
import { getFpeCmpConfig } from '../index';

export type CustomRoutesInterface = {
  path: string;
  component: any;
  exact?: boolean;  
  componentProps?: any;
  privateRoute?: boolean;
  routeProps?: any;
};

const getDefaultRoutes = ():CustomRoutesInterface[] => {
  const { createMeetingScreen, joinMeetingScreen, videoCallScreen} =  getFpeCmpConfig()
  const DEFAULT_ROUTES: CustomRoutesInterface[] = [
    {
      path: ROUTE_KEY.ROOT,
      exact: true,
      component: Redirect,
      componentProps: {
        to: ROUTE_KEY.CREATE
      }
    },
    {
      path: ROUTE_KEY.AUTHENTICATE,
      exact: true,
      component: shouldAuthenticate ? OAuth : Redirect,
      componentProps: shouldAuthenticate ? {} : {
        to: ROUTE_KEY.CREATE
      }
    },
    {
      path: ROUTE_KEY.AUTH_TOKEN + ROUTE_KEY.TOKEN,
      component: StoreToken,
    },
    {
      path: ROUTE_KEY.JOIN,
      exact: true,
      component: joinMeetingScreen,
    },
    {
      path: ROUTE_KEY.CREATE,
      privateRoute: shouldAuthenticate,
      component: createMeetingScreen,
      routeProps: {
        failureRedirectTo: ROUTE_KEY.AUTHENTICATE
      }
    },
    {
      path: ROUTE_KEY.PHRASE,
      component: videoCallScreen,
    },
  ];
  return DEFAULT_ROUTES
}
export {
  getDefaultRoutes
}