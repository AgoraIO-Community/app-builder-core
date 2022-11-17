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
import React, {useEffect} from 'react';
import {Route, Redirect} from '../components/Router';
import Toast from '../../react-native-toast-message';

import type {RouteProps} from 'react-router';
import {useAuth} from './AuthProvider';

interface PrivateRouteProps extends RouteProps {
  children: React.ReactNode;
}

const AuthRoute: React.FC<PrivateRouteProps> = (props) => {
  const {authenticated} = useAuth();
  console.log('supriya authenticated: ', authenticated);

  useEffect(() => {
    if (authenticated) return;
    Toast.show({
      type: 'error',
      text1: 'Authentication failed',
      visibilityTime: 1000,
    });
  }, [authenticated]);

  return authenticated ? (
    <Route {...props}>{props.children}</Route>
  ) : (
    <Redirect to="/login" />
  );
};

export default AuthRoute;
