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
import React, {useState} from 'react';
import {Platform} from 'react-native';
import Join from './pages/Join';
import VideoCall from './pages/VideoCall';
import Create from './pages/Create';
import {Route, Switch, Redirect} from './components/Router';
import PrivateRoute from './components/PrivateRoute';
import OAuth from './components/OAuth';
import StoreToken from './components/StoreToken';
import {shouldAuthenticate} from './utils/common';
import KeyboardManager from 'react-native-keyboard-manager';
// commented for v1 release
//import {CustomRoutesInterface, CUSTOM_ROUTES_PREFIX} from 'customization-api';
//import {useCustomization} from 'customization-implementation';
import AppWrapper from './AppWrapper';
import {
  MeetingInfoContextInterface,
  MeetingInfoDefaultValue,
  MeetingInfoProvider,
} from './components/meeting-info/useMeetingInfo';
import {SetMeetingInfoProvider} from './components/meeting-info/useSetMeetingInfo';
import {ShareLinkProvider} from './components/useShareLink';

//hook can't be used in the outside react function calls. so directly checking the platform.
if (Platform.OS === 'ios') {
  KeyboardManager.setEnable(true);
  KeyboardManager.setEnableAutoToolbar(false);
  KeyboardManager.setShouldShowToolbarPlaceholder(false);
  KeyboardManager.setShouldResignOnTouchOutside(true);
}

//Extending the UI Kit Type defintion to add custom attribute to render interface
declare module 'agora-rn-uikit' {
  interface DefaultRenderInterface {
    name: string;
    screenUid: number;
    offline: boolean;
  }
  interface RtcPropsInterface {
    screenShareUid: number;
    screenShareToken?: string;
  }
}

const App: React.FC = () => {
  //commented for v1 release
  //const CustomRoutes = useCustomization((data) => data?.customRoutes);
  // const RenderCustomRoutes = () => {
  //   try {
  //     return (
  //       CustomRoutes &&
  //       Array.isArray(CustomRoutes) &&
  //       CustomRoutes.length &&
  //       CustomRoutes?.map((item: CustomRoutesInterface, i: number) => {
  //         let RouteComponent = item?.isPrivateRoute ? PrivateRoute : Route;
  //         return (
  //           <RouteComponent
  //             path={CUSTOM_ROUTES_PREFIX + item.path}
  //             exact={item.exact}
  //             key={i}
  //             failureRedirectTo={
  //               item.failureRedirectTo ? item.failureRedirectTo : '/'
  //             }
  //             {...item.routeProps}>
  //             <item.component {...item.componentProps} />
  //           </RouteComponent>
  //         );
  //       })
  //     );
  //   } catch (error) {
  //     console.error('Error on rendering the custom routes');
  //     return null;
  //   }
  // };
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfoContextInterface>(
    MeetingInfoDefaultValue,
  );

  return (
    <AppWrapper>
      <SetMeetingInfoProvider value={{setMeetingInfo}}>
        <MeetingInfoProvider value={{...meetingInfo}}>
          <ShareLinkProvider>
            <Switch>
              {/* commented for v1 release */}
              {/* {RenderCustomRoutes()} */}
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
                <Join />
              </Route>
              {shouldAuthenticate ? (
                <PrivateRoute
                  path={'/create'}
                  failureRedirectTo={'/authenticate'}>
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
          </ShareLinkProvider>
        </MeetingInfoProvider>
      </SetMeetingInfoProvider>
    </AppWrapper>
  );
};

export default App;
