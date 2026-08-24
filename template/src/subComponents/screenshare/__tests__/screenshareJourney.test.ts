import {
  getScreenshareError,
  getScreenshareReleaseOrigin,
  getScreenshareSessionId,
  isUserCancelOrPermissionDenied,
  SCREENSHARE_JOURNEY,
} from '../screenshareJourney';

describe('screenshare journey logging', () => {
  it('uses the Datadog filter prefix', () => {
    expect(SCREENSHARE_JOURNEY).toBe('[SCREENSHARE_JOURNEY]');
  });

  it.each([
    [{code: 'PERMISSION_DENIED'}, true],
    [{name: 'NotAllowedError'}, true],
    [{message: 'AgoraRTCError PERMISSION_DENIED'}, true],
    [{code: 'NETWORK_ERROR'}, false],
  ])('classifies permission and cancellation errors', (error, expected) => {
    expect(isUserCancelOrPermissionDenied(error)).toBe(expected);
  });

  it('normalizes SDK error details for structured logs', () => {
    expect(
      getScreenshareError({
        code: 'PERMISSION_DENIED',
        name: 'AgoraRTCError',
        message: 'NotAllowedError: Permission denied by user',
      }),
    ).toEqual({
      sdkErrorCode: 'PERMISSION_DENIED',
      sdkErrorName: 'AgoraRTCError',
      sdkErrorMessage: 'NotAllowedError: Permission denied by user',
    });
  });

  it('reuses the active screen-share session ID when stopping', () => {
    const createId = jest.fn(() => 'new-session-id');

    expect(getScreenshareSessionId('stop', 'active-session-id', createId)).toBe(
      'active-session-id',
    );
    expect(createId).not.toHaveBeenCalled();
  });

  it('creates a new screen-share session ID when starting', () => {
    const createId = jest.fn(() => 'new-session-id');

    expect(getScreenshareSessionId('start', null, createId)).toBe(
      'new-session-id',
    );
    expect(createId).toHaveBeenCalledTimes(1);
  });

  it('classifies hidden-document release as page unload', () => {
    expect(getScreenshareReleaseOrigin(undefined, 'hidden')).toBe(
      'page_unload',
    );
    expect(getScreenshareReleaseOrigin(undefined, 'visible')).toBe(
      'end_call_cleanup',
    );
  });
});
