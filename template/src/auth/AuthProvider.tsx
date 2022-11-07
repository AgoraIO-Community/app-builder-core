import React, {createContext, useState, useEffect} from 'react';
import {useHistory} from '../components/Router';
import SDKEvents from '../../src/utils/SdkEvents';

export const idpAuth = {
  auth_uri: `${$config.BACKEND_ENDPOINT}/idp/login`,
  origin_uri: 'https://google.com',
  redirect_uri: 'https://conferencing.agora.io', // where to redirect the user to after login.
};
interface AuthContextInterface {
  sdkToken: string;
}

const initStorageContextValue = {
  sdkToken: null,
};

const AuthContext = createContext<AuthContextInterface>(
  initStorageContextValue,
);

export const AuthConsumer = AuthContext.Consumer;

export default AuthContext;

export const AuthProvider = (props: {children: React.ReactNode}) => {
  const [sdkToken, setSdkToken] = useState(null);
  const history = useHistory();

  useEffect(() => {
    SDKEvents.on('server-token', (token) => {
      history.push(`/auth-token/${token}`);
      setSdkToken(token);
    });
  }, []);

  return (
    <AuthContext.Provider value={{sdkToken}}>
      {props.children}
    </AuthContext.Provider>
  );
};
