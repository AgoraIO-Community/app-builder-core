import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useRTMCore} from './RTMCoreProvider';
import {nativeLinkStateMapping} from '../../bridge/rtm/web/Types';

export const RTMStatusBanner = () => {
  const {connectionState, error, isLoggedIn} = useRTMCore();

  // internal debounced copy of the state to prevent flicker
  const [visibleState, setVisibleState] = useState(connectionState);
  const [visibleError, setVisibleError] = useState(error);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisibleState(connectionState);
      setVisibleError(error);
    }, 700); // debounce 700 ms
    return () => clearTimeout(timeout);
  }, [connectionState, error]);

  // Don't show banner if connected and logged in with no errors
  if (
    visibleState === nativeLinkStateMapping.CONNECTED &&
    isLoggedIn &&
    !visibleError
  ) {
    return null;
  }

  let message = '';
  let isError = false;

  if (visibleError || visibleState === nativeLinkStateMapping.FAILED) {
    // Login failed - critical error
    message =
      'RTM connection failed. App might not work correctly. Retrying...';
    isError = true;
  } else if (visibleState === nativeLinkStateMapping.DISCONNECTED) {
    // RTM disconnected in the middle of the call - retrying
    message = 'RTM disconnected — retrying connection...';
    isError = false;
  } else if (
    visibleState === nativeLinkStateMapping.IDLE ||
    visibleState === nativeLinkStateMapping.CONNECTING
  ) {
    // RTM is idle or connecting
    message = 'RTM connecting...';
    isError = false;
  } else if (!isLoggedIn) {
    // Not logged in but no explicit error yet
    message = 'RTM connecting...';
    isError = false;
  }

  // Don't render banner if there's no message to show
  if (!message) {
    return null;
  }

  return (
    <View style={[styles.banner, isError ? styles.error : styles.warning]}>
      <Text
        style={[styles.text, isError ? styles.errorText : styles.warningText]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    backgroundColor: '#f8d7da',
  },
  warning: {
    backgroundColor: '#fff3cd',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorText: {
    color: '#721c24',
  },
  warningText: {
    color: '#856404',
  },
});
