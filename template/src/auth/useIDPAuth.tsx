import {Linking} from 'react-native';
import {useLocation} from '../components/Router';
import {enableIDPAuth, getIDPAuthLoginURL} from './openIDPURL';
import useTokenAuth from './useTokenAuth';
import StorageContext from '../components/StorageContext';
import {useContext} from 'react';
import getUniqueID from '../utils/getUniqueID';
import {LogSource, logger} from '../logger/AppBuilderLogger';

export const useIDPAuth = () => {
  const location = useLocation();
  const {store, setStore} = useContext(StorageContext);
  const {tokenLogout} = useTokenAuth();
  const idpLogout = (dummy: any) => {
    return new Promise((resolve, reject) => {
      const requestId = getUniqueID();
      const startReqTs = Date.now();
      try {
        logger.log(
          LogSource.NetworkRest,
          'idp_logout',
          'API idp_logout Trying to get logout url',
          {
            requestId,
            startReqTs,
          },
        );
        //v1/idp/logout -> will generate and return URL for IDP logout(frontend need to call this)
        fetch(`${$config.BACKEND_ENDPOINT}/v1/idp/logout`, {
          credentials: 'include',
          headers: {
            authorization: store?.token ? `Bearer ${store?.token}` : '',
            'X-Request-Id': requestId,
          },
        })
          .then(response => response.json())
          .then((res: any) => {
            if (res && res?.url) {
              const endReqTs = Date.now();
              const latency = endReqTs - startReqTs;
              logger.log(
                LogSource.NetworkRest,
                'idp_logout',
                'API idp_logout Got logout url',
                {
                  requestId: requestId,
                  responseData: res,
                  startReqTs,
                  endReqTs,
                  latency,
                },
              );
              //Storing the URL in the local variable
              // const IDPAuthLogoutURL =
              //   res?.url + `&returnTo=${window.location.origin}`;
              const IDPAuthLogoutURL =
                res?.url +
                `&returnTo=${encodeURIComponent(
                  getIDPAuthLoginURL(location.pathname),
                )}`;
              //manage backend logout
              //it will invalid the user session from the manage backend
              //cookie logout -> true
              //regular logout -> false
              tokenLogout(false)
                .then(() => {
                  //open idp logout url
                  Linking.openURL(IDPAuthLogoutURL);
                  resolve(true);
                })
                .catch(() => {
                  reject(false);
                });
            } else {
              const endReqTs = Date.now();
              logError(
                {errorMessage: 'API idp_logout logurl is empty'},
                requestId,
                startReqTs,
                endReqTs,
              );
              reject(false);
            }
          })
          .catch(error => {
            const endReqTs = Date.now();
            logError(error, requestId, startReqTs, endReqTs);
            reject(false);
          });
      } catch (error) {
        const endReqTs = Date.now();
        logError(error, requestId, startReqTs, endReqTs);
        reject(false);
      }
    });
  };

  const logError = (
    error: any,
    requestId: string,
    startReqTs: number,
    endReqTs: number,
  ) => {
    const latency = endReqTs - startReqTs;
    logger.error(
      LogSource.NetworkRest,
      'idp_logout',
      'Error on calling API idp_logout',
      error,
      {
        requestId,
        startReqTs,
        endReqTs,
        latency,
      },
    );
  };

  return {
    enableIDPAuth,
    idpLogout,
  };
};
