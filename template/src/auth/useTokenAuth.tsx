import React, {useEffect, useContext, useRef} from 'react';
import jwt_decode from 'jwt-decode';
import StorageContext from '../components/StorageContext';
import SdkEvents from '../utils/SdkEvents';
import isSDK from '../utils/isSDK';
import {getPlatformId} from './config';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import getUniqueID from '../utils/getUniqueID';
const REFRESH_TOKEN_DURATION_IN_SEC = 59;

const useTokenAuth = () => {
  const tokenRef = useRef(null);
  const {setStore, store} = useContext(StorageContext);
  const [tokenExpiresAt, setTokenExpiresAt] = React.useState(0);
  const timerRef = useRef(null);
  const updateToken = (token: string) => {
    setStore && setStore(store => ({...store, token}));
  };

  const validateToken = (token: string) => {
    if (token && token.trim() !== '') {
      const decoded = jwt_decode(token);
      // @ts-ignore
      const expiresAt = decoded?.exp * 1000;
      if (Date.now() >= expiresAt) {
        if (isSDK()) {
          SdkEvents.emit('did-token-expire');
        }
        throw 'Token expired. Pass a new token';
      }
    } else {
      if (isSDK()) {
        SdkEvents.emit('token-not-found');
      }
      throw 'Token is missing in the options';
    }
    return true;
  };

  const getRefreshToken = async () => {
    if (store?.token) {
      const requestId = getUniqueID();
      const startReqTs = Date.now();
      logger.log(
        LogSource.NetworkRest,
        'token_refresh',
        'API token_refresh Trying to refresh the token',
        {
          requestId: requestId,
          startReqTs,
        },
      );
      await fetch(`${$config.BACKEND_ENDPOINT}/v1/token/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: store?.token ? `Bearer ${store.token}` : '',
          'X-Platform-ID': getPlatformId(),
          'X-Request-Id': requestId,
        },
      })
        .then(response => response.json())
        .then(data => {
          const endReqTs = Date.now();
          const latency = endReqTs - startReqTs;
          logger.log(
            LogSource.NetworkRest,
            'token_refresh',
            'API token_refresh successfully done',
            {
              requestId,
              responseData: data,
              startReqTs,
              endReqTs,
              latency,
            },
          );
          if (data?.token) {
            updateToken(data.token);
            if (isSDK()) {
              SdkEvents.emit('token-refreshed');
            }
          }
        });
    } else {
      //'debugging no token to refresh'
    }
  };

  useEffect(() => {
    if (!tokenExpiresAt) return;

    timerRef.current = setInterval(() => {
      const diffInSeconds = Math.floor(
        Math.abs(tokenExpiresAt - Date.now()) / 1000,
      );
      // const minutesLeft = Math.floor(diffInSeconds / 60) % 60;
      // const secondsLeft = (diffInSeconds - minutes * 60) % 60;

      if (diffInSeconds < REFRESH_TOKEN_DURATION_IN_SEC) {
        try {
          if (isSDK()) {
            SdkEvents.emit('will-token-expire');
          }
          getRefreshToken();
          clearInterval(timerRef.current);
        } catch (error) {
          clearInterval(timerRef.current);
        }
      }
      if (diffInSeconds < 0) {
        clearInterval(timerRef.current);
      }
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [tokenExpiresAt]);

  useEffect(() => {
    const syncToken = async () => {
      if (!store?.token) {
        try {
          timerRef.current && clearInterval(timerRef.current);
        } catch (error) {
          logger.debug(
            LogSource.Internals,
            'AUTH',
            'error on clearing interval',
            error,
          );
        }
      } else {
        const decoded = jwt_decode(store.token);
        // @ts-ignore
        const expiresAt = decoded?.exp * 1000;
        if (Date.now() >= expiresAt) {
          if (isSDK()) {
            SdkEvents.emit('did-token-expire');
          }
          //token expired
        } else {
          setTokenExpiresAt(expiresAt);
        }
      }
    };
    tokenRef.current = store.token;
    syncToken();
  }, [store?.token]);

  const enableTokenAuth = async (tokenparam?: string) => {
    return new Promise(async (resolve, reject) => {
      let token = '';
      let updateTokenInStore = false;
      try {
        if (tokenparam) {
          token = tokenparam;
          updateTokenInStore = true;
        } else {
          token = store?.token;
        }
        if (token) {
          try {
            if (validateToken(token)) {
              if (updateTokenInStore) {
                updateToken(token);
              }
              setTimeout(() => {
                resolve(true);
              });
            } else {
              if (isSDK()) {
                SdkEvents.emit('did-token-expire');
              }
            }
          } catch (e) {
            reject('Token expired');
          }
        } else {
          if (isSDK()) {
            SdkEvents.emit('token-not-found');
          }
          reject('Token not found');
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  const tokenLogout = async (cookieLogout: boolean = false) => {
    return new Promise((resolve, reject) => {
      try {
        const startReqTs = Date.now();
        const requestId = getUniqueID();
        logger.log(
          LogSource.NetworkRest,
          'idp_logout',
          'Trying to call v1 logout',
          {
            startReqTs,
            ...(cookieLogout ? {} : {requestId}),
          },
        );
        fetch(
          `${$config.BACKEND_ENDPOINT}/v1/logout`,
          cookieLogout
            ? {credentials: 'include'}
            : {
                headers: {
                  authorization: tokenRef.current
                    ? `Bearer ${tokenRef.current}`
                    : '',
                  'X-Request-Id': requestId,
                },
              },
        )
          .then(response => response.text())
          .then(res => {
            const endReqTs = Date.now();
            logger.log(
              LogSource.NetworkRest,
              'idp_logout',
              'API V1 logout called successfully',
              {
                responseData: res,
                startReqTs,
                endReqTs,
                latency: endReqTs - startReqTs,
                ...(cookieLogout ? {} : {requestId}),
              },
            );
            resolve(true);
            updateToken(null);
          })
          .catch(error => {
            const endReqTs = Date.now();
            logger.error(
              LogSource.NetworkRest,
              'idp_logout',
              'Error API V1 logout called successfully',
              error,
              {
                startReqTs,
                endReqTs,
                latency: endReqTs - startReqTs,
                ...(cookieLogout ? {} : {requestId}),
              },
            );
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
