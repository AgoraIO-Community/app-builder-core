import React, {
  createContext,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useContext,
} from 'react';
import {useHistory, useLocation} from '../components/Router';
import {gql, useApolloClient} from '@apollo/client';
import {useIDPAuth} from './useIDPAuth';
import Loading from '../subComponents/Loading';
import useTokenAuth from './useTokenAuth';
import Toast from '../../react-native-toast-message';
import {ENABLE_AUTH, GET_UNAUTH_FLOW_API_ENDPOINT} from './config';
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

const GET_USER = gql`
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
    console.log('debugging Deep-linking url: ', link);

    if (link !== null) {
      //deeplinking handling with authentication enabled
      if ($config.ENABLE_IDP_AUTH) {
        const url = processDeepLinkURI(link);
        console.log('debugging Deep-linking processed url', url);
        try {
          if (url?.indexOf('authorize') !== -1) {
            const token = getParamFromURL(url, 'token');
            if (token) {
              console.log('debugging deep-linking got token');
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
                  console.log('debugging error on IDP token setting');
                });
            } else {
              console.log('debugging deep-linking token is empty');
              history.push('/');
            }
          } else if (url?.indexOf('authorize') === -1) {
            console.log('debugging deep-linking setting return to');
            setReturnTo(url);
          } else {
            history.push(url);
          }
        } catch (error) {
          console.log('debugging deep-linking error catch');
          history.push('/');
        }
      } else {
        //deeplinking handling with authentication enabled
        console.log('debugging path', processDeepLinkURI(link));
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
        console.log('debugging getting initialUrl', initialUrl);
        Linking.addEventListener('url', (e) => {
          console.log('debugging url from listener', e.url);
          deepLinkUrl(e.url);
        });
        deepLinkUrl(initialUrl);
      };
      deepLink();
    }
  }, [history]);

  useEffect(() => {
    if (isSDK()) {
      SDKMethodEventsManager.on('login', async (res, rej, token) => {
        try {
          setStore((prevState) => {
            return {...prevState, token};
          });
          setTimeout(async () => {
            await enableTokenAuth(token);
            res();
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
  }, []);

  useEffect(() => {
    if (!authenticated && authError) {
      Toast.show({
        type: 'error',
        text1: authError,
        visibilityTime: 3000,
      });
    }
  }, [authenticated, authError]);

  async function getUserDetails() {
    try {
      await apolloClient.query({
        query: GET_USER,
        fetchPolicy: 'network-only',
      });
    } catch (error) {
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    //if application in authorization state then don't call authlogin
    if (
      //to check authoriztion
      location?.pathname?.indexOf('authorize') === -1 &&
      //to check login link expiry
      location?.search?.indexOf('msg') === -1
    ) {
      //fetch user details
      getUserDetails()
        .then((_) => {
          setIsAuthenticated(true);
          if (isSDK()) {
            history.push(location.pathname);
          }
        })
        .catch(() => {
          setIsAuthenticated(false);
          authLogin();
        });
    } else {
      if (location?.search?.indexOf('msg') !== -1) {
        //manage backend login failed. show error message and redirect to login again
        Toast.show({
          type: 'error',
          text1: 'Login session expired, Please login again.',
          visibilityTime: 3000,
        });
        setTimeout(() => {
          authLogin();
        }, 3000);
      } else {
        //it will render the children
        setLoading(false);
      }
    }
  }, []);

  const authLogin = () => {
    // Authenticated login flow
    if (ENABLE_AUTH) {
      //AUTH -> IDP -> NATIVE and WEB and DESKTOP
      if ($config.ENABLE_IDP_AUTH && !isSDK()) {
        //it will open external web link and post authentication it will redirect to application
        //@ts-ignore
        enableIDPAuth(
          isWeb()
            ? location.pathname
            : isDesktop()
            ? history
            : isIOS() || isAndroid()
            ? deepLinkUrl
            : '',
        );
      }
      //AUTH -> IDP -> SDK ONLY
      else if ($config.ENABLE_TOKEN_AUTH && isSDK()) {
        enableTokenAuth()
          .then((res) => {
            setIsAuthenticated(true);
            history.push('/create');
          })
          .catch((error) => {
            //don't show token expire/not found toast in the sdk
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
            //sdk there is no fallback page
            history.push('/create');
          });
      }
    }
    // Unauthenticated login flow
    else {
      fetch(GET_UNAUTH_FLOW_API_ENDPOINT(), {
        credentials: 'include',
      })
        .then((response) => response.json())
        .then((response) => {
          // unauthenticated flow all platform we will have to handle the token manually
          // we need to store token manually
          if (!response.token) {
            throw new Error('Token not received');
          } else {
            enableTokenAuth(response.token)
              .then(() => {
                console.log('debugging token auth enabled');
                //set auth enabled on useEffect
              })
              .catch((error) => {
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
        .catch((error) => {
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
      idpLogout()
        .then((res) => {
          console.log('user successfully logged out');
          setIsAuthenticated(false);
        })
        .catch(() => {
          console.error('user logout failed');
          setAuthError('user logout failed');
        });
    } else {
      if (!ENABLE_AUTH || isSDK()) {
        //no need to logout because we need token to see the create screen
        //unauth flow no logout
        //sdk with auth flow will use sdk api for logout
        history.push('/create');
      } else {
        tokenLogout()
          .then((res) => {
            console.log('user successfully logged out');
          })
          .catch(() => {
            console.error('user logout failed');
            setAuthError('user logout failed');
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
      {(!authenticated && !ENABLE_AUTH) || (ENABLE_AUTH && loading) ? (
        <Loading text={'Loading...'} />
      ) : (
        props.children
      )}
    </AuthContext.Provider>
  );
};
const useAuth = () => React.useContext(AuthContext);

export {AuthProvider, useAuth};
