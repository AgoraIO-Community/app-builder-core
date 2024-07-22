import React, {
  createContext,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useContext,
  useRef,
} from 'react';
import {useHistory, useLocation} from '../components/Router';
import {gql, useApolloClient} from '@apollo/client';
import {useIDPAuth} from './useIDPAuth';
import Loading from '../subComponents/Loading';
import useTokenAuth from './useTokenAuth';
import Toast from '../../react-native-toast-message';
import {
  ENABLE_AUTH,
  getPlatformId,
  GET_UNAUTH_FLOW_API_ENDPOINT,
} from './config';
import isSDK from '../utils/isSDK';
import {Linking} from 'react-native';
import {
  isAndroid,
  isIOS,
  isWeb,
  isDesktop,
  processDeepLinkURI,
  getParamFromURL,
} from '../utils/common';
import SDKMethodEventsManager from '../utils/SdkMethodEvents';
import StorageContext from '../components/StorageContext';
import UserCancelPopup from './UserCancelPopup';
import {exitApp} from './openIDPURL';
import {useString} from '../utils/useString';
import {
  authSessionTimeoutToastHeading,
  loadingText,
} from '../language/default-labels/commonLabels';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import getUniqueID from '../utils/getUniqueID';
import {useIsRecordingBot} from '../subComponents/recording/useIsRecordingBot';

export const GET_USER = gql`
  query getUser {
    getUser {
      name
      email
    }
  }
`;

type AuthProviderProps = {
  enableAuth?: boolean;
  children: React.ReactNode;
};

interface AuthContextInterface {
  authenticated: boolean;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  authLogin: () => void;
  authLogout: () => void;
  returnTo: string;
}

const AuthContext = createContext<AuthContextInterface | null>(null);

