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
import { Redirect } from './components/Router';
import OAuth from './components/OAuth';
import Join from './pages/Join';
import VideoCall from './pages/VideoCall';
import Create from './pages/Create';
import StoreToken from './components/StoreToken';
import shouldAuthenticate from './utils/shouldAuthenticate';
import { ROUTE_KEY } from 'fpe-api';

type routeObject = {
  path: string,
  exact?: boolean,
  component: any,
  componentProps?: any,
  privateRoute?: boolean,
  routeProps?: any
}[];

const DEFAULT_ROUTES: routeObject = [
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
    component: Join,
  },
  {
    path: ROUTE_KEY.CREATE,
    privateRoute: shouldAuthenticate,
    component: Create,
    routeProps: {
      failureRedirectTo: ROUTE_KEY.AUTHENTICATE
    }
  },
  {
    path: ROUTE_KEY.PHRASE,
    component: VideoCall,
  },
];


export {
  DEFAULT_ROUTES
}