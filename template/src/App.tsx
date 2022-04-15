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
import Authenticate from './pages/Authenticate';
import {Router, Route, Switch, Redirect} from './components/Router';
import PrivateRoute from './components/PrivateRoute';
import OAuth from './components/OAuth';
import Navigation from './components/Navigation';
import StoreToken from './components/StoreToken';
import {StorageProvider} from './components/StorageContext';
import GraphQLProvider from './components/GraphQLProvider';
// import JoinPhrase from './components/JoinPhrase';
import {SessionProvider} from './components/SessionContext';
import {ImageBackground, Platform, SafeAreaView, StatusBar} from 'react-native';
import ColorConfigure from './components/ColorConfigure';
import Toast from '../react-native-toast-message';
import ToastConfig from './subComponents/toastConfig';
import {shouldAuthenticate,cmpTypeGuard} from './utils/common';
import KeyboardManager from 'react-native-keyboard-manager';
import DimensionProvider from './components/dimension/DimensionProvider';
import Error from './components/common/Error'
import { ErrorProvider } from './components/common';
import { useFpe, ComponentsInterface, CustomRoutesInterface, CUSTOM_ROUTES_PREFIX, FpeProvider, fpeConfig} from 'fpe-api';
import { LanguageProvider } from './language/useLanguage';

if (Platform.OS === 'ios') {
  KeyboardManager.setEnable(true);
  KeyboardManager.setEnableAutoToolbar(false);
  KeyboardManager.setShouldShowToolbarPlaceholder(false);
  KeyboardManager.setShouldResignOnTouchOutside(true);
}

const App: React.FC = () => {
  const {
    videoCall,
    join,
    create
  } = useFpe(data => data?.components ? data.components : {} as ComponentsInterface);
  const CustomRoutes = useFpe(data => data?.customRoutes);
  const CreateCmp = cmpTypeGuard(Create,create);
  const AppRoot = useFpe(data => data?.appRoot)
  const RootWrapper = AppRoot && typeof AppRoot === 'function' ? AppRoot : React.Fragment;
  return (
    <RootWrapper>
    <ImageBackground
      source={{uri: $config.BG}}
      style={{flex: 1}}
      resizeMode={'cover'}>
      <SafeAreaView style={{flex: 1}}>
        <StatusBar hidden={true} />
        <Toast ref={(ref) => Toast.setRef(ref)} config={ToastConfig} />
        <StorageProvider>
          <GraphQLProvider>
            <Router>
              <SessionProvider>
                <ColorConfigure>
                  <DimensionProvider>
                  <LanguageProvider>
                  <ErrorProvider>
                  <Error />
                  <Navigation />
                  <Switch>
                    {CustomRoutes?.map((e:CustomRoutesInterface, i: number) => {
                      if (e?.privateRoute) {
                        return (
                          <PrivateRoute
                            path={CUSTOM_ROUTES_PREFIX + e.path}
                            exact={e.exact}
                            key={i}
                            failureRedirectTo={e.failureRedirectTo ? e.failureRedirectTo : '/'}
                            {...e.routeProps}                            
                          >
                            <e.component {...e.componentProps} />
                          </PrivateRoute>
                        );
                      } else {
                        return (
                          <Route path={CUSTOM_ROUTES_PREFIX + e.path} exact={e.exact} key={i} {...e.routeProps}>
                            <e.component {...e.componentProps}/>
                          </Route>
                        );
                      }
                    })}
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
                      {cmpTypeGuard(Join,join)}
                    </Route>
                    {shouldAuthenticate ? (
                      <PrivateRoute
                        path={'/create'}
                        failureRedirectTo={'/authenticate'}>
                        {CreateCmp}
                      </PrivateRoute>
                    ) : (
                      <Route path={'/create'}>
                        {CreateCmp}
                      </Route>
                    )}
                    <Route path={'/:phrase'}>
                      {cmpTypeGuard(VideoCall,videoCall)}
                    </Route>
                  </Switch>        
                  </ErrorProvider>  
                  </LanguageProvider>      
                  </DimensionProvider>
                </ColorConfigure>
              </SessionProvider>
            </Router>
          </GraphQLProvider>
        </StorageProvider>
      </SafeAreaView>
    </ImageBackground>
    </RootWrapper>
  );
  // return <div> hello world</div>; {/* isn't join:phrase redundant now, also can we remove joinStore */}
};

const AppWithFpeProvider: React.FC = (props: any) => {
  console.log({propsFpeConfig: props});
  const value = props.fpeConfig || fpeConfig;
  return (
    <FpeProvider value={value}>
      <App />
    </FpeProvider>
  );
};

export default AppWithFpeProvider;
