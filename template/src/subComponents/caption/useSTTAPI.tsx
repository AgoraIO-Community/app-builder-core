import React from 'react';
import StorageContext from '../../components/StorageContext';
import {useMeetingInfo} from '../../components/meeting-info/useMeetingInfo';
import {useCaption} from './useCaption';
import events, {EventPersistLevel} from '../../rtm-events-api';
import {EventNames} from '../../rtm-events';
import {getLanguageLabel, LanguageType} from './utils';
import useGetName from '../../utils/useGetName';
import {capitalizeFirstLetter} from '../../utils/common';
import {useLocalUid} from '../../../agora-rn-uikit';

interface IuseSTTAPI {
  start: (lang: LanguageType[]) => Promise<{message: string} | null>;
  stop: () => Promise<void>;
  restart: (lang: LanguageType[]) => Promise<void>;
  isAuthorizedSTTUser: () => boolean;
}

const useSTTAPI = (): IuseSTTAPI => {
  const {store} = React.useContext(StorageContext);
  const {
    data: {roomId, isHost},
  } = useMeetingInfo();
  const {
    language,
    isSTTActive,
    setIsSTTActive,
    setIsLangChangeInProgress,
    setLanguage,
    setMeetingTranscript,
  } = useCaption();

  const currentLangRef = React.useRef<LanguageType[]>([]);
  const STT_API_URL = `${$config.BACKEND_ENDPOINT}/v1/stt`;
  const username = useGetName();
  const localUid = useLocalUid();

  React.useEffect(() => {
    currentLangRef.current = language;
  }, [language]);

  const apiCall = async (method: string, lang: LanguageType[] = []) => {
    const response = await fetch(`${STT_API_URL}/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: store.token ? `Bearer ${store.token}` : '',
      },
      body: JSON.stringify({
        passphrase: roomId?.host || '',
        lang: lang.join(','),
        dataStream_uid: 111111, // bot ID
      }),
    });
    const res = await response.json();
    return res;
  };

  const startWithDelay = (lang: LanguageType[]): Promise<string> =>
    new Promise((resolve) => {
      setTimeout(async () => {
        const res = await start(lang);
        resolve(res);
      }, 1000); // Delay of 1 seconds (1000 milliseconds) to allow existing stt service to fully stop
    });

  const start = async (lang: LanguageType[]) => {
    try {
      setIsLangChangeInProgress(true);
      const res = await apiCall('start', lang);
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
        console.log(`stt lang update from: ${language} to ${lang}`);
        // inform about the language set for stt
        events.send(
          EventNames.STT_LANGUAGE,
          JSON.stringify({
            username: capitalizeFirstLetter(username),
            uid: localUid,
            prevLang: language,
            newLang: lang,
          }),
          EventPersistLevel.LEVEL3,
        );
        setLanguage(lang);

        // updaing transcript for self
        const actionText =
          language.indexOf('') !== -1
            ? `has set the spoken language to  "${getLanguageLabel(lang)}" `
            : `changed the spoken language from "${getLanguageLabel(
                language,
              )}" to "${getLanguageLabel(lang)}" `;
        const msg = `${capitalizeFirstLetter(username)} ${actionText} `;
        setMeetingTranscript((prev) => {
          return [
            ...prev,
            {
              name: 'langUpdate',
              time: new Date().getTime(),
              uid: `langUpdate-${localUid}`,
              text: actionText,
            },
          ];
        });
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
      // events.send(
      //   EventNames.STT_ACTIVE,
      //   JSON.stringify({active: false}),
      //   EventPersistLevel.LEVEL3,
      // );
      setIsSTTActive(false);
      return res;
    } catch (error) {
      throw error;
    }
  };
  const restart = async (lang: LanguageType[]) => {
    try {
      setIsLangChangeInProgress(true);
      await stop();
      await startWithDelay(lang);
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
