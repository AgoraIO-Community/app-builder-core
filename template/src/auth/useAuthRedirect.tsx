import {useState, useEffect} from 'react';

const idpAuth = {
  auth_uri: `${$config.BACKEND_ENDPOINT}/idp/login`,
  redirect_uri: 'http://localhost:9000/authorize',
};

export const useAuthRedirect = () => {
  const [originURL, setOriginURL] = useState('');

  useEffect(() => {
    setOriginURL(window.location.origin);
  }, []);

  const idpAuthURL = `${idpAuth.auth_uri}?project_id=${$config.PROJECT_ID}&redirect_url=${idpAuth.redirect_uri}&origin_url=${originURL}&platform_id=turnkey_web`;

  return {
    idpAuthURL,
  };
};
