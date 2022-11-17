import React, {useEffect} from 'react';
import {Linking} from 'react-native';
import {StyleSheet, View, Text, ActivityIndicator} from 'react-native';

export const idpAuth = {
  auth_uri: `${$config.BACKEND_ENDPOINT}/idp/login`,
  origin_uri: 'https://localhost.9000',
  redirect_uri: 'http://localhost:9000/create',
  // redirect_uri: window.location.origin,
};

export const IDPAuth = () => {
  useEffect(() => {
    Linking.openURL(
      `${idpAuth.auth_uri}?project_id=${$config.PROJECT_ID}&redirect_url=${idpAuth.redirect_uri}&origin_url=${idpAuth.origin_uri}&platform_id=turnkey_web`,
    );
  }, []);

  return (
    <View style={styles.overlay}>
      <Text style={styles.loadingText}>Authorizing app...</Text>
      <ActivityIndicator size="large" color={$config.SECONDARY_FONT_COLOR} />
    </View>
  );
};
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 15,
  },
  loadingText: {
    alignSelf: 'center',
    fontSize: 20,
    color: $config.SECONDARY_FONT_COLOR,
    marginBottom: 10,
  },
});
