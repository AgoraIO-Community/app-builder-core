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
    getUserDetails()
      .then((_) => {
        setIsAuthenticated(true);
        history.push(location.pathname);
      })
      .catch((err) => {
        setAuthError('Your session has expird. Kindly login again');
        setIsAuthenticated(false);
        history.push(`/login`);
      });
  }, []);

  const authLogin = () => {
    if (enableAuth) {
      console.log('supriya enable AUTH');
      // Authenticated login flow
      if ($config.ENABLE_IDP_AUTH && !isSDK()) {
        console.log('supriya enable IDP');
        enableIDPAuth();
      } else if ($config.ENABLE_TOKEN_AUTH && isSDK()) {
        console.log('supriya enable SDK');
        enableTokenAuth()
          .then((res) => {
            setIsAuthenticated(true);
            history.push('/create');
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
    } else {
      // Unauthenticated login flow
      fetch(GET_UNAUTH_FLOW_API_ENDPOINT(), {
        credentials: 'include',
      })
        .then((response) => response.json())
        .then((response) => {
          if (response && response.Code == 0) {
            setIsAuthenticated(true);
            history.push('/create');
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
    if (enableAuth) {
      if ($config.ENABLE_IDP_AUTH) {
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
      } else if ($config.ENABLE_TOKEN_AUTH) {
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
    } else {
      setIsAuthenticated(false);
      history.push('/login');
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
      {loading ? <Loading text={'Loading..'} /> : props.children}
    </AuthContext.Provider>
  );
};
const useAuth = () => React.useContext(AuthContext);

export {AuthProvider, useAuth};
