import React, {useContext} from 'react';
import StorageContext from '../../components/StorageContext';
import {useRoomInfo} from '../../components/room-info/useRoomInfo';
import {useCaption} from './useCaption';
import events, {PersistanceLevel} from '../../rtm-events-api';
import {EventNames} from '../../rtm-events';
import {getLanguageLabel, LanguageType} from './utils';
import useGetName from '../../utils/useGetName';
import {capitalizeFirstLetter} from '../../utils/common';
import {PropsContext, useLocalUid} from '../../../agora-rn-uikit';
import {logger, LogSource} from '../../logger/AppBuilderLogger';
import getUniqueID from '../../utils/getUniqueID';

interface IuseSTTAPI {
  start: (lang: LanguageType[]) => Promise<{message: string} | null>;
  stop: () => Promise<void>;
  restart: (lang: LanguageType[]) => Promise<void>;
  isAuthorizedSTTUser: () => boolean;
  isAuthorizedTranscriptUser: () => boolean;
}

const useSTTAPI = (): IuseSTTAPI => {
  const {store} = React.useContext(StorageContext);
  const {
    data: {roomId, isHost},
  } = useRoomInfo();
  const {
    language,
    isSTTActive,
    setIsSTTActive,
    setIsLangChangeInProgress,
    setLanguage,
    setMeetingTranscript,
    setIsSTTError,
  } = useCaption();

  const currentLangRef = React.useRef<LanguageType[]>([]);
  const STT_API_URL = `${$config.BACKEND_ENDPOINT}/v1/stt`;
  const username = useGetName();
  const localUid = useLocalUid();
  const {rtcProps} = useContext(PropsContext);

  React.useEffect(() => {
    currentLangRef.current = language;
  }, [language]);

  const apiCall = async (method: string, lang: LanguageType[] = []) => {
    const requestId = getUniqueID();
    const startReqTs = Date.now();
    logger.log(
      LogSource.NetworkRest,
      'stt',
      `Trying to ${method} stt for lang ${lang}`,
      {
        method,
        lang,
        requestId,
        startReqTs,
      },
    );
    try {
      const response = await fetch(`${STT_API_URL}/${method}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: store.token ? `Bearer ${store.token}` : '',
          'X-Request-Id': requestId,
          'X-Session-Id': logger.getSessionId(),
        },
        body: JSON.stringify({
          passphrase: roomId?.host || '',
          lang: lang,
          dataStream_uid: 111111, // bot ID
          encryption_mode: $config.ENCRYPTION_ENABLED
            ? rtcProps.encryption.mode
            : null,
        }),
      });
      const res = await response.json();
      const endReqTs = Date.now();
      const latency = endReqTs - startReqTs;
      logger.log(
        LogSource.NetworkRest,
        'stt',
        `STT API Success - Called ${method} on stt with lang ${lang}`,
        {
          responseData: res,
          requestId,
          startReqTs,
          endReqTs,
          latency,
        },
      );
      return res;
    } catch (error) {
      const endReqTs = Date.now();
      const latency = endReqTs - startReqTs;
      logger.error(
        LogSource.NetworkRest,
        'stt',
        `STT API Failure - Called ${method} on stt with lang ${lang}`,
        error,
        {
          requestId,
          startReqTs,
          endReqTs,
          latency,
        },
      );
    }
  };

  const startWithDelay = (lang: LanguageType[]): Promise<string> =>
    new Promise(resolve => {
      setTimeout(async () => {
        const res = await start(lang);
        resolve(res);
      }, 1000); // Delay of 1 seconds (1000 milliseconds) to allow existing stt service to fully stop
    });

  const start = async (lang: LanguageType[]) => {
    try {
      setIsLangChangeInProgress(true);
      const res = await apiCall('start', lang);
      // null means stt startred successfully
      const isSTTAlreadyActive =
        res?.error?.message
          ?.toLowerCase()
          .indexOf('current status is STARTED') !== -1 ||
        res?.error?.code === 610 ||
        false;

      if (res?.error?.message && res?.error?.code !== 610) {
        setIsSTTError(true);
        logger.error(
          LogSource.NetworkRest,
          'stt',
          `start stt for lang ${lang} failed`,
          res?.error,
        );
      } else {
        logger.log(
          LogSource.NetworkRest,
          'stt',
          `start stt for lang ${lang} succesfull`,
          res,
        );
        setIsSTTError(false);
      }
      if (res === null || isSTTAlreadyActive) {
        // once STT is active in the channel , notify others so that they dont' trigger start again
        events.send(
          EventNames.STT_ACTIVE,
          JSON.stringify({active: true}),
          PersistanceLevel.Sender,
        );
        setIsSTTActive(true);
        logger.debug(
          LogSource.NetworkRest,
          'stt',
          `stt lang update from: ${language} to ${lang}`,
        );
        // inform about the language set for stt
        events.send(
          EventNames.STT_LANGUAGE,
          JSON.stringify({
            username: capitalizeFirstLetter(username),
            uid: localUid,
            prevLang: language,
            newLang: lang,
          }),
          PersistanceLevel.Sender,
        );
        setLanguage(lang);

        // updaing transcript for self
        const actionText =
          language.indexOf('') !== -1
            ? `has set the spoken language to  "${getLanguageLabel(lang)}" `
            : `changed the spoken language from "${getLanguageLabel(
                language,
              )}" to "${getLanguageLabel(lang)}" `;
        //const msg = `${capitalizeFirstLetter(username)} ${actionText} `;
        setMeetingTranscript(prev => {
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
      logger.error(
        LogSource.NetworkRest,
        'stt',
        'There was error in start stt',
        errorMsg,
      );
      throw errorMsg;
    } finally {
      setIsLangChangeInProgress(false);
    }
  };

  const stop = async () => {
    try {
      const res = await apiCall('stop');
      // once STT is non-active in the channel , notify others so that they dont' trigger start again
      // events.send(
      //   EventNames.STT_ACTIVE,
      //   JSON.stringify({active: false}),
      //   PersistanceLevel.Session,
      // );
      setIsSTTActive(false);
      if (res?.error?.message) {
        setIsSTTError(true);
      } else {
        logger.log(LogSource.NetworkRest, 'stt', 'stop stt succesfull', res);
        setIsSTTError(false);
      }
      return res;
    } catch (error) {
      logger.error(
        LogSource.NetworkRest,
        'stt',
        'There was error in stop stt',
        error,
      );
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
      logger.error(
        LogSource.NetworkRest,
        'stt',
        'There was error error in re-starting STT',
        error,
      );
      return Promise.reject(error);
    } finally {
      setIsLangChangeInProgress(false);
    }
  };

  // attendee can view option if any host has started STT
  const isAuthorizedSTTUser = () =>
    $config.ENABLE_STT &&
    $config.ENABLE_CAPTION &&
    (isHost || (!isHost && isSTTActive));

  const isAuthorizedTranscriptUser = () =>
    $config.ENABLE_STT &&
    $config.ENABLE_CAPTION &&
    $config.ENABLE_MEETING_TRANSCRIPT &&
    (isHost || (!isHost && isSTTActive));

  return {
    start,
    stop,
    restart,
    isAuthorizedSTTUser,
    isAuthorizedTranscriptUser,
  };
};

export default useSTTAPI;
