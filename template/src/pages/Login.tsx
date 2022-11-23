import React, {useState} from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {useAuth} from '../auth/AuthProvider';

export default function Login() {
  const {authLogin} = useAuth();

  return (
    <View style={styles.container}>
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 50,
        }}>
        <Text>You have been logged out. Please login</Text>
      </View>
      <TouchableOpacity style={styles.loginBtn} onPress={authLogin}>
        <Text>LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 200,
  },
  loginBtn: {
    color: '#fff',
    marginTop: 30,
    alignItems: 'center',
    backgroundColor: '#00AEFC',
    padding: 10,
    borderRadius: 5,
    width: 100,
  },
});
