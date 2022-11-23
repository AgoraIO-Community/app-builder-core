import {useState, useEffect} from 'react';

const AUTH_ENDPOINT_URL = `${$config.BACKEND_ENDPOINT}/idp/login`;

export const useAuthRedirect = () => {
  const [originURL, setOriginURL] = useState('');
  const [redirectURL, setRedirectURL] = useState('');
  useEffect(() => {
    setOriginURL(window.location.origin);
    if ($config.FRONTEND_ENDPOINT) {
      setRedirectURL(`${$config.FRONTEND_ENDPOINT}/authorize`);
    } else {
      setRedirectURL(`${window.location.origin}/authorize`);
    }
  }, []);

  const idpAuthURL = `${AUTH_ENDPOINT_URL}?project_id=${$config.PROJECT_ID}&redirect_url=${redirectURL}&origin_url=${originURL}&platform_id=turnkey_web`;

  return {
    idpAuthURL,
  };
};
