import React, {useEffect} from 'react';
import {useAuth} from './AuthProvider';
import {useHistory, useParams} from '../components/Router';
import Loading from '../subComponents/Loading';
import useTokenAuth from './useTokenAuth';
import {useString} from '../utils/useString';
import {authAuthorizingApplicationText} from '../language/default-labels/commonLabels';
import {LogSource, logger} from '../logger/AppBuilderLogger';

export const IDPAuth = () => {
  const {setIsAuthenticated} = useAuth();
  const {enableTokenAuth} = useTokenAuth();
  const history = useHistory();
  const {token}: {token: string} = useParams();
  const text = useString(authAuthorizingApplicationText)();

  useEffect(() => {
    if (token) {
      enableTokenAuth(token)
        .then(() => {
          setIsAuthenticated(true);
          history.push('/');
        })
        .catch(() => {
          setIsAuthenticated(false);
          logger.error(LogSource.Internals, 'AUTH', 'electron login failed');
        });
    }
  }, []);

  return <Loading text={text} />;
};
