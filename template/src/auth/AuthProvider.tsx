import React, {createContext, useState, useEffect} from 'react';
import {useHistory} from '../components/Router';
import {gql, useApolloClient} from '@apollo/client';
import AsyncStorage from '@react-native-community/async-storage';

const GET_USER = gql`
  query getUser {
    getUser {
      name
      email
    }
  }
`;

export const idpAuth = {
  auth_uri: `${$config.BACKEND_ENDPOINT}/idp/login`,
  origin_uri: 'https://google.com',
  redirect_uri: window.location.origin, // where to redirect the user to after login.
};

type AuthProviderProps = {
  enableAuth?: boolean;
  children: React.ReactNode;
};

interface AuthContextInterface {
  authenticated: boolean;
}

const initStorageContextValue = {
  authenticated: false,
};

const AuthContext = createContext<AuthContextInterface>(
  initStorageContextValue,
);

const AuthProvider = (props: AuthProviderProps) => {
  const [authenticated, setIsAuthenticated] = useState(true);
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
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw new Error(error);
    }
  }

  const enableTokenAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('SDK_TOKEN');
      if (token) {
        history.push(`/authenticate/${token}`);
      } else {
        setIsAuthenticated(false);
        history.push(`/login`);
        throw Error('Token not found');
      }
    } catch (error) {
      console.log('supriya token auth failed: ', error);
    }
  };
  useEffect(() => {
    try {
      getUserDetails()
        .then((_) => {
          if (!authenticated) {
            history.push(`/create`);
          }
        })
        .catch((err) => {
          if (enableAuth) {
            if ($config.ENABLE_IDP_AUTH) {
              history.push(`/authenticate`);
            } else if ($config.ENABLE_TOKEN_AUTH) {
              enableTokenAuth();
            }
          } else {
            setIsAuthenticated(false);
          }
        });
    } catch (error) {
      setIsAuthenticated(false);
      history.push(`/login`);
    }
  }, []);

  return (
    <AuthContext.Provider value={{authenticated}}>
      {loading ? <p>Loading...</p> : props.children}
    </AuthContext.Provider>
  );
};
const useAuth = () => React.useContext(AuthContext);

export {AuthProvider, useAuth};
