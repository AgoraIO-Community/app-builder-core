import React, {useEffect} from 'react';
import {useAuth} from './AuthProvider';
import {useHistory, useParams} from '../components/Router';
import Loading from '../subComponents/Loading';

export const IDPAuth = () => {
  const {setIsAuthenticated, meetingId} = useAuth();
  const history = useHistory();
  //todo
  //for electron show authetication success and open application
  const {token}: {token: string} = useParams();
  useEffect(() => {
    //todo store token
    setIsAuthenticated(true);
    if (meetingId) {
      history.push(meetingId);
    } else {
      history.push('/');
    }
  }, []);

  return <Loading text={'Authorizing app...'} />;
};
