import React, {useEffect, useState} from 'react';
import {CustomizationApiInterface, customize} from 'customization-api';
import {
  customizationConfig,
  CustomizationProvider,
} from 'customization-implementation';
import SDKEvents from './utils/SdkEvents';
import App from './App';
import {StyleSheet, View, Text, ActivityIndicator} from 'react-native';
import useTokenServerAuth from './auth/useTokenServerAuth';

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
  'server-token': (token: string) => void;
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
  const {setServerToken, validateToken} = useTokenServerAuth();
  const [initialized, setInitialized] = React.useState(false);
  const [options, setSdkOptions] = React.useState<OptionsInterface>();

  useEffect(() => {
    if (!initialized) return;
    if ($config.ENABLE_TOKEN_SERVER) {
      SDKEvents.emit('server-token', options.token);
      setServerToken(options.token);
    }
  }, [initialized]);

  useEffect(() => {
    SDKEvents.on('appInit', async (options, resolve, reject) => {
      try {
        $config.ENABLE_TOKEN_SERVER && validateToken(options);
        setSdkOptions(options);
        setInitialized(true);
        resolve(true);
      } catch (error) {
        setInitialized(false);
        reject(`Error initializing app builder ${error}`);
      }
    });
    SDKEvents.on('addFpe', (sdkFpeConfig) => {
      setFpe(sdkFpeConfig);
    });
    SDKEvents.emit('addFpeInit');
    // Join event consumed in Create.tsx
  }, []);

  return (
    <>
      {initialized ? (
        <CustomizationProvider value={fpe}>
          <App />
        </CustomizationProvider>
      ) : (
        <></>
        // <View style={styles.overlay}>
        // <Text style={styles.loadingText}>Initializing app...</Text>
        // <ActivityIndicator
        //   size="large"
        //   color={$config.SECONDARY_FONT_COLOR}
        // />
        // </View>
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
