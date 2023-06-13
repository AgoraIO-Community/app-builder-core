import React, {useEffect} from 'react';
import {useAuth} from './AuthProvider';
import {useHistory, useParams} from '../components/Router';
import Loading from '../subComponents/Loading';
import useTokenAuth from './useTokenAuth';

export const IDPAuth = () => {
  const {setIsAuthenticated} = useAuth();
  const {enableTokenAuth} = useTokenAuth();
  const history = useHistory();
  const {token}: {token: string} = useParams();

  useEffect(() => {
    console.log('debugging electron token', token);
    if (token) {
      enableTokenAuth(token)
        .then(() => {
          setIsAuthenticated(true);
          console.log('debugging electron login success');
          history.push('/');
        })
        .catch(() => {
          setIsAuthenticated(false);
          console.log('debugging electron login failed');
        });
    }
  }, []);

  return <Loading text={'Authorizing app...'} />;
};
