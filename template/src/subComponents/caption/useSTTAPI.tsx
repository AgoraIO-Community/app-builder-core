import React, {useContext} from 'react';
import StorageContext from '../../components/StorageContext';
import {useRoomInfo} from '../../components/room-info/useRoomInfo';
import {type LanguageTranslationConfig} from './useCaption';
import {PropsContext, useLocalUid} from '../../../agora-rn-uikit';
import {logger, LogSource} from '../../logger/AppBuilderLogger';
import getUniqueID from '../../utils/getUniqueID';
import {buildSTTRequestBody, type STTMethod} from './sttRequestBody';
import {ensureSTTSessionId} from './sttSessionId';
import {TRANSCRIPT_JOURNEY} from './transcriptJourney';

export interface STTAPIResponse {
  success: boolean;
  data?: any;
  httpStatus?: number;
  error?: {
    message: string;
    code?: number;
  };
}

export const STT_START_MAX_ATTEMPTS = 5;
export const STT_START_RETRY_DELAY_MS = 500;
const STT_START_RETRY_SPREAD_MS = 200;

const wait = (delayMs: number) =>
  new Promise<void>(resolve => setTimeout(resolve, delayMs));

const getStartRetryDelay = (botUid: number) =>
  STT_START_RETRY_DELAY_MS + (Math.abs(botUid) % STT_START_RETRY_SPREAD_MS);

const shouldRetryStart = (result: STTAPIResponse) =>
  result.httpStatus === 429 || result.error?.code === 610;

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
    method: STTMethod,
    botUid: number,
    translationConfig?: LanguageTranslationConfig,
  ): Promise<STTAPIResponse> => {
    const requestId = getUniqueID();
    const startReqTs = Date.now();

    try {
      // Calculate which user this bot belongs to
      const ownerUid = botUid - 900000000;

      const requestBody = await buildSTTRequestBody({
        method,
        botUid,
        passphrase:
          roomIdRef?.current?.host || roomIdRef?.current?.attendee || '',
        encryptionMode: $config.ENCRYPTION_ENABLED
          ? rtcPropsRef?.current.encryption.mode
          : null,
        localUid: localUidRef.current,
        channelName: rtcPropsRef?.current?.channel || '',
        translationConfig,
        resolveSessionId: ensureSTTSessionId,
      });

      console.log(
        `${TRANSCRIPT_JOURNEY} [STT_BOT_SUBSCRIPTION] ${method.toUpperCase()} - Bot UID: ${botUid} will subscribe to User UID: ${ownerUid}`,
        {
          method,
          botUid,
          ownerUid,
          translationConfig: translationConfig ?? null,
        },
      );
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

      let res: any;
      try {
        res = await response.json();
      } catch (error) {
        // Some HTTP failures (including 429s) can have an empty/non-JSON body.
        // Preserve the HTTP status so callers can still apply retry policy.
        res = undefined;
      }
      const endReqTs = Date.now();
      const latency = endReqTs - startReqTs;

      const httpStatus = response.status;
      const isHttpFailure =
        response.ok === false ||
        (typeof httpStatus === 'number' && httpStatus >= 400);
      const responseError = res?.error;

      if (isHttpFailure || responseError?.message) {
        const errorPayload = responseError || res;
        const message =
          errorPayload?.message ||
          (httpStatus
            ? `STT request failed with status ${httpStatus}`
            : 'STT request failed');

        logger.error(
          LogSource.NetworkRest,
          'stt',
          `${TRANSCRIPT_JOURNEY} STT API Failure - Called ${method}`,
          errorPayload ?? {message},
          {
            responseData: res ?? null,
            httpStatus,
            requestId,
            startReqTs,
            endReqTs,
            latency,
          },
        );

        return {
          success: false,
          httpStatus,
          error: {
            message,
            code: errorPayload?.code,
          },
          data: res,
        };
      }

      logger.log(
        LogSource.NetworkRest,
        'stt',
        `${TRANSCRIPT_JOURNEY} STT API Success - Called ${method}`,
        {
          responseData: res ?? null,
          httpStatus,
          requestId,
          startReqTs,
          endReqTs,
          latency,
        },
      );

      return {
        success: true,
        httpStatus,
        data: res,
      };
    } catch (error) {
      const endReqTs = Date.now();
      const latency = endReqTs - startReqTs;
      logger.error(
        LogSource.NetworkRest,
        'stt',
        `${TRANSCRIPT_JOURNEY} STT API Failure - Called ${method}`,
        error ?? null,
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
    const retryDelayMs = getStartRetryDelay(botUid);
    let result: STTAPIResponse;

    for (let attempt = 1; attempt <= STT_START_MAX_ATTEMPTS; attempt += 1) {
      result = await apiCall('startv7', botUid, translationConfig);

      if (
        result.success ||
        !shouldRetryStart(result) ||
        attempt === STT_START_MAX_ATTEMPTS
      ) {
        return result;
      }

      logger.log(
        LogSource.NetworkRest,
        'stt',
        `${TRANSCRIPT_JOURNEY} Retrying STT start after transient failure`,
        {
          attempt,
          maxAttempts: STT_START_MAX_ATTEMPTS,
          retryDelayMs,
          botUid,
          httpStatus: result.httpStatus ?? null,
          errorCode: result.error?.code ?? null,
        },
      );
      await wait(retryDelayMs);
    }

    // The loop always returns, but keep the fallback explicit for type safety.
    return {
      success: false,
      error: {message: 'STT start failed after retrying'},
    };
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
