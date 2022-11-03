import React, {useEffect} from 'react';
import jwt_decode from 'jwt-decode';
import SDKEvents from '../utils/SdkEvents';

const REFRESH_TOKEN_DURATION_IN_SEC = 60;

const useSDKAuth = () => {
  const [serverToken, setServerToken] = React.useState(null);
  const [tokenExpiresAt, setTokenExpiresAt] = React.useState(0);

  const getNewToken = async () => {
    await fetch(`${$config.BACKEND_ENDPOINT}/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: serverToken ? `Bearer ${serverToken}` : '',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log('7. supriya get new token', data);
        setServerToken(data.token || null);
      });
  };

  const validateToken = (options) => {
    if (options && options.token && options.token.trim() !== '') {
      // console.log('1. supriya enabling authentication', options.token);
      const decoded = jwt_decode(options.token);
      const expiresAt = decoded?.exp * 1000;
      if (Date.now() >= expiresAt) {
        throw 'Token expired. Pass a new token';
      }
    } else {
      throw 'Token is missing in the options';
    }
    return true;
  };

  useEffect(() => {
    if (!tokenExpiresAt) return;

    const timer = setInterval(() => {
      const diffInSeconds = Math.floor(
        Math.abs(tokenExpiresAt - Date.now()) / 1000,
      );
      // console.log('4. supriya diff: ', diffInSeconds);
      // const minutesLeft = Math.floor(diffInSeconds / 60) % 60;
      // const secondsLeft = (diffInSeconds - minutes * 60) % 60;

      if (diffInSeconds < REFRESH_TOKEN_DURATION_IN_SEC) {
        // console.log('5 . supriya 1 min range reached');
        try {
          getNewToken();
          clearInterval(timer);
        } catch (error) {
          clearInterval(timer);
        }
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
      // console.log('2. supriya sdk token set', sdkToken);
      if (Date.now() >= expiresAt) {
        throw 'Token expired. Pass a new token';
      } else {
        // console.log('3. supriya emitting token');
        SDKEvents.emit('sdk-token', serverToken);
        setTokenExpiresAt(expiresAt);
      }
    };
    syncToken();
  }, [serverToken]);

  return {
    setServerToken,
    validateToken,
  };
};

export default useSDKAuth;