const AuthProvider = (props: AuthProviderProps) => {
  const loadingLabel = useString(loadingText)();
  const timeoutHeading = useString(authSessionTimeoutToastHeading)();
  const regEvent = useRef(true);
  const refreshTimeoutWeb = useRef(null);
  const [showNativePopup, setShowNativePopup] = useState(false);
  const {setStore, store} = useContext(StorageContext);
  const [authenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [returnTo, setReturnTo] = useState('');
  // auth hooks
  const {enableIDPAuth, idpLogout} = useIDPAuth();
  const {enableTokenAuth, tokenLogout} = useTokenAuth();
  // routing
  const history = useHistory();
  const location = useLocation();
  // client
  const apolloClient = useApolloClient();
  const {isRecordingBot} = useIsRecordingBot();
  const indexesOf = (arr, item) =>
    arr.reduce((acc, v, i) => (v === item && acc.push(i), acc), []);
  const nonprodenv = ['dev', 'staging', 'preprod', 'test'];
  const timeout = indexesOf(nonprodenv, $config.BACKEND_ENDPOINT)
    ? 240600
    : 3540600;

  //not needed since cookies authentication removed
  const tokenRefreshWeb = () => {
    //cookie token expiry in staging - 5min and production - 1hr
    //since we can't read the cookies and its expiry details in the frontend
    //manully calling refresh before 59 sec
    //NOTE - IMP - if we call the refresh before or after 59 sec it won't work
    //staging - 4min 1 sec
    //production - 59min 1 sec
    // if (authenticated && $config.ENABLE_IDP_AUTH && isWeb()) {
    //   refreshTimeoutWeb.current = setTimeout(() => {
    //     fetch(`${$config.BACKEND_ENDPOINT}/v1/token/refresh`, {
    //       method: 'POST',
    //       credentials: 'include',
    //       headers: {
    //         'X-Platform-ID': getPlatformId(),
    //       },
    //     })
    //       .then((data) => {
    //         clearTimeout(refreshTimeoutWeb.current);
    //         tokenRefreshWeb();
    //       })
    //       .catch((error) => {
    //       });
    //   }, timeout);
    // } else if (!authenticated && $config.ENABLE_IDP_AUTH && isWeb()) {
    //   //not authenticated
    //   if (refreshTimeoutWeb.current) {
    //     clearTimeout(refreshTimeoutWeb.current);
    //   } else {
    //   }
    // }
  };

  // useEffect(() => {
  //   tokenRefreshWeb();
  // }, [authenticated]);

  useEffect(() => {
    if (!ENABLE_AUTH && !authenticated && store.token) {
      setIsAuthenticated(true);
      if (isAndroid() || isIOS()) {
        if (returnTo) {
          history.push(returnTo);
        }
      }
    }
  }, [store?.token]);

  const deepLinkUrl = (link: string | null) => {
    if (link !== null) {
      //deeplinking handling with authentication enabled
      if ($config.ENABLE_IDP_AUTH) {
        const url = processDeepLinkURI(link);
        try {
          //login link expiry fix
          if (url?.indexOf('msg') !== -1) {
            //adding time delay to open in app browser
            Toast.show({
              leadingIconName: 'alert',
              type: 'error',
              text1: timeoutHeading,
              visibilityTime: 3000,
            });
            setTimeout(() => {
              authLogin();
            }, 3000);
          } else if (url?.indexOf('authorize') !== -1) {
            const token = getParamFromURL(url, 'token');
            if (token) {
              enableTokenAuth(token)
                .then(() => {
                  setIsAuthenticated(true);
                  if (returnTo) {
                    history.push(returnTo);
                  } else {
                    history.push('/');
                  }
                })
                .catch(() => {
                  setIsAuthenticated(false);
                  logger.error(
                    LogSource.Internals,
                    'AUTH',
                    'error on IDP token setting',
                  );
                });
            } else {
              logger.error(
                LogSource.Internals,
                'AUTH',
                'deep-linking token is empty',
              );
              history.push('/');
            }
          } else if (url?.indexOf('authorize') === -1) {
            logger.error(
              LogSource.Internals,
              'AUTH',
              `deep-linking setting return to - ${url}`,
            );
            setReturnTo(url);
          } else {
            history.push(url);
          }
        } catch (error) {
          logger.error(
            LogSource.Internals,
            'AUTH',
            'deep-linking error catch',
            error,
          );
          history.push('/');
        }
      } else {
        //deeplinking handling with authentication enabled
        const url = processDeepLinkURI(link);
        setReturnTo(url);
      }
    }
  };

  useEffect(() => {
    //handling the deeplink for native
    if (isIOS() || isAndroid()) {
      const deepLink = async () => {
        const initialUrl = await Linking.getInitialURL();
        Linking.addEventListener('url', e => {
          deepLinkUrl(e.url);
        });
        deepLinkUrl(initialUrl);
      };
      deepLink();
    }
  }, [history]);

  useEffect(() => {
    if (isSDK() && regEvent.current) {
      regEvent.current = false;
      SDKMethodEventsManager.on('login', async (res, rej, token) => {
        try {
          setStore(prevState => {
            return {...prevState, token};
          });
          setTimeout(async () => {
            enableTokenAuth(token)
              .then(() => {
                res();
              })
              .catch(error => {
                rej('SDK Login failed' + JSON.stringify(error));
              });
          });
        } catch (error) {
          rej('SDK Login failed' + JSON.stringify(error));
        }
      });
      SDKMethodEventsManager.on('logout', async (res, rej) => {
        try {
          await tokenLogout();
          res();
        } catch (error) {
          rej('SDK Logout failed' + JSON.stringify(error));
        }
      });
    }

    if (!isSDK() && $config.ENABLE_TOKEN_AUTH) {
      Toast.show({
        leadingIconName: 'alert',
        type: 'error',
        text1: 'Token Server Authentication only supports SDK integration',
        text2: 'Please use Auth0 Authentication.',
        visibilityTime: 1000 * 60,
      });
    }
    if (isSDK() && $config.ENABLE_IDP_AUTH) {
      Toast.show({
        leadingIconName: 'alert',
        type: 'error',
        text1: 'Auth0 Authentication does not support SDK integration',
        text2: 'Please use Token Server Authentication.',
        visibilityTime: 1000 * 60,
      });
    }
  }, []);

  useEffect(() => {
    if (!authenticated && authError) {
      Toast.show({
        leadingIconName: 'alert',
        type: 'error',
        text1: authError,
        visibilityTime: 3000,
      });
    }
  }, [authenticated, authError]);

  async function getUserDetails() {
    const requestId = getUniqueID();
    const startReqTs = Date.now();
    try {
      //fetch user details
      logger.log(
        LogSource.NetworkRest,
        'user_details',
        'API fetching user_details, to check if user is authenticated',
        {
          requestId,
          startReqTs,
        },
      );
      const res = await apolloClient.query({
        query: GET_USER,
        fetchPolicy: 'network-only',
        context: {
          headers: {
            'X-Request-Id': requestId,
          },
        },
      });
      const endRequestTs = Date.now();
      logger.log(
        LogSource.NetworkRest,
        'user_details',
        'API user_details query succesful. User is authenticated',
        {
          responseData: res,
          startReqTs,
          endRequestTs,
          latency: endRequestTs - startReqTs,
          requestId,
        },
      );
    } catch (error) {
      const endRequestTs = Date.now();
      logger.log(
        LogSource.NetworkRest,
        'user_details',
        'API user details query failed. User is un-authenticated. Will Login in the user',
        {
          error,
          startReqTs,
          endRequestTs,
          latency: endRequestTs - startReqTs,
          requestId,
        },
      );
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Ignore if on sdk since IDP flow is not supported
    // For unauthenticated flow authLogin should be called to get the token
    logger.log(LogSource.Internals, 'AUTH', 'App loaded');
    if (isRecordingBot) {
      logger.debug(
        LogSource.Internals,
        'AUTH',
        'skip app authentication as it is a bot',
      );
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }
    if (isSDK() && ENABLE_AUTH) {
      setIsAuthenticated(true);
      setLoading(false);
      return () => {};
    }
    //if application in authorization state then don't call authlogin
    logger.log(
      LogSource.Internals,
      'AUTH',
      'check if application is in authorized state ?',
    );
    if (
      //to check authoriztion
      location?.pathname?.indexOf('authorize') === -1 &&
      //to check login link expiry
      //login link expiry fix
      location?.search?.indexOf('msg') === -1
    ) {
      getUserDetails()
        .then(_ => {
          //Each time user refresh the page we have to redirect the user to IDP login.then only we can able to refresh the token
          //because we can't read the cookie so we don't know expirytime.
          //so each time page refresh will get new token
          //then only
          if (isWeb() && $config.ENABLE_IDP_AUTH) {
            //authLogin();this is for cookie based authentication
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(true);
          }
        })
        .catch(() => {
          setIsAuthenticated(false);
          authLogin();
        });
    } else {
      if (location?.search?.indexOf('msg') !== -1) {
        Toast.show({
          leadingIconName: 'alert',
          type: 'error',
          text1: timeoutHeading,
          visibilityTime: 3000,
        });
        setTimeout(() => {
          authLogin();
        }, 3000);
        //new code
        //authLogin();
      } else {
        //it will render the children
        setLoading(false);
      }
    }
  }, [isRecordingBot]);

  const authLogin = () => {
    // Authenticated login flow
    logger.log(LogSource.Internals, 'AUTH', 'Trying to authenticate the user');
    if (ENABLE_AUTH) {
      //AUTH -> IDP -> NATIVE and WEB and DESKTOP
      if ($config.ENABLE_IDP_AUTH && !isSDK()) {
        //it will open external web link and post authentication it will redirect to application
        //@ts-ignore
        logger.log(LogSource.Internals, 'AUTH', 'IDP auth enabled');
        logger.log(
          LogSource.NetworkRest,
          'idp_login',
          'API idp_login Trying to authenticate user',
        );
        enableIDPAuth(
          isWeb()
            ? location.pathname
            : isDesktop()
            ? history
            : isIOS() || isAndroid()
            ? deepLinkUrl
            : '',
          timeoutHeading,
        )?.then((response: any) => {
          logger.log(
            LogSource.NetworkRest,
            'idp_login',
            'API idp_login authentication successful',
            response,
          );
          if (isAndroid() || isIOS()) {
            if (response && response?.showNativePopup) {
              setShowNativePopup(true);
            } else {
              setShowNativePopup(false);
            }
          }
        });
      }
      //AUTH -> IDP -> SDK ONLY
      else if ($config.ENABLE_TOKEN_AUTH && isSDK()) {
        logger.log(LogSource.Internals, 'AUTH', 'Token auth enabled');
        logger.log(
          LogSource.NetworkRest,
          'token_login',
          'API token_login Trying to authenticate user',
        );
        enableTokenAuth()
          .then(res => {
            logger.log(
              LogSource.NetworkRest,
              'token_login',
              'API token_login User Authenticated successfully',
              res,
            );
            setIsAuthenticated(true);
            history.push('/create');
          })
          .catch(error => {
            //don't show token expire/not found toast in the sdk
            //we have event emitter to inform the customer application
            //they have to listen for those events
            logger.error(
              LogSource.NetworkRest,
              'token_login',
              'API token_login failed. There was an error',
              error,
            );
            if (!isSDK()) {
              if (error instanceof Error) {
                setAuthError(error.message);
              } else {
                setAuthError(error);
              }
            }
            setIsAuthenticated(false);
            //sdk there is no fallback page
            history.push('/create');
          });
      }
    }
    // Unauthenticated login flow
    else {
      logger.log(
        LogSource.Internals,
        'AUTH',
        'Project has No auth(token or idp) enabled',
      );
      const requestId = getUniqueID();
      const startReqTs = Date.now();
      logger.log(
        LogSource.NetworkRest,
        'unauth_login',
        'API unauth_login Trying to authenticate user',
        {requestId: requestId, startReqTs},
      );

      fetch(GET_UNAUTH_FLOW_API_ENDPOINT(), {
        credentials: 'include',
        headers: {
          'X-Request-Id': requestId,
        },
      })
        .then(response => response.json())
        .then(response => {
          const endReqTs = Date.now();
          const latency = endReqTs - startReqTs;
          // unauthenticated flow all platform we will have to handle the token manually
          // we need to store token manually
          logger.log(
            LogSource.NetworkRest,
            'unauth_login',
            'API unauth_login authentication successful. User is logged in.',
            {
              responseData: response,
              token: response.token,
              startReqTs,
              endReqTs,
              latency,
              requestId,
            },
          );
          if (!response.token) {
            logger.error(
              LogSource.NetworkRest,
              'unauth_login',
              'API unauth_login failed. There was an error',
              new Error('Token not received'),
              {
                requestId,
                startReqTs,
                endReqTs,
                latency,
              },
            );
            throw new Error('Token not received');
          } else {
            enableTokenAuth(response.token)
              .then(() => {
                //set auth enabled on useEffect
              })
              .catch(error => {
                //we don't need to show token expire/not found toast in the sdk
                //we have event emitter to inform the customer application
                //they have to listen for those events
                if (!isSDK()) {
                  if (error instanceof Error) {
                    setAuthError(error.message);
                  } else {
                    setAuthError(error);
                  }
                }
                setIsAuthenticated(false);
              });
          }
        })
        .catch(error => {
          const endReqTs = Date.now();
          const latency = endReqTs - startReqTs;
          logger.error(
            LogSource.NetworkRest,
            'unauth_login',
            'API unauth_login failed. There was an error',
            error,
            {
              requestId,
              startReqTs,
              endReqTs,
              latency,
            },
          );
          if (error instanceof Error) {
            setAuthError(error.message);
          } else {
            setAuthError(error);
          }
          setIsAuthenticated(false);
        });
    }
  };

  const authLogout = () => {
    if (ENABLE_AUTH && $config.ENABLE_IDP_AUTH && !isSDK()) {
      logger.log(LogSource.Internals, 'AUTH', 'Request to log out');
      logger.log(
        LogSource.NetworkRest,
        'idp_logout',
        'API idp_logout Trying to log out IDP authenticated user',
      );
      idpLogout(isAndroid() || isIOS() ? setShowNativePopup : {})
        .then(res => {
          logger.log(
            LogSource.NetworkRest,
            'idp_logout',
            'API idp_logout User logged out successfully',
            res,
          );
          setIsAuthenticated(false);
        })
        .catch(error => {
          setIsAuthenticated(false);
          logger.error(
            LogSource.NetworkRest,
            'idp_logout',
            'API idp_logout failed. There was an error',
            error,
          );
          console.error('user logout failed');
          setAuthError('Error occured on Logout, please try again.');
          setTimeout(() => {
            authLogin();
          }, 3000);
        });
    } else {
      if (!ENABLE_AUTH || isSDK()) {
        //no need to logout because we need token to see the create screen
        //unauth flow no logout
        //sdk with auth flow will use sdk api for logout
        history.push('/create');
      } else {
        logger.log(LogSource.Internals, 'AUTH', 'Request to log out');
        logger.log(
          LogSource.NetworkRest,
          'token_logout',
          'API token_logout Trying to log out token authenticated user',
        );
        tokenLogout()
          .then(res => {
            logger.log(
              LogSource.NetworkRest,
              'token_logout',
              'API token_logout. Logged out user successfully',
            );
          })
          .catch(error => {
            console.error('user logout failed');
            logger.error(
              LogSource.NetworkRest,
              'token_logout',
              'API token_logout failed. There was an error',
              error,
            );
            setAuthError('Error occured on Logout, please try again.');
          })
          .finally(() => {
            setIsAuthenticated(false);
          });
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        setIsAuthenticated,
        authenticated,
        authLogin,
        authLogout,
        returnTo,
      }}>
      {showNativePopup ? (
        <UserCancelPopup
          login={() => {
            setShowNativePopup(false);
            authLogin();
          }}
          exitApp={() => {
            setShowNativePopup(false);
            exitApp();
          }}
          modalVisible={showNativePopup}
          setModalVisible={setShowNativePopup}
        />
      ) : (
        <></>
      )}
      {(!authenticated && !ENABLE_AUTH) || (ENABLE_AUTH && loading) ? (
        <Loading text={loadingLabel} />
      ) : (
        props.children
      )}
    </AuthContext.Provider>
  );
};
const useAuth = () => React.useContext(AuthContext);

export {AuthProvider, useAuth};
