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
        <Text style={{color: $config.SECONDARY_ACTION_COLOR}}>
          You have been logged out. Please login again.
        </Text>
      </View>
      <TouchableOpacity style={styles.loginBtn} onPress={authLogin}>
        <Text style={styles.loginText}>LOGIN</Text>
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
    marginTop: 30,
    alignItems: 'center',
    backgroundColor: '#00AEFC',
    padding: 10,
    borderRadius: 5,
    width: 100,
  },
  loginText: {
    color: '#fff',
  },
});
