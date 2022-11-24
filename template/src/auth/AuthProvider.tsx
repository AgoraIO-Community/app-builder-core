import React, {
  createContext,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react';
import {useHistory} from '../components/Router';
import {gql, useApolloClient} from '@apollo/client';
import AsyncStorage from '@react-native-community/async-storage';
import {useAuthRedirect} from './useAuthRedirect';
import {Linking} from 'react-native';
import Loading from '../subComponents/Loading';

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
  const {idpAuthURL} = useAuthRedirect();
  const [loading, setLoading] = useState(true);

  const apolloClient = useApolloClient();

  const enableAuth = $config.ENABLE_IDP_AUTH || $config.ENABLE_TOKEN_AUTH;
  const history = useHistory();

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

  const enableTokenAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('SDK_TOKEN');
      if (token) {
        history.push(`/authorize/${token}`);
      } else {
        setIsAuthenticated(false);
        history.push(`/login`);
        throw Error('Token not found');
      }
    } catch (error) {
      console.log('token auth failed: ', error);
    }
  };
  useEffect(() => {
    try {
      getUserDetails()
        .then((_) => {
          setIsAuthenticated(true);
          history.push(`/create`);
        })
        .catch((err) => {
          history.push(`/login`);
        });
    } catch (error) {
      history.push(`/login`);
    }
  }, []);

  const authLogin = () => {
    if (enableAuth) {
      if ($config.ENABLE_IDP_AUTH) {
        Linking.openURL(idpAuthURL);
      } else if ($config.ENABLE_TOKEN_AUTH) {
        enableTokenAuth();
      }
    }
  };

  const authLogout = () => {
    if (enableAuth) {
      if ($config.ENABLE_IDP_AUTH) {
        fetch(`${$config.BACKEND_ENDPOINT}/logout`, {
          credentials: 'include',
        })
          .then((response) => response.json())
          .then((_) => {
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
      value={{setIsAuthenticated, authenticated, authLogin, authLogout}}>
      {loading ? <Loading text={'Loading..'} /> : props.children}
    </AuthContext.Provider>
  );
};
const useAuth = () => React.useContext(AuthContext);

export {AuthProvider, useAuth};
