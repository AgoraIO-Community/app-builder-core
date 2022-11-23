import {useState, useEffect} from 'react';
import {AUTH_ENDPOINT_URL, AUTH_REDIRECT_URL} from './constants';

export const useAuthRedirect = () => {
  const [originURL, setOriginURL] = useState('');

  useEffect(() => {
    setOriginURL(window.location.origin);
  }, []);

  const idpAuthURL = `${AUTH_ENDPOINT_URL}?project_id=${$config.PROJECT_ID}&redirect_url=${AUTH_REDIRECT_URL}&origin_url=${originURL}&platform_id=turnkey_web`;

  return {
    idpAuthURL,
  };
};
