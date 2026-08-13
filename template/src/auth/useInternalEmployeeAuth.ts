import {useCallback, useContext, useRef, useState} from 'react';
import StorageContext from '../components/StorageContext';
import {isWebInternal} from '../utils/common';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import getUniqueID from '../utils/getUniqueID';
import LocalEventEmitter, {
  LocalEventsEnum,
} from '../rtm-events-api/LocalEvents';
import {
  getActiveInternalEmployeeToken,
  isInternalEmployeeAuthEnabledForApp,
} from './internalEmployeeAuthUtils';

export {
  isInternalEmployeeAuthEnabledForApp,
  isInternalEmployeeVerificationActive,
} from './internalEmployeeAuthUtils';

const INTERNAL_EMPLOYEE_AUTH_PLATFORM_ID = 'turnkey_web';
const INTERNAL_EMPLOYEE_AUTH_COMPLETE_TYPE = 'internal_employee_auth_complete';
const DEFAULT_POPUP_WIDTH = 520;
const DEFAULT_POPUP_HEIGHT = 680;

export interface InternalEmployeeAuthStartResponse {
  auth_url: string;
  expires_at: number;
}

export interface InternalEmployeeAuthCompletePayload {
  type: typeof INTERNAL_EMPLOYEE_AUTH_COMPLETE_TYPE;
  token?: string;
  verified_until?: number;
  error?: string;
}

export interface InternalEmployeeAuthResult {
  token: string;
  verifiedUntil: number;
}

export interface UseInternalEmployeeAuthOptions {
  popupFeatures?: string;
  timeoutMs?: number;
}

export interface UseInternalEmployeeAuthState {
  loading: boolean;
  verifiedUntil: number | null;
  error: string | null;
}

const trimTrailingSlash = (url: string) => url?.replace(/\/+$/, '');

const getBackendOrigin = () => {
  return new URL($config.BACKEND_ENDPOINT).origin;
};

const getFrontendOrigin = () => {
  return window.location.origin;
};

const getDefaultPopupFeatures = () => {
  const openerLeft = window.screenX || window.screenLeft || 0;
  const openerTop = window.screenY || window.screenTop || 0;
  const openerWidth = window.outerWidth || window.innerWidth;
  const openerHeight = window.outerHeight || window.innerHeight;
  const left = Math.max(
    0,
    Math.round(openerLeft + (openerWidth - DEFAULT_POPUP_WIDTH) / 2),
  );
  const top = Math.max(
    0,
    Math.round(openerTop + (openerHeight - DEFAULT_POPUP_HEIGHT) / 2),
  );

  return [
    'popup=yes',
    `width=${DEFAULT_POPUP_WIDTH}`,
    `height=${DEFAULT_POPUP_HEIGHT}`,
    `left=${left}`,
    `top=${top}`,
    'menubar=no',
    'toolbar=no',
    'location=no',
    'status=no',
  ].join(',');
};

const assertInternalEmployeeAuthApp = () => {
  if (!isInternalEmployeeAuthEnabledForApp()) {
    throw new Error('Internal employee auth is not enabled for this app');
  }
};

const parseAPIError = async (response: Response) => {
  try {
    const data = await response.json();
    return data?.error?.message || data?.message || response.statusText;
  } catch {
    return response.statusText;
  }
};

export const getInternalEmployeeAuthStartURL = (originUrl?: string) => {
  assertInternalEmployeeAuthApp();

  const url = new URL(
    `${trimTrailingSlash(
      $config.BACKEND_ENDPOINT,
    )}/v1/internal/employee-auth/start`,
  );
  url.searchParams.set('platform_id', INTERNAL_EMPLOYEE_AUTH_PLATFORM_ID);
  url.searchParams.set('origin_url', originUrl || getFrontendOrigin());
  return url.toString();
};

export const startInternalEmployeeAuth = async (
  token: string,
  originUrl?: string,
): Promise<InternalEmployeeAuthStartResponse> => {
  assertInternalEmployeeAuthApp();

  if (!token) {
    throw new Error('Managed-service token is required');
  }

  const requestId = getUniqueID();
  const startReqTs = Date.now();
  const url = getInternalEmployeeAuthStartURL(originUrl);

  logger.log(
    LogSource.NetworkRest,
    'internal_employee_auth_start',
    'API internal_employee_auth_start Trying to start employee auth',
    {
      requestId,
      startReqTs,
    },
  );

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'X-Project-ID': $config.PROJECT_ID,
      'X-Request-Id': requestId,
      'X-Session-Id': logger.getSessionId(),
    },
  });

  if (!response.ok) {
    const message = await parseAPIError(response);
    logger.error(
      LogSource.NetworkRest,
      'internal_employee_auth_start',
      'API internal_employee_auth_start failed',
      {status: response.status, message},
      {
        requestId,
        startReqTs,
        endReqTs: Date.now(),
      },
    );
    throw new Error(message);
  }

  const data = await response.json();
  if (!data?.auth_url) {
    throw new Error('Employee auth start response did not include auth_url');
  }

  logger.log(
    LogSource.NetworkRest,
    'internal_employee_auth_start',
    'API internal_employee_auth_start successfully done',
    {
      requestId,
      startReqTs,
      endReqTs: Date.now(),
      expiresAt: data?.expires_at,
    },
  );

  return data;
};

