import React, {useContext} from 'react';
import StorageContext from '../../components/StorageContext';
import {useRoomInfo} from '../../components/room-info/useRoomInfo';
import {LanguageTranslationConfig} from './useCaption';
import {PropsContext, useLocalUid} from '../../../agora-rn-uikit';
import {logger, LogSource} from '../../logger/AppBuilderLogger';
import getUniqueID from '../../utils/getUniqueID';

export interface STTAPIResponse {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code?: number;
  };
}

interface IuseSTTAPI {
  start: (
    botUid: number,
    translationConfig: LanguageTranslationConfig,
  ) => Promise<STTAPIResponse>;
  update: (
    botUid: number,
    translationConfig: LanguageTranslationConfig,
  ) => Promise<STTAPIResponse>;
  stop: (botUid: number) => Promise<STTAPIResponse>;
}

const useSTTAPI = (): IuseSTTAPI => {
  const {store} = React.useContext(StorageContext);
  const {
    data: {roomId},
  } = useRoomInfo();
  const {rtcProps} = useContext(PropsContext);
  const STT_API_URL = `${$config.BACKEND_ENDPOINT}/v1/stt`;
  const localUid = useLocalUid();

  const roomIdRef = React.useRef(roomId);
  React.useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  const localUidRef = React.useRef(localUid);
  React.useEffect(() => {
    localUidRef.current = localUid;
  }, [localUid]);

  const tokenRef = React.useRef(store.token);
  React.useEffect(() => {
    tokenRef.current = store.token;
  }, [store.token]);

  const rtcPropsRef = React.useRef(rtcProps);
  React.useEffect(() => {
    rtcPropsRef.current = rtcProps;
  }, [rtcProps]);

  const apiCall = async (
    method: 'startv7' | 'update' | 'stopv7',
    botUid: number,
    translationConfig?: LanguageTranslationConfig,
  ): Promise<STTAPIResponse> => {
    const requestId = getUniqueID();
    const startReqTs = Date.now();

    try {
      // Calculate which user this bot belongs to
      const ownerUid = botUid - 900000000;

      let requestBody: any = {
        passphrase:
          roomIdRef?.current?.host || roomIdRef?.current?.attendee || '',
        dataStream_uid: botUid,
        encryption_mode: $config.ENCRYPTION_ENABLED
          ? rtcPropsRef?.current.encryption.mode
          : null,
      };

      console.log(
        `[STT_BOT_SUBSCRIPTION] ${method.toUpperCase()} - Bot UID: ${botUid} will subscribe to User UID: ${ownerUid}`,
        {
          method,
          botUid,
          ownerUid,
          translationConfig,
        },
      );
      // Add translate_config only for start/update methods
      if (translationConfig?.source?.[0]) {
        requestBody.lang = translationConfig.source;
        // Sanitize payload: remove source language from targets to avoid API errors
        const sanitizedTargets =
          translationConfig?.targets?.filter(
            target => target !== translationConfig?.source[0],
          ) || [];
        const shouldTranslate = sanitizedTargets.length > 0;
        // Add translate_config payload only if targets exist
        if (shouldTranslate) {
          requestBody.translate_config = [
            {
              source_lang: translationConfig.source[0],
              target_lang: sanitizedTargets,
            },
          ];
          if (method === 'update') {
            requestBody.translate = true;
          }
        } else if (method === 'update') {
          // If method is update and no targets are passed
          requestBody.translate = false;
        }
        requestBody.subscribeAudioUids = [`${localUidRef.current}`];
      }

      const response = await fetch(`${STT_API_URL}/${method}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: tokenRef?.current ? `Bearer ${tokenRef?.current}` : '',
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

      // Check if response has error
      if (res?.error?.message) {
        return {
          success: false,
          error: {
            message: res.error.message,
            code: res.error.code,
          },
          data: res,
        };
      }

      return {
        success: true,
        data: res,
      };
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

      return {
        success: false,
        error: {
          message: error?.message || 'Unknown error occurred',
          code: error?.code,
        },
      };
    }
  };

  const start = async (
    botUid: number,
    translationConfig: LanguageTranslationConfig,
  ): Promise<STTAPIResponse> => {
    return await apiCall('startv7', botUid, translationConfig);
  };

  const update = async (
    botUid: number,
    translationConfig: LanguageTranslationConfig,
  ): Promise<STTAPIResponse> => {
    return await apiCall('update', botUid, translationConfig);
  };

  const stop = async (botUid: number): Promise<STTAPIResponse> => {
    return await apiCall('stopv7', botUid);
  };

  return {
    start,
    stop,
    update,
  };
};

export default useSTTAPI;
