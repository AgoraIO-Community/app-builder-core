import React from 'react';
import StorageContext from '../../components/StorageContext';
import {useMeetingInfo} from '../../components/meeting-info/useMeetingInfo';
import {useCaption} from './useCaption';
import events, {EventPersistLevel} from '../../rtm-events-api';
import {EventNames} from '../../rtm-events';
import {LanguageType} from './utils';

interface IuseSTTAPI {
  start: () => Promise<{message: string} | null>;
  stop: () => Promise<void>;
  restart: () => Promise<void>;
  isAuthorizedSTTUser: () => boolean;
}

const useSTTAPI = (): IuseSTTAPI => {
  const {store} = React.useContext(StorageContext);
  const {
    data: {roomId, isHost},
  } = useMeetingInfo();
  const {language, isSTTActive, setIsSTTActive, setIsLangChangeInProgress} =
    useCaption();

  const currentLangRef = React.useRef<LanguageType[]>([]);
  const STT_API_URL = `${$config.BACKEND_ENDPOINT}/v1/stt`;

  React.useEffect(() => {
    currentLangRef.current = language;
  }, [language]);

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
        lang: currentLangRef.current.join(','),
        dataStream_uid: 111111, // bot ID
      }),
    });
    const res = await response.json();
    return res;
  };

  const startWithDelay = (): Promise<string> =>
    new Promise((resolve) => {
      setTimeout(async () => {
        const res = await start();
        resolve(res);
      }, 1000); // Delay of 1 seconds (1000 milliseconds) to allow existing stt service to fully stop
    });

  const start = async () => {
    try {
      setIsLangChangeInProgress(true);
      const res = await apiCall('start');
      console.log('response aftet start api call', res);
      // null means stt startred successfully
      if (res === null) {
        // once STT is active in the channel , notify others so that they dont' trigger start again
        events.send(
          EventNames.STT_ACTIVE,
          JSON.stringify({active: true}),
          EventPersistLevel.LEVEL2,
        );

        setIsSTTActive(true);
      }
      return res;
    } catch (errorMsg) {
      throw errorMsg;
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
        EventPersistLevel.LEVEL3,
      );
      setIsSTTActive(false);
      return res;
    } catch (error) {
      throw error;
    }
  };
  const restart = async () => {
    try {
      setIsLangChangeInProgress(true);
      await stop();
      await startWithDelay();
      return Promise.resolve();
    } catch (error) {
      console.log('error in re-starting STT', error);
      return Promise.reject(error);
    } finally {
      setIsLangChangeInProgress(false);
    }
  };

  // attendee can view option if any host has started STT
  const isAuthorizedSTTUser = () =>
    $config.ENABLE_STT && (isHost || (!isHost && isSTTActive));

  return {start, stop, restart, isAuthorizedSTTUser};
};

export default useSTTAPI;
