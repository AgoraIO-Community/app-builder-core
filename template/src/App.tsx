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
import {Router, Route, Switch} from './components/Router';
import PrivateRoute from './components/PrivateRoute';
import Navigation from './components/Navigation';
import {StorageProvider} from './components/StorageContext';
import GraphQLProvider from './components/GraphQLProvider';
// import JoinPhrase from './components/JoinPhrase';
import {SessionProvider} from './components/SessionContext';
import {ImageBackground, Platform, SafeAreaView, StatusBar} from 'react-native';
import ColorConfigure from './components/ColorConfigure';
import Toast from '../react-native-toast-message';
import ToastConfig from './subComponents/toastConfig';
import KeyboardManager from 'react-native-keyboard-manager';
import DimensionProvider from './components/dimension/DimensionProvider';
import {installPlugin} from 'test-fpe'
import {DEFAULT_ROUTES} from './defaultRoutes'

if (Platform.OS === 'ios') {
  KeyboardManager.setEnable(true);
  KeyboardManager.setEnableAutoToolbar(false);
  KeyboardManager.setShouldShowToolbarPlaceholder(false);
  KeyboardManager.setShouldResignOnTouchOutside(true);
}

const App: React.FC = () => {
  useEffect(( ) => {
    installPlugin()
  },[])
  return (
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
                  <Navigation />
                  <Switch>
                  {DEFAULT_ROUTES.map((e, i) => {
                      if (e?.privateRoute) {
                        return (
                          <PrivateRoute
                            path={e.path}
                            key={i}
                            {...e.routeProps}
                          >
                            <e.component {...e.componentProps} />
                          </PrivateRoute>
                        );
                      } else {
                        return (
                          <Route path={e.path} exact={e.exact} key={i} {...e.routeProps}>
                            <e.component {...e.componentProps}/>
                          </Route>
                        );
                      }
                    })}
                  </Switch>
                  </DimensionProvider>
                </ColorConfigure>
              </SessionProvider>
            </Router>
          </GraphQLProvider>
        </StorageProvider>
      </SafeAreaView>
    </ImageBackground>
  );
  // return <div> hello world</div>; {/* isn't join:phrase redundant now, also can we remove joinStore */}
};
export default App;
