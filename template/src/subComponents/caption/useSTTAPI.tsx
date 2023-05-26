import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import StorageContext from '../../components/StorageContext';
import {useCaption} from './useCaption';
import events, {PersistanceLevel} from '../../rtm-events-api';
import {EventNames} from '../../rtm-events';
import {useRoomInfo} from '../../components/room-info/useRoomInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface IuseSTTAPI {
  start: () => void;
  stop: () => void;
  restart: () => Promise<void>;
}

const useSTTAPI = (): IuseSTTAPI => {
  const {store} = React.useContext(StorageContext);
  const {
    data: {roomId, isHost},
  } = useRoomInfo();
  const {language, setIsSTTActive, setIsLangChangeInProgress} = useCaption();
  const STT_API_URL = `${$config.BACKEND_ENDPOINT}/v1/stt`;

  const apiCall = async (method: string) => {
    const response = await fetch(`${STT_API_URL}/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'ACoac4ccff5c1ea40d29a97fb5b5bd63d78',
        'X-Project-ID': $config.PROJECT_ID,
        authorization: store.token ? `Bearer ${store.token}` : '',
      },
      body: JSON.stringify({
        passphrase: roomId?.host || '',
        lang: language.join(','),
      }),
    });
    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }
    const res = await response.json();
    return res;
  };

  const startWithDelay = (): Promise<string> =>
    new Promise((resolve) => {
      setTimeout(async () => {
        const res = await start();
        resolve(res);
      }, 1000); // Delay of 3 seconds (1000 milliseconds)
    });

  const start = async () => {
    try {
      setIsLangChangeInProgress(true);
      const res = await apiCall('start');
      console.log('response aftet start api call', res);
      await AsyncStorage.setItem('STT_BOT_UID', res.dataStream_uid);
      // once STT is active in the channel , notify others so that they dont' trigger start again
      events.send(
        EventNames.STT_ACTIVE,
        JSON.stringify({active: true}),
        PersistanceLevel.Sender,
      );
      setIsSTTActive(true);
      return res;
    } catch (error) {
      console.log('error in starting STT', error);
    } finally {
      setIsLangChangeInProgress(false);
    }
  };

  const stop = async () => {
    try {
      const res = await apiCall('stop');
      console.log('response aftet start api call', res);
      // once STT is non-active in the channel , notify others so that they dont' trigger start again
      events.send(
        EventNames.STT_ACTIVE,
        JSON.stringify({active: false}),
        PersistanceLevel.Sender,
      );
      setIsSTTActive(false);
      return res;
    } catch (error) {
      console.log('error in stopping STT', error);
    }
  };
  const restart = async () => {
    try {
      setIsLangChangeInProgress(true);
      const r1 = await stop();
      const r2 = await startWithDelay();
      return Promise.resolve();
    } catch (error) {
      console.log('error in re-starting STT', error);
      return Promise.reject(error);
    } finally {
      setIsLangChangeInProgress(false);
    }
  };

  return {start, stop, restart};
};

export default useSTTAPI;
