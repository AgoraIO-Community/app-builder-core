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
  start: (lang: LanguageType[], userOwnLang?: LanguageType[]) => Promise<{message: string} | null>;
  stop: () => Promise<void>;
  restart: (
    lang: LanguageType[], 
    userOwnLang?: LanguageType[], 
    translationConfig?: { translate_config: any[], userSelectedTranslation: string }
  ) => Promise<void>;
  update: (params: UpdateParams) => Promise<any>;
  isAuthorizedSTTUser: () => boolean;
  isAuthorizedTranscriptUser: () => boolean;
}

interface UpdateParams {
  // Speaking language (max 4 allowed)
  lang?: LanguageType[];       
  // Translation configuration parameters
  translate_config?: {         
    target_lang: string[];     
    source_lang: string;       
  }[];
  // User's own selected translation language (for RTM message)
  userSelectedTranslation?: string;
  // Flag to indicate if this is a translation-only change
  isTranslationChange?: boolean;
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
    setIsTranslationChangeInProgress,
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

  const apiCall = async (method: string, payload?: any) => {
    const requestId = getUniqueID();
    const startReqTs = Date.now();
    
    logger.log(
      LogSource.NetworkRest,
      'stt',
      `Trying to ${method} stt`,
      {
        method,
        payload,
        requestId,
        startReqTs,
      },
    );
    
    try {
      
      let requestBody: any = {
        passphrase: roomId?.host || '',
        dataStream_uid: 111111, // default bot ID
        encryption_mode: $config.ENCRYPTION_ENABLED
          ? rtcProps.encryption.mode
          : null,
      };

    
      if (payload && typeof payload === 'object') {
        requestBody = {
          ...requestBody,
          ...payload,
        };
      }

      const response = await fetch(`${STT_API_URL}/${method}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: store.token ? `Bearer ${store.token}` : '',
          'X-Request-Id': requestId,
          'X-Session-Id': logger.getSessionId(),
        },
        body: JSON.stringify(requestBody),
      });
      
      const res = await response.json();
      const endReqTs = Date.now();
      const latency = endReqTs - startReqTs;
      
      logger.log(
        LogSource.NetworkRest,
        'stt',
        `STT API Success - Called ${method}`,
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
        `STT API Failure - Called ${method}`,
        error,
        {
          requestId,
          startReqTs,
          endReqTs,
          latency,
        },
      );
      throw error;
    }
  };

  const startWithDelay = (lang: LanguageType[], userOwnLang?: LanguageType[]): Promise<string> =>
    new Promise(resolve => {
      setTimeout(async () => {
        const res = await start(lang, userOwnLang);
        resolve(res);
      }, 1000); // Delay of 1 seconds (1000 milliseconds) to allow existing stt service to fully stop
    });

  const start = async (lang: LanguageType[], userOwnLang?: LanguageType[]) => {
    try {
      setIsLangChangeInProgress(true);
      const res = await apiCall('startv7', {lang});
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
        // Send RTM message with all languages and user's own selection as remoteLang
        // From other users' perspective, userOwnLang are the new remote languages
        const userSelectedLang = userOwnLang && userOwnLang.length > 0 ? userOwnLang : [];
        
        events.send(
          EventNames.STT_LANGUAGE,
          JSON.stringify({
            username: capitalizeFirstLetter(username),
            uid: localUid,
            prevLang: language,
            newLang: lang, // Send all languages
            remoteLang: userSelectedLang, // Send user's own selection as remote for others
          }),
          PersistanceLevel.Sender,
        );
        
        // Set the user's language state to ALL languages (own + protected)
        // This allows the popup to properly identify protected languages
        setLanguage(lang);

        // updaing transcript for self
        const actionText =
          language.indexOf('') !== -1
            ? `has set the spoken language to  "${getLanguageLabel(userSelectedLang)}" `
            : `changed the spoken language from "${getLanguageLabel(
                language,
              )}" to "${getLanguageLabel(userSelectedLang)}" `;
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
      const res = await apiCall('stopv7');
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
  const restart = async (
    lang: LanguageType[], 
    userOwnLang?: LanguageType[], 
    translationConfig?: { translate_config: any[], userSelectedTranslation: string }
  ) => {
    try {
      setIsLangChangeInProgress(true);
    //  await stop();
      
      // If translation config is provided, use update method after start
      
       // await startWithDelay(lang, userOwnLang);
        await update({
          ...translationConfig,
          lang: lang,
        });
      
        const userSelectedLang = userOwnLang && userOwnLang.length > 0 ? userOwnLang : [];
        
        events.send(
          EventNames.STT_LANGUAGE,
          JSON.stringify({
            username: capitalizeFirstLetter(username),
            uid: localUid,
            prevLang: language,
            newLang: lang, // Send all languages
            remoteLang: userSelectedLang, // Send user's own selection as remote for others
          }),
          PersistanceLevel.Sender,
        );

         setLanguage(lang);

        // updaing transcript for self
        const actionText =
          language.indexOf('') !== -1
            ? `has set the spoken language to  "${getLanguageLabel(userSelectedLang)}" `
            : `changed the spoken language from "${getLanguageLabel(
                language,
              )}" to "${getLanguageLabel(userSelectedLang)}" `;
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

 
  const update = async (params: UpdateParams) => {
    try {
      // Use the appropriate progress state based on the type of change
      if (params?.isTranslationChange) {
        setIsTranslationChangeInProgress(true);
      } else {
        setIsLangChangeInProgress(true);
      }
      
      logger.log(
        LogSource.NetworkRest,
        'stt',
        'Calling STT update method',
        { params }
      );
      
      const res = await apiCall('update', params);
      
      if (res?.error?.message) {
        setIsSTTError(true);
        logger.error(
          LogSource.NetworkRest,
          'stt',
          'STT update failed',
          res?.error,
        );
      } else {
        logger.log(
          LogSource.NetworkRest,
          'stt',
          'STT update successful',
          res,
        );
        setIsSTTError(false);
        
        // If language was updated, update local state
        if (params.lang) {
          setLanguage(params.lang);
        }

        // Send RTM message for translation config sync
        if (params.translate_config && params.userSelectedTranslation) {
          // Create user's own translation config from userSelectedTranslation
          const userOwnTranslateConfig = (params.lang || currentLangRef.current).map(spokenLang => ({
            source_lang: spokenLang,
            target_lang: [params.userSelectedTranslation]
          }));

          events.send(
            EventNames.STT_TRANSLATE_LANGUAGE,
            JSON.stringify({
              username: capitalizeFirstLetter(username),
              uid: localUid,
              translateConfig: userOwnTranslateConfig, // Only user's own choice
            }),
            PersistanceLevel.Sender,
          );
        }
      }
      
      return res;
    } catch (error) {
      logger.error(
        LogSource.NetworkRest,
        'stt',
        'Error in STT update method',
        error,
      );
      throw error;
    } finally {
      // Reset the appropriate progress state based on the type of change
      if (params?.isTranslationChange) {
        setIsTranslationChangeInProgress(false);
      } else {
        setIsLangChangeInProgress(false);
      }
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
    update,
    isAuthorizedSTTUser,
    isAuthorizedTranscriptUser,
  };
};

export default useSTTAPI;
