import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import StorageContext from '../../components/StorageContext';
import {useMeetingInfo} from '../../components/meeting-info/useMeetingInfo';
import {useCaption} from './useCaption';
import events, {EventPersistLevel} from '../../rtm-events-api';
import {EventNames} from '../../rtm-events';

interface IuseSTTAPI {
  start: () => void;
  stop: () => void;
  restart: () => void;
}

const useSTTAPI = (): IuseSTTAPI => {
  const {store} = React.useContext(StorageContext);
  const {
    data: {roomId, isHost},
  } = useMeetingInfo();
  const {language, setIsSTTActive} = useCaption();
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
      body: JSON.stringify({passphrase: roomId?.host || '', lang: language}),
    });
    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }
    const res = await response.text();
    return res;
  };

  const startWithDelay = (): Promise<void> =>
    new Promise((resolve) => {
      setTimeout(async () => {
        await start();
        resolve();
      }, 1000); // Delay of 3 seconds (1000 milliseconds)
    });

  const start = async () => {
    try {
      const res = await apiCall('start');
      console.log('response aftet start api call', res);
      // once STT is active in the channel , notify others so that they dont' trigger start again
      events.send(
        EventNames.STT_ACTIVE,
        JSON.stringify({active: true}),
        EventPersistLevel.LEVEL2,
      );
      setIsSTTActive(true);
    } catch (error) {
      console.log('error in starting STT', error);
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
        EventPersistLevel.LEVEL2,
      );
      setIsSTTActive(false);
    } catch (error) {
      console.log('error in stopping STT', error);
    }
  };
  const restart = async () => {
    try {
      //   const res1 = await apiCall('stop');
      //   const res2 = await apiCall('start');
      //   console.log('response aftet start api call', res2);
      //   // once STT is active in the channel , notify others so that they dont' trigger start again
      //   events.send(
      //     'handleCaption',
      //     JSON.stringify({active: true}),
      //     EventPersistLevel.LEVEL2,
      //   );
      //   setIsSTTActive(true);
      const r1 = await stop();
      //const r2 = await start();
      const r2 = await startWithDelay();
      console.log('response after restart  api call', r2);
    } catch (error) {
      console.log('error in re-starting STT', error);
    }
  };

  return {start, stop, restart};
};

export default useSTTAPI;
