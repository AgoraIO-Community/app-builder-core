/* eslint-disable react-native/no-inline-styles */
import React, {useContext} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
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
    <View style={{alignSelf: 'flex-end'}}>
      {token === null ? (
        <TouchableOpacity
          style={{
            backgroundColor: '#099DFD',
            width: 80,
            height: 30,
            marginTop: 5,
            marginRight: 5,
          }}
          onPress={() => login()}>
          <Text
            style={{
              lineHeight: 30,
              fontSize: 16,
              textAlign: 'center',
              color: '#fff',
            }}>
            Login
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={{
            backgroundColor: '#099DFD',
            width: 80,
            height: 30,
            marginTop: 5,
            marginRight: 5,
          }}
          onPress={() => logout()}>
          <Text
            style={{
              lineHeight: 30,
              fontSize: 16,
              textAlign: 'center',
              color: '#fff',
            }}>
            Logout
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
