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
import Join from './pages/Join';
import VideoCall from './pages/VideoCall';
import Create from './pages/Create';
import {Route, Switch, Redirect} from './components/Router';
import AuthRoute from './auth/AuthRoute';
import {IDPAuth} from './auth/IDPAuth';
import {Text} from 'react-native';
import {useCustomization} from 'customization-implementation';
import {CUSTOM_ROUTES_PREFIX, CustomRoutesInterface} from 'customization-api';
import PrivateRoute from './components/PrivateRoute';
import RecordingBotRoute from './components/recording-bot/RecordingBotRoute';
import {useIsRecordingBot} from './subComponents/recording/useIsRecordingBot';
import {LogSource, logger} from './logger/AppBuilderLogger';
import {isValidReactComponent} from './utils/common';

function VideoCallWrapper(props) {
  const {isRecordingBot} = useIsRecordingBot();
  return isRecordingBot ? (
    <RecordingBotRoute history={props.history}>
      <VideoCall />
    </RecordingBotRoute>
  ) : (
    <AuthRoute>
      <VideoCall />
    </AuthRoute>
  );
}

function AppRoutes() {
  const CustomRoutes = useCustomization(data => data?.customRoutes);
  const AppConfig = useCustomization(data => data?.config);
  const {defaultRootFallback: DefaultRootFallback} = AppConfig || {};
  const RenderCustomRoutes = () => {
    try {
      return (
        CustomRoutes &&
        Array.isArray(CustomRoutes) &&
        CustomRoutes.length &&
        CustomRoutes?.map((item: CustomRoutesInterface, i: number) => {
          let RouteComponent = item?.isPrivateRoute ? PrivateRoute : Route;
          return (
            <RouteComponent
              path={CUSTOM_ROUTES_PREFIX + item.path}
              exact={item.exact}
              key={i}
              failureRedirectTo={
                item.failureRedirectTo ? item.failureRedirectTo : '/'
              }
              {...item.routeProps}>
              <item.component {...item.componentProps} />
            </RouteComponent>
          );
        })
      );
    } catch (error) {
      console.error('Error on rendering the custom routes');
      return null;
    }
  };
  return (
    <Switch>
      <Route exact path={'/'}>
        {DefaultRootFallback &&
        (typeof DefaultRootFallback === 'object' ||
          typeof DefaultRootFallback === 'function') &&
        isValidReactComponent(DefaultRootFallback) ? (
          <DefaultRootFallback />
        ) : (
          <Redirect to={'/create'} />
        )}
      </Route>
      <Route exact path={'/authorize/:token?'}>
        <IDPAuth />
      </Route>
      <AuthRoute exact path={'/join'}>
        <Join />
      </AuthRoute>
      <AuthRoute exact path={'/create'}>
        <Create />
      </AuthRoute>
      {RenderCustomRoutes()}
      <Route exact path={'/:phrase'} component={VideoCallWrapper} />
      <Route path="*">
        <Text>Page not found</Text>
      </Route>
    </Switch>
  );
}
export default AppRoutes;
