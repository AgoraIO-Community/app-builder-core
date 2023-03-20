import React, {useEffect} from 'react';
import {useAuth} from './AuthProvider';
import {useHistory, useParams} from '../components/Router';
import Loading from '../subComponents/Loading';

export const IDPAuth = () => {
  const {setIsAuthenticated} = useAuth();
  const history = useHistory();
  const {token}: {token: string} = useParams();
  //web token set in the cookies, using this route redirect user to origin url
  //token used as path

  // const getSearchParamFromURL = (url, param) => {
  //   const include = url.includes(param);

  //   if (!include) return null;

  //   const params = url.split(/([&,?,=])/);
  //   const index = params.indexOf(param);
  //   const value = params[index + 2];
  //   return value;
  // };

  useEffect(() => {
    setIsAuthenticated(true);
    if (token) {
      history.push('/' + token);
    } else {
      history.push('/');
    }
  }, []);

  return <Loading text={'Authorizing app...'} />;
};
