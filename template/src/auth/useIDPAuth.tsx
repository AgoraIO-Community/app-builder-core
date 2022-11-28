import {useState, useEffect} from 'react';
import {useLocation} from '../components/Router';
import {Linking} from 'react-native';
import {getIDPAuthRedirectURL, getOriginURL, getPlatformId} from './config';

const AUTH_ENDPOINT_URL = `${$config.BACKEND_ENDPOINT}/idp/login`;

export const useIDPAuth = () => {
  const enableIDPAuth = () => {
    Linking.openURL(
      `${AUTH_ENDPOINT_URL}?project_id=${
        $config.PROJECT_ID
      }&redirect_url=${getIDPAuthRedirectURL()}&origin_url=${getOriginURL()}&platform_id=${getPlatformId()}`,
    );
  };

  const idpLogout = () => {
    return new Promise((resolve, reject) => {
      try {
        fetch(`${$config.BACKEND_ENDPOINT}/logout`, {
          credentials: 'include',
        })
          .then((response) => response.text())
          .then((_) => {
            resolve(true);
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
    enableIDPAuth,
    idpLogout,
  };
};
