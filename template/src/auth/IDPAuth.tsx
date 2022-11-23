import React, {useEffect} from 'react';
import {useAuth} from './AuthProvider';
import {useHistory} from '../components/Router';
import Loading from '../subComponents/Loading';

export const IDPAuth = () => {
  const {setIsAuthenticated} = useAuth();
  const history = useHistory();

  useEffect(() => {
    setIsAuthenticated(true);
    history.push('/create');
  }, []);

  return <Loading text={'Authorizing app...'} />;
};