export const getDummyInternalFeature = async (token: string) => {
  assertInternalEmployeeAuthApp();

  if (!token) {
    throw new Error('Upgraded managed-service token is required');
  }

  const response = await fetch(
    `${trimTrailingSlash($config.BACKEND_ENDPOINT)}/v1/internal/feature/dummy`,
    {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`,
        'X-Project-ID': $config.PROJECT_ID,
      },
    },
  );

  const data = await response.json();
  if (!response.ok || data?.error) {
    throw new Error(data?.error?.message || response.statusText);
  }
  return data;
};

const useInternalEmployeeAuth = () => {
  const {store, setStore} = useContext(StorageContext);
  const [state, setState] = useState<UseInternalEmployeeAuthState>({
    loading: false,
    verifiedUntil: null,
    error: null,
  });
  const inProgressRef = useRef(false);
  const popupRef = useRef<Window | null>(null);

  const completeAuth = useCallback(
    (token: string, verifiedUntil: number) => {
      setStore?.(prevState => ({
        ...prevState,
        token,
        internalEmployeeToken: token,
        internalEmployeeVerifiedUntil: verifiedUntil,
      }));
      LocalEventEmitter.emit(LocalEventsEnum.SDK_TOKEN_CHANGED, token);
      setState({
        loading: false,
        verifiedUntil,
        error: null,
      });
    },
    [setStore],
  );

  const authenticate = useCallback(
    async (
      options: UseInternalEmployeeAuthOptions = {},
    ): Promise<InternalEmployeeAuthResult> => {
      if (!isWebInternal()) {
        throw new Error('Internal employee auth is only supported on web');
      }
      assertInternalEmployeeAuthApp();

      if (inProgressRef.current) {
        throw new Error('Internal employee auth is already in progress');
      }
      if (!store?.token) {
        throw new Error('Managed-service token is required');
      }

      inProgressRef.current = true;
      setState(prevState => ({
        ...prevState,
        loading: true,
        error: null,
      }));

      try {
        popupRef.current = window.open(
          '',
          'agora-internal-employee-auth',
          options.popupFeatures || getDefaultPopupFeatures(),
        );

        if (!popupRef.current) {
          throw new Error('Employee auth popup was blocked');
        }

        const startResponse = await startInternalEmployeeAuth(
          store.token,
          getFrontendOrigin(),
        );
        const backendOrigin = getBackendOrigin();
        const timeoutFromExpiry =
          startResponse.expires_at > 0
            ? Math.max(startResponse.expires_at * 1000 - Date.now(), 1000)
            : undefined;
        const timeoutMs =
          options.timeoutMs || timeoutFromExpiry || 5 * 60 * 1000;

        if (!popupRef.current || popupRef.current.closed) {
          throw new Error('Employee auth popup was closed');
        }

        return await new Promise<InternalEmployeeAuthResult>(
          (resolve, reject) => {
            let closedInterval: ReturnType<typeof setInterval> | null = null;
            let timeout: ReturnType<typeof setTimeout> | null = null;

            const cleanup = () => {
              window.removeEventListener('message', onMessage);
              if (closedInterval) {
                clearInterval(closedInterval);
              }
              if (timeout) {
                clearTimeout(timeout);
              }
              inProgressRef.current = false;
            };

            const fail = (error: Error) => {
              cleanup();
              setState(prevState => ({
                ...prevState,
                loading: false,
                error: error.message,
              }));
              reject(error);
            };

            const onMessage = (event: MessageEvent) => {
              if (event.origin !== backendOrigin) {
                return;
              }

              const payload = event.data as InternalEmployeeAuthCompletePayload;
              if (payload?.type !== INTERNAL_EMPLOYEE_AUTH_COMPLETE_TYPE) {
                return;
              }

              if (payload.error) {
                fail(new Error(payload.error));
                return;
              }

              if (!payload.token || !payload.verified_until) {
                fail(new Error('Employee auth completion payload is invalid'));
                return;
              }

              cleanup();
              completeAuth(payload.token, payload.verified_until);
              popupRef.current?.close();
              resolve({
                token: payload.token,
                verifiedUntil: payload.verified_until,
              });
            };

            window.addEventListener('message', onMessage);
            popupRef.current.location.href = startResponse.auth_url;

            closedInterval = setInterval(() => {
              if (popupRef.current?.closed) {
                fail(new Error('Employee auth popup was closed'));
              }
            }, 500);

            timeout = setTimeout(() => {
              fail(new Error('Employee auth session expired'));
              popupRef.current?.close();
            }, timeoutMs);
          },
        );
      } catch (error) {
        inProgressRef.current = false;
        const message =
          error instanceof Error
            ? error.message
            : 'Internal employee auth failed';
        popupRef.current?.close();
        setState(prevState => ({
          ...prevState,
          loading: false,
          error: message,
        }));
        throw error;
      }
    },
    [completeAuth, store?.token],
  );

  const checkDummyInternalFeature = useCallback(async () => {
    const token = getActiveInternalEmployeeToken(store) || store?.token;
    return getDummyInternalFeature(token);
  }, [store]);

  return {
    ...state,
    authenticate,
    checkDummyInternalFeature,
  };
};

export default useInternalEmployeeAuth;
