import React, {useContext} from 'react';
import StorageContext from '../../../components/StorageContext';
import {useRoomInfo} from '../../../components/room-info/useRoomInfo';
import {useSonioxCaption} from './useSonioxCaption';
import events, {PersistanceLevel} from '../../../rtm-events-api';
import {EventNames} from '../../../rtm-events';
import {getLanguageLabel, LanguageType} from '../utils';
import useGetName from '../../../utils/useGetName';
import {capitalizeFirstLetter} from '../../../utils/common';
import {PropsContext, useLocalUid} from '../../../../agora-rn-uikit';
import {logger, LogSource} from '../../../logger/AppBuilderLogger';
import getUniqueID from '../../../utils/getUniqueID';
import { project } from '_react-native.config';

interface IuseSonioxSTTAPI {
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
  lang?: LanguageType[];       
  translate_config?: {         
    target_lang: string[];     
    source_lang: string;       
  }[];
  userSelectedTranslation?: string;
}

const useSonioxSTTAPI = (): IuseSonioxSTTAPI => {
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
  } = useSonioxCaption();

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
      'soniox-stt',
      `Trying to ${method} soniox stt`,
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
        dataStream_uid: 222222, // Soniox bot ID
        project_id: '49c705c1c9efb71000d7',// '6iYzn9O9R',
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
        'soniox-stt',
        `Soniox STT API Success - Called ${method}`,
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
        'soniox-stt',
        `Soniox STT API Failure - Called ${method}`,
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

  const start = async (lang: LanguageType[], userOwnLang?: LanguageType[]) => {
    try {
      setIsLangChangeInProgress(true);
      const res = await apiCall('startSoniox', {lang});
      
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
          'soniox-stt',
          `start soniox stt for lang ${lang} failed`,
          res?.error,
        );
      } else {
        setIsSTTError(false);
      }
      
      if (res === null || isSTTAlreadyActive) {
        setIsSTTActive(true);
        setLanguage(lang);
        
        const userSelectedLang = userOwnLang && userOwnLang.length > 0 ? userOwnLang : [];
        const actionText =
          language.indexOf('') !== -1
            ? `has set the spoken language to  "${getLanguageLabel(userSelectedLang)}" (Soniox)`
            : `changed the spoken language from "${getLanguageLabel(
                language,
              )}" to "${getLanguageLabel(userSelectedLang)}" (Soniox)`;
              
        setMeetingTranscript(prev => {
          return [
            ...prev,
            {
              name: 'langUpdate',
              time: new Date().getTime(),
              uid: `langUpdate-${localUid}-soniox`,
              text: actionText,
            },
          ];
        });
      }
      return res;
    } catch (errorMsg) {
      logger.error(
        LogSource.NetworkRest,
        'soniox-stt',
        'There was error in start soniox stt',
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
      setIsSTTActive(false);
      if (res?.error?.message) {
        setIsSTTError(true);
      } else {
        setIsSTTError(false);
      }
      return res;
    } catch (error) {
      logger.error(
        LogSource.NetworkRest,
        'soniox-stt',
        'There was error in stop soniox stt',
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
      await update({
        ...translationConfig,
        lang: lang,
      });
      setLanguage(lang);
      return Promise.resolve();
    } catch (error) {
      logger.error(
        LogSource.NetworkRest,
        'soniox-stt',
        'There was error error in re-starting Soniox STT',
        error,
      );
      return Promise.reject(error);
    } finally {
      setIsLangChangeInProgress(false);
    }
  };

  const update = async (params: UpdateParams) => {
    try {
      setIsLangChangeInProgress(true);
      const res = await apiCall('update', params);
      
      if (res?.error?.message) {
        setIsSTTError(true);
      } else {
        setIsSTTError(false);
        if (params.lang) {
          setLanguage(params.lang);
        }
      }
      return res;
    } catch (error) {
      logger.error(
        LogSource.NetworkRest,
        'soniox-stt',
        'Error in Soniox STT update method',
        error,
      );
      throw error;
    } finally {
      setIsLangChangeInProgress(false);
    }
  };

  const isAuthorizedSTTUser = () =>
    $config.ENABLE_STT &&
    $config.ENABLE_CAPTION &&
    $config.ENABLE_SONIOX_STT &&
    (isHost || (!isHost && isSTTActive));

  const isAuthorizedTranscriptUser = () =>
    $config.ENABLE_STT &&
    $config.ENABLE_CAPTION &&
    $config.ENABLE_MEETING_TRANSCRIPT &&
    $config.ENABLE_SONIOX_STT &&
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

export default useSonioxSTTAPI;