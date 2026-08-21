import {
  getScreenshareError,
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
});
