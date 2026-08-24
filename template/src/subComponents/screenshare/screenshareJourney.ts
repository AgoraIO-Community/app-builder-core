export const SCREENSHARE_JOURNEY = '[SCREENSHARE_JOURNEY]';

export const getScreenshareSessionId = (
  action: 'start' | 'stop',
  activeScreenshareSessionId: string | null,
  createId: () => string,
) =>
  action === 'stop' && activeScreenshareSessionId
    ? activeScreenshareSessionId
    : createId();

export const getScreenshareReleaseOrigin = (
  requestedOrigin: 'end_call_cleanup' | 'page_unload' | undefined,
  documentVisibilityState?: DocumentVisibilityState,
) =>
  requestedOrigin ||
  (documentVisibilityState === 'hidden' ? 'page_unload' : 'end_call_cleanup');

export const getScreenshareError = (error: unknown) => {
  const value = error as {
    code?: string;
    name?: string;
    message?: string;
    toString?: () => string;
  };
  return {
    sdkErrorCode: value?.code || '',
    sdkErrorName: value?.name || '',
    sdkErrorMessage:
      value?.message || value?.toString?.() || 'Unknown screenshare error',
  };
};

export const isUserCancelOrPermissionDenied = (error: unknown) => {
  const {sdkErrorCode, sdkErrorName, sdkErrorMessage} =
    getScreenshareError(error);
  return (
    sdkErrorCode === 'PERMISSION_DENIED' ||
    sdkErrorName === 'NotAllowedError' ||
    sdkErrorMessage.includes('NotAllowedError') ||
    sdkErrorMessage.includes('PERMISSION_DENIED')
  );
};
