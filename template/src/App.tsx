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
import Join from './pages/Join';
import VideoCall from './pages/VideoCall';
import Create from './pages/Create';
import {Route, Switch, Redirect} from './components/Router';
import PrivateRoute from './components/PrivateRoute';
import OAuth from './components/OAuth';
import StoreToken from './components/StoreToken';
import {shouldAuthenticate, cmpTypeGuard, isIOS} from './utils/common';
import KeyboardManager from 'react-native-keyboard-manager';
import {useFpe, CustomRoutesInterface, CUSTOM_ROUTES_PREFIX} from 'fpe-api';
import AppWrapper from './AppWrapper';
if (isIOS) {
  KeyboardManager.setEnable(true);
  KeyboardManager.setEnableAutoToolbar(false);
  KeyboardManager.setShouldShowToolbarPlaceholder(false);
  KeyboardManager.setShouldResignOnTouchOutside(true);
}

const App: React.FC = () => {
  const {join: FpeJoinComponent} = useFpe((data) =>
    data?.components ? data.components : {},
  );
  const CustomRoutes = useFpe((data) => data?.customRoutes);
  const RenderCustomRoutes = () => {
    return CustomRoutes?.map((item: CustomRoutesInterface, i: number) => {
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
    });
  };

  return (
    <AppWrapper>
      <Switch>
        {RenderCustomRoutes()}
        <Route exact path={'/'}>
          <Redirect to={'/create'} />
        </Route>
        <Route exact path={'/authenticate'}>
          {shouldAuthenticate ? <OAuth /> : <Redirect to={'/'} />}
        </Route>
        <Route path={'/auth-token/:token'}>
          <StoreToken />
        </Route>
        <Route exact path={'/join'}>
          {cmpTypeGuard(Join, FpeJoinComponent)}
        </Route>
        {shouldAuthenticate ? (
          <PrivateRoute path={'/create'} failureRedirectTo={'/authenticate'}>
            <Create />
          </PrivateRoute>
        ) : (
          <Route path={'/create'}>
            <Create />
          </Route>
        )}
        <Route path={'/:phrase'}>
          <VideoCall />
        </Route>
      </Switch>
    </AppWrapper>
  );
};

export default App;
