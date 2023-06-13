import React, {useEffect} from 'react';
import {GET_USER, useAuth} from './AuthProvider';
import {useHistory, useParams} from '../components/Router';
import Loading from '../subComponents/Loading';
import {useApolloClient} from '@apollo/client';
import Toast from '../../react-native-toast-message';

export const IDPAuth = () => {
  const {setIsAuthenticated, authLogin} = useAuth();
  const history = useHistory();
  const {token}: {token: string} = useParams();
  const apolloClient = useApolloClient();
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

  async function getUserDetails() {
    try {
      await apolloClient.query({
        query: GET_USER,
        fetchPolicy: 'network-only',
      });
    } catch (error) {
      throw error;
    }
  }

  useEffect(() => {
    //web token set in the cookies
    //verify the token by calling the query
    getUserDetails()
      .then((_) => {
        setIsAuthenticated(true);
        if (token && token.indexOf('authorize') === -1) {
          history.push('/' + token);
        } else {
          history.push('/');
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        Toast.show({
          type: 'error',
          text1: 'Error occured on Login, Please login again.',
          visibilityTime: 3000,
        });
        setTimeout(() => {
          authLogin();
        }, 3000);
      });
  }, []);

  return <Loading text={'Authorizing app...'} />;
};
