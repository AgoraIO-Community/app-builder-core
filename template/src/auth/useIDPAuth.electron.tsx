import {useContext} from 'react';
import {
  enableIDPAuth,
  getIDPAuthLoginURL,
  addEventListenerForToken,
} from './openIDPURL.electron';
import StorageContext from '../components/StorageContext';
import useTokenAuth from './useTokenAuth';
import {useHistory} from '../components/Router';
import {useString} from '../utils/useString';
import {authSessionTimeoutToastHeading} from '../language/default-labels/commonLabels';
import getUniqueID from '../utils/getUniqueID';
import {LogSource, logger} from '../logger/AppBuilderLogger';

export const useIDPAuth = () => {
  const {store, setStore} = useContext(StorageContext);
  const {tokenLogout} = useTokenAuth();
  const headingText = useString(authSessionTimeoutToastHeading)();
  const history = useHistory();
  const idpLogout = () => {
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
                  requestId,
                  responseData: res,
                  startReqTs,
                  endReqTs,
                  latency,
                },
              );
              //Storing the URL in the local variable
              const IDPAuthLogoutURL =
                res?.url +
                `&returnTo=${encodeURIComponent(getIDPAuthLoginURL())}`;
              //manage backend logout
              //it will invalid the user session from the manage backend
              tokenLogout()
                .then(() => {
                  //call IDP logout url
                  addEventListenerForToken(history, headingText);
                  setTimeout(() => {
                    window.open(IDPAuthLogoutURL, 'modal');
                  });
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
