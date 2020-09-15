import React, {useContext} from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import StorageContext from '../components/StorageContext';
import {useHistory} from '../components/Router';
import {gql, useMutation} from '@apollo/client';

const LOGOUT = gql`
  mutation logoutSession($token: String!) {
    logoutSession(token: $token)
  }
`;

const LogoutButton = () => {
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
        <TouchableOpacity style={style.btn} onPress={() => login()}>
          <Text style={style.btnText}>Login using OAuth</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={style.btn} onPress={() => logout()}>
          <Text style={style.btnText}>Logout</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

const style = StyleSheet.create({
  btn: {
    width: '60%',
    maxWidth: 400,
    minHeight: 45,
    marginBottom: 15,
  },
  btnText: {
    width: '100%',
    height: 45,
    lineHeight: 45,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#333',
    textDecorationLine: 'underline',
  },
});

export default LogoutButton;
