import {Linking} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import {enableIDPAuth} from './openIDPURL';

export const useIDPAuth = () => {
  const idpLogout = () => {
    return new Promise((resolve, reject) => {
      try {
        //v1/idp/logout -> will generate and return URL for IDP logout(frontend need to call this)
        fetch(`${$config.BACKEND_ENDPOINT}/v1/idp/logout`, {
          credentials: 'include',
        })
          .then((response) => response.json())
          .then((res: any) => {
            if (res && res?.url) {
              //Storing the URL in the local variable
              const IDPAuthLogoutURL =
                res?.url + `&returnTo=${window.location.origin}`;
              //manage backend logout
              //it will invalid the user session from the manage backend
              fetch(`${$config.BACKEND_ENDPOINT}/v1/logout`, {
                credentials: 'include',
              })
                .then(() => {
                  //call IDP logout url
                  if (InAppBrowser.isAvailable()) {
                    InAppBrowser.close();
                    InAppBrowser.open(IDPAuthLogoutURL);
                  } else {
                    Linking.openURL(IDPAuthLogoutURL);
                  }
                  resolve(true);
                })
                .catch(() => {
                  reject(false);
                });
            } else {
              reject(false);
            }
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
