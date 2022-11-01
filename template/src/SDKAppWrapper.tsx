import React, {useEffect, useState} from 'react';
import {CustomizationApiInterface, customize} from 'customization-api';
import AsyncStorage from '@react-native-community/async-storage';
import {
  customizationConfig,
  CustomizationProvider,
} from 'customization-implementation';
import SDKEvents from './utils/SdkEvents';
import App from './App';
import {StyleSheet, View, Text, ActivityIndicator} from 'react-native';
import jwt_decode from 'jwt-decode';

const REFRESH_TOKEN_DURATION_IN_SEC = 60;

export interface userEventsMapInterface {
  leave: () => void;
  create: (
    hostPhrase: string,
    attendeePhrase?: string,
    pstnNumer?: {
      number: string;
      pin: string;
    },
  ) => void;
  'ready-to-join': (meetingTitle: string, devices: MediaDeviceInfo[]) => void;
  'sdk-token': (token: string) => void;
  join: (
    meetingTitle: string,
    devices: MediaDeviceInfo[],
    isHost: boolean,
  ) => void;
}

export interface OptionsInterface {
  token: string;
}

export interface AppBuilderSdkApiInterface {
  customize: (customization: CustomizationApiInterface) => void;
  initialize: (options: OptionsInterface) => void;
  createCustomization: (
    customization: CustomizationApiInterface,
  ) => CustomizationApiInterface;
  join: (roomid: string) => Promise<void>;
  on: <T extends keyof userEventsMapInterface>(
    userEventName: T,
    callBack: userEventsMapInterface[T],
  ) => void;
}

export const AppBuilderSdkApi: AppBuilderSdkApiInterface = {
  initialize: (options: OptionsInterface) =>
    new Promise((resolve, reject) => {
      SDKEvents.emit('appInit', options, resolve, reject);
    }),
  customize: (customization: CustomizationApiInterface) => {
    SDKEvents.emit('addFpe', customization);
  },
  join: (roomid: string) =>
    new Promise((resolve, reject) => {
      SDKEvents.emit('joinMeetingWithPhrase', roomid, resolve, reject);
    }),
  createCustomization: customize,
  on: (userEventName, cb) => {
    SDKEvents.on(userEventName, cb);
    console.log('SDKEvents: Event Registered', userEventName);
  },
};

const SDKAppWrapper = () => {
  const [fpe, setFpe] = useState(customizationConfig);
  const [initialized, setInitialized] = React.useState(false);
  const [tokenExpiresAt, setTokenExpiresAt] = React.useState(0);
  const [sdkToken, setSdkToken] = React.useState(null);

  useEffect(() => {
    SDKEvents.on('appInit', async (options, resolve, reject) => {
      try {
        $config.ENABLE_SDK_AUTHENTICATION && enableSdkAuthentication(options);
        setInitialized(true);
        resolve(true);
      } catch (error) {
        setInitialized(false);
        reject(`Error initializing app buider ${error}`);
      }
    });
    SDKEvents.on('addFpe', (sdkFpeConfig) => {
      setFpe(sdkFpeConfig);
    });
    SDKEvents.emit('addFpeInit');
    // Join event consumed in Create.tsx
  }, []);

  const enableSdkAuthentication = (options: OptionsInterface) => {
    if (options && options.token && options.token.trim() !== '') {
      console.log('1. supriya enabling authentication', options.token);
      setSdkToken(options.token);
    } else {
      throw 'Token is missing in the options';
    }
  };

  const getNewToken = async () => {
    await fetch(`${$config.BACKEND_ENDPOINT}/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: sdkToken ? `Bearer ${sdkToken}` : '',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('7. supriya get new token', data);
        setSdkToken(data.token || null);
      });
  };

  useEffect(() => {
    if (!sdkToken) return;
    console.log('2. supriya sdk token set', sdkToken);
    const decoded = jwt_decode(sdkToken);
    const expiresAt = decoded?.exp * 1000;
    if (Date.now() >= expiresAt) {
      throw 'Token expired. Pass a new token';
    } else {
      console.log('3. supriya emitting token');
      SDKEvents.emit('sdk-token', sdkToken);
      setTokenExpiresAt(expiresAt);
    }
  }, [sdkToken]);

  useEffect(() => {
    if (!tokenExpiresAt) return;

    const timer = setInterval(() => {
      const diffInSeconds = Math.floor(
        Math.abs(tokenExpiresAt - Date.now()) / 1000,
      );
      console.log('4. supriya diff: ', diffInSeconds);
      // const minutesLeft = Math.floor(diffInSeconds / 60) % 60;
      // const secondsLeft = (diffInSeconds - minutes * 60) % 60;

      if (diffInSeconds < REFRESH_TOKEN_DURATION_IN_SEC) {
        console.log('5 . supriya 1 min range reached');
        try {
          getNewToken();
          clearInterval(timer);
        } catch (error) {
          clearInterval(timer);
        }
      }
    }, 1000);

    return () => {
      console.log('6. supriya timer unmounted for', tokenExpiresAt);
      clearInterval(timer);
    };
  }, [tokenExpiresAt]);

  return (
    <>
      {initialized ? (
        <CustomizationProvider value={fpe}>
          <App />
        </CustomizationProvider>
      ) : (
        <View style={styles.overlay}>
          <Text style={styles.loadingText}>Initializing app...</Text>
          <ActivityIndicator
            size="large"
            color={$config.SECONDARY_FONT_COLOR}
          />
        </View>
      )}
    </>
  );
};

export default SDKAppWrapper;

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
