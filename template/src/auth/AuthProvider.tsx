import React, {
  createContext,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useRef,
} from 'react';
import {useHistory, useLocation} from '../components/Router';
import {gql, useApolloClient} from '@apollo/client';
import {useIDPAuth} from './useIDPAuth';
import Loading from '../subComponents/Loading';
import useTokenAuth from './useTokenAuth';
import Toast from '../../react-native-toast-message';
import {getRequestHeaders, GET_UNAUTH_FLOW_API_ENDPOINT} from './config';
import isSDK from '../utils/isSDK';
import {Linking} from 'react-native';
import {isAndroid, isIOS} from '../utils/common';
import SDKMethodEventsManager from '../utils/SdkMethodEvents';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

const AuthContext = createContext<AuthContextInterface | null>(null);

const AuthProvider = (props: AuthProviderProps) => {
  const [authenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // auth hooks
  const {enableIDPAuth, idpLogout} = useIDPAuth();
  const {enableTokenAuth, tokenLogout} = useTokenAuth();
  // routing
  const history = useHistory();
  const location = useLocation();
  // client
  const apolloClient = useApolloClient();

  const enableAuth = $config.ENABLE_IDP_AUTH || $config.ENABLE_TOKEN_AUTH;

  useEffect(()=>{
    SDKMethodEventsManager.on('login',async(res,rej,token)=>{
      try {
        await AsyncStorage.setItem('SDK_TOKEN', token);
        await enableTokenAuth()
        res()  
      } catch (error) {
        rej('SDK Login failed'+JSON.stringify(error))
      }      
    })
    SDKMethodEventsManager.on('logout',async(res,rej)=>{
      try {
        await tokenLogout()
        res()  
      } catch (error) {
        rej('SDK Logout failed'+JSON.stringify(error))
      }      
    })
  },[])

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
    //fetch user details
    getUserDetails()
      .then((_) => {
        setIsAuthenticated(true);
        //sdk redirect todo check in other platfrom
        history.push(location.pathname);
      })
      .catch((err) => {
        setIsAuthenticated(false);
        authLogin();
        if (!isSDK() && enableAuth) {
          //show session expired notification
          //only on auth enabled and non sdk
          setAuthError('Your session has expird. Kindly login again');
          //todo SDK handle session expire
        }
      });
  }, []);

  const authLogin = () => {
    if (enableAuth) {
      console.log('supriya enable AUTH FLOW');
      // Authenticated login flow
      if ($config.ENABLE_IDP_AUTH && !isSDK()) {
        console.log('supriya enable AUTH IDP');
        enableIDPAuth();
      } else if ($config.ENABLE_TOKEN_AUTH && isSDK()) {
        console.log('supriya enable AUTH SDK');
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
    } else {
      // Unauthenticated login flow
      console.log('supriya enable UNAUTH FLOW');
      fetch(GET_UNAUTH_FLOW_API_ENDPOINT(), {
        credentials: 'include',
      })
        .then((response) => response.json())
        .then((response) => {
          //rsdk,websdk,android,ios
          if (isSDK() || isAndroid() || isIOS()) {
            console.log('supriya enable UNAUTH in SDK');
            if (!response.token) {
              throw new Error('Token not received');
            } else {
              enableTokenAuth(response.token)
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
                  //TODO fallback
                  history.push('/login');
                });
            }
          }
          //web/mweb/desktop
          else {
            if (response && response.Code == 0) {
              setIsAuthenticated(true);
              history.push(location.pathname);
            } else {
              setIsAuthenticated(false);
              //TODO fallback
              history.push('/login');
            }
          }
        })
        .catch((error) => {
          if (error instanceof Error) {
            setAuthError(error.message);
          } else {
            setAuthError(error);
          }
          setIsAuthenticated(false);
          history.push('/login');
        });
    }
  };

  const authLogout = () => {
    console.log('supriya logout user');
    if (enableAuth && $config.ENABLE_IDP_AUTH && !isSDK()) {
      console.log('supriya logout AUTH IDP');
      idpLogout()
        .then((res) => {
          console.log('user successfully logged out');
        })
        .catch(() => {
          console.error('user logout failed');
          setAuthError('user logout failed');
        })
        .finally(() => {
          setIsAuthenticated(false);
          history.push('/login');
        });
    } else {
      console.log('supriya logout AUTH/UNAUTH');
      if (!enableAuth || isSDK()) {
        //no need to logout because we need token to see the create screen
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
            history.push('/login');
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
      }}>
      {loading || (!authenticated && !enableAuth) ? (
        <Loading text={'Loading..'} />
      ) : (
        props.children
      )}
    </AuthContext.Provider>
  );
};
const useAuth = () => React.useContext(AuthContext);

export {AuthProvider, useAuth};
