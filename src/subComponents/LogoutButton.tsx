/* eslint-disable react-native/no-inline-styles */
import React, {useContext} from 'react';
import {TouchableOpacity, Text} from 'react-native';
import StorageContext from '../components/StorageContext';
import {useHistory} from '../components/Router';
import {gql, useMutation} from '@apollo/client';

const LOGOUT = gql`
  mutation logoutSession($token: String!) {
    logoutSession(token: $token)
  }
`;

export default function LogoutButton() {
  const {store, setStore} = useContext(StorageContext);
  const {token} = store;
  const history = useHistory();
  const [logoutQuery, {data, loading}] = useMutation(LOGOUT);

  const logout = () => {
    logoutQuery({variables: {token}}).then((res) => {
      setStore({token: null});
    });
  };

  const login = () => {
    history.push('/authenticate');
  };

  return (
    <>
      {token === null ? (
        <TouchableOpacity
          style={{
            width: '60%',
            maxWidth: 400,
            minHeight: 45,
            marginBottom: 15,
          }}
          onPress={() => login()}>
          <Text
            style={{
              width: '100%',
              height: 45,
              lineHeight: 45,
              fontSize: 16,
              fontWeight: '500',
              textAlign: 'center',
              textAlignVertical: 'center',
              color: '#333',
              textDecorationLine: 'underline',
            }}>
            Login using OAuth
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={{
            width: '60%',
            maxWidth: 400,
            minHeight: 45,
            marginBottom: 15,
          }}
          onPress={() => logout()}>
          <Text
            style={{
              width: '100%',
              height: 45,
              lineHeight: 45,
              fontSize: 16,
              fontWeight: '500',
              textAlign: 'center',
              textAlignVertical: 'center',
              color: '#333',
              textDecorationLine: 'underline',
            }}>
            Logout
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
}
