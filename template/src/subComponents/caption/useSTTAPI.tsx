import React, {useContext} from 'react';
import StorageContext from '../../components/StorageContext';
import {useRoomInfo} from '../../components/room-info/useRoomInfo';
import {type LanguageTranslationConfig} from './useCaption';
import {PropsContext, useLocalUid} from '../../../agora-rn-uikit';
import {logger, LogSource} from '../../logger/AppBuilderLogger';
import getUniqueID from '../../utils/getUniqueID';
import {buildSTTRequestBody, type STTMethod} from './sttRequestBody';
import {
  ensureSTTSessionId,
  rotateSTTSessionId,
  wasSTTSessionIdFreshlyCreated,
  markSTTSessionIdUsed,
} from './sttSessionId';
import {TRANSCRIPT_JOURNEY} from './transcriptJourney';

export interface STTAPIResponse {
  success: boolean;
  data?: any;
  httpStatus?: number;
  // session_id that was sent on this request. Included so callers can
  // emit the id in their own Datadog breadcrumbs without having to
  // re-read the coordinator cache (which may have rotated between the
  // request leaving and the caller reading).
  sessionId?: string;
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

const shouldRotateSessionId = (result: STTAPIResponse) =>
  result.error?.code === 631;

// Status values returned by /v1/stt-transcript that mean the session_id
// has moved past 'active' in the backend's ledger and should not be reused
// for a new startv7. See managed-service `storage/postgres/stt.go` status
// enum: STARTED/INPROGRESS are active; the remaining states below are
// stopped or processing artifacts and cannot resume live transcription.
const ENDED_STT_STATUSES = new Set<string>([
  'COMPLETED',
  'FAILED',
  'ARTIFACTS_PENDING',
  'PROCESSING',
]);
// Bound the optional lookup to the latest 50 sessions. Older entries can be
// missed, so startv7's 631 response remains the authoritative fallback.
const PREFLIGHT_PAGE_LIMIT = 50;
const PREFLIGHT_TIMEOUT_MS = 3000;

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
    attempt?: number,
  ): Promise<STTAPIResponse> => {
    const requestId = getUniqueID();
    const startReqTs = Date.now();
    const channelName = rtcPropsRef?.current?.channel || '';
    let sessionId: string | undefined;
    const requestContext = () => ({
      channelName,
      sessionId: sessionId ?? null,
      botUid,
      method,
      attempt: attempt ?? null,
      requestId,
    });

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

      sessionId = requestBody.session_id;
      if (method === 'startv7') {
        logger.log(
          LogSource.NetworkRest,
          'stt',
          `${TRANSCRIPT_JOURNEY} STT start attempt`,
          {
            ...requestContext(),
            isFreshlyCreated: wasSTTSessionIdFreshlyCreated(channelName),
          },
        );
      }

      console.log(
        `${TRANSCRIPT_JOURNEY} [STT_BOT_SUBSCRIPTION] ${method.toUpperCase()} - Bot UID: ${botUid} will subscribe to User UID: ${ownerUid}`,
        {
          method,
          botUid,
          ownerUid,
          translationConfig: translationConfig ?? null,
        },
      );
      if (method === 'startv7' && sessionId) {
        markSTTSessionIdUsed(channelName, sessionId);
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
            ...requestContext(),
            startReqTs,
            endReqTs,
            latency,
          },
        );

        return {
          success: false,
          sessionId,
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
          ...requestContext(),
          startReqTs,
          endReqTs,
          latency,
        },
      );

      return {
        success: true,
        sessionId,
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
          ...requestContext(),
          startReqTs,
          endReqTs,
          latency,
        },
      );

      return {
        success: false,
        sessionId,
        error: {
          message: error?.message || 'Unknown error occurred',
          code: error?.code,
        },
      };
    }
  };

  const preflightSessionStatus = async (
    passphrase: string,
    channelName: string,
    sessionId: string,
  ): Promise<void> => {
    if (!passphrase || !channelName || !sessionId) {
      return;
    }
    const url = `${$config.BACKEND_ENDPOINT}/v1/stt-transcript`;
    const body = JSON.stringify({
      passphrase,
      limit: PREFLIGHT_PAGE_LIMIT,
      page: 1,
    });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PREFLIGHT_TIMEOUT_MS);
    try {
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            authorization: tokenRef?.current
              ? `Bearer ${tokenRef?.current}`
              : '',
          },
          body,
        });
      } catch (fetchError) {
        logger.warn(
          LogSource.NetworkRest,
          'stt',
          `${TRANSCRIPT_JOURNEY} STT session pre-flight network error`,
          fetchError ?? null,
        );
        return;
      }
      if (!response.ok) {
        logger.warn(
          LogSource.NetworkRest,
          'stt',
          `${TRANSCRIPT_JOURNEY} STT session pre-flight non-OK response`,
          {httpStatus: response.status},
        );
        return;
      }
      let data: {stts?: Array<{session_id?: string; status?: string}>};
      try {
        data = await response.json();
      } catch (parseError) {
        logger.warn(
          LogSource.NetworkRest,
          'stt',
          `${TRANSCRIPT_JOURNEY} STT session pre-flight body parse error`,
          parseError ?? null,
        );
        return;
      }
      const match = Array.isArray(data?.stts)
        ? data.stts.find(
            entry =>
              entry?.session_id === sessionId &&
              typeof entry.status === 'string' &&
              ENDED_STT_STATUSES.has(entry.status),
          )
        : undefined;
      if (!match) {
        return; // No evidence of staleness on this page; startv7 still validates.
      }
      logger.log(
        LogSource.NetworkRest,
        'stt',
        `${TRANSCRIPT_JOURNEY} STT session pre-flight detected stale id; rotating`,
        {
          channelName,
          staleSessionId: sessionId,
          beStatus: match.status,
        },
      );
      try {
        await rotateSTTSessionId(channelName, sessionId);
      } catch (rotateError) {
        logger.error(
          LogSource.NetworkRest,
          'stt',
          `${TRANSCRIPT_JOURNEY} STT session pre-flight rotation failed`,
          rotateError as any,
        );
      }
    } finally {
      clearTimeout(timeout);
    }
  };

  const start = async (
    botUid: number,
    translationConfig: LanguageTranslationConfig,
  ): Promise<STTAPIResponse> => {
    const retryDelayMs = getStartRetryDelay(botUid);
    const channelName = rtcPropsRef?.current?.channel || '';
    const passphrase =
      roomIdRef?.current?.host || roomIdRef?.current?.attendee || '';
    let result: STTAPIResponse;
    let rotatedOnce = false;
    let requestAttempt = 0;

    // Pre-flight: if we are about to send a session_id that already existed
    // in RTM channel metadata (not one we just minted), check with the
    // backend whether it has moved past 'active' in the ledger. If so, we
    // rotate here to avoid a guaranteed-to-fail startv7 round-trip.
    if (channelName && passphrase) {
      try {
        const cachedSessionId = await ensureSTTSessionId(channelName);
        const isFreshlyCreated = wasSTTSessionIdFreshlyCreated(channelName);
        if (cachedSessionId && !isFreshlyCreated) {
          await preflightSessionStatus(
            passphrase,
            channelName,
            cachedSessionId,
          );
        }
      } catch (preflightError) {
        logger.warn(
          LogSource.NetworkRest,
          'stt',
          `${TRANSCRIPT_JOURNEY} STT session pre-flight skipped`,
          preflightError ?? null,
        );
      }
    }

    for (let attempt = 1; attempt <= STT_START_MAX_ATTEMPTS; attempt += 1) {
      requestAttempt += 1;
      result = await apiCall(
        'startv7',
        botUid,
        translationConfig,
        requestAttempt,
      );

      if (result.success) {
        return result;
      }

      if (
        shouldRotateSessionId(result) &&
        !rotatedOnce &&
        channelName &&
        result.sessionId
      ) {
        const staleSessionId = result.sessionId;
        logger.log(
          LogSource.NetworkRest,
          'stt',
          `${TRANSCRIPT_JOURNEY} Rotating STT session ID after terminal-reuse error`,
          {
            attempt: requestAttempt,
            channelName,
            botUid,
            httpStatus: result.httpStatus ?? null,
            errorCode: result.error?.code ?? null,
            staleSessionId: staleSessionId ?? null,
          },
        );
        try {
          const newSessionId = await rotateSTTSessionId(
            channelName,
            staleSessionId,
          );
          logger.log(
            LogSource.NetworkRest,
            'stt',
            `${TRANSCRIPT_JOURNEY} STT session ID rotated; retrying start`,
            {
              attempt: requestAttempt,
              channelName,
              botUid,
              staleSessionId: staleSessionId ?? null,
              newSessionId,
            },
          );
          rotatedOnce = true;
          attempt -= 1; // Always send a start after rotation, even at the retry limit.
          continue;
        } catch (rotateError) {
          logger.error(
            LogSource.NetworkRest,
            'stt',
            `${TRANSCRIPT_JOURNEY} Failed to rotate STT session ID`,
            rotateError as any,
          );
          return result;
        }
      }

      if (!shouldRetryStart(result) || attempt === STT_START_MAX_ATTEMPTS) {
        return result;
      }

      logger.log(
        LogSource.NetworkRest,
        'stt',
        `${TRANSCRIPT_JOURNEY} Retrying STT start after transient failure`,
        {
          attempt: requestAttempt,
          maxAttempts: STT_START_MAX_ATTEMPTS,
          retryDelayMs,
          channelName,
          sessionId: result.sessionId ?? null,
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
