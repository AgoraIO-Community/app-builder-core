export const SCREENSHARE_JOURNEY = '[SCREENSHARE_JOURNEY]';

export type ScreenshareLayoutSwitchReason =
  | 'screenshare start'
  | 'screenshare stop'
  | 'screenshare recover';

/**
 * Message + fields for Datadog correlation of screenshare-driven layout changes.
 * Search: `[SCREENSHARE_JOURNEY] layout switched` or `layout unchanged`.
 */
export const getScreenshareLayoutSwitchLog = (
  reason: ScreenshareLayoutSwitchReason,
  fromLayout: string,
  toLayout: string,
) => {
  const layoutSwitched = fromLayout !== toLayout;
  return {
    message: layoutSwitched
      ? `${SCREENSHARE_JOURNEY} layout switched from ${fromLayout} to ${toLayout} (${reason})`
      : `${SCREENSHARE_JOURNEY} layout unchanged at ${fromLayout} (${reason})`,
    fields: {
      stage: 'layout_update' as const,
      reason,
      fromLayout,
      toLayout,
      layoutSwitched,
    },
  };
};

export const getScreenshareSessionBoundaryMessage = (
  boundary: 'start' | 'end',
  screenshareSessionId: string,
) =>
  `----- ${SCREENSHARE_JOURNEY} SCREEN SHARE SESSION ${boundary.toUpperCase()} | sessionId=${screenshareSessionId} -----`;

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
