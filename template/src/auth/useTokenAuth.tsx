import React, {useEffect, useContext} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import jwt_decode from 'jwt-decode';
import {useHistory} from '../components/Router';
import StorageContext from '../components/StorageContext';

const REFRESH_TOKEN_DURATION_IN_SEC = 59;

const useTokenAuth = () => {
  const {setStore} = useContext(StorageContext);
  const [serverToken, setServerToken] = React.useState(null);
  const [tokenExpiresAt, setTokenExpiresAt] = React.useState(0);
  const history = useHistory();

  const storeToken = (token: string) => {
    setStore && setStore((store) => ({...store, token}));
    setServerToken(token);
  };

  const validateToken = (token: string) => {
    if (token && token.trim() !== '') {
      const decoded = jwt_decode(token);
      const expiresAt = decoded?.exp * 1000;
      if (Date.now() >= expiresAt) {
        throw 'Token expired. Pass a new token';
      }
    } else {
      throw 'Token is missing in the options';
    }
    return true;
  };

  const getRefreshToken = async () => {
    await fetch(`${$config.BACKEND_ENDPOINT}/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: serverToken ? `Bearer ${serverToken}` : '',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        storeToken(data.token);
        setServerToken(data.token || null);
      });
  };

  useEffect(() => {
    if (!tokenExpiresAt) return;

    const timer = setInterval(() => {
      const diffInSeconds = Math.floor(
        Math.abs(tokenExpiresAt - Date.now()) / 1000,
      );
      // const minutesLeft = Math.floor(diffInSeconds / 60) % 60;
      // const secondsLeft = (diffInSeconds - minutes * 60) % 60;

      if (diffInSeconds < REFRESH_TOKEN_DURATION_IN_SEC) {
        try {
          getRefreshToken();
          clearInterval(timer);
        } catch (error) {
          clearInterval(timer);
        }
      }
      if (diffInSeconds < 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [tokenExpiresAt]);

  useEffect(() => {
    const syncToken = async () => {
      if (!serverToken) return;
      const decoded = jwt_decode(serverToken);
      const expiresAt = decoded?.exp * 1000;
      if (Date.now() >= expiresAt) {
        throw 'Token expired. Pass a new token';
      } else {
        setTokenExpiresAt(expiresAt);
      }
    };
    syncToken();
  }, [serverToken]);

  const enableTokenAuth = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const token = await AsyncStorage.getItem('SDK_TOKEN');
        if (token) {
          if (validateToken(token)) {
            storeToken(token);
            resolve(true);
          } else {
            throw new Error('Token expired');
          }
        } else {
          throw new Error('Token not found');
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  const tokenLogout = () => {
    return new Promise((resolve, reject) => {
      try {
        fetch(`${$config.BACKEND_ENDPOINT}/logout`, {
          headers: {
            authorization: serverToken ? `Bearer ${serverToken}` : '',
          },
        })
          .then((response) => response.text())
          .then((_) => {
            resolve(true);
            storeToken(null);
          })
          .catch((_) => {
            reject(false);
          });
      } catch (error) {
        reject(false);
      }
    });
  };

  return {
    enableTokenAuth,
    tokenLogout,
  };
};

export default useTokenAuth;
