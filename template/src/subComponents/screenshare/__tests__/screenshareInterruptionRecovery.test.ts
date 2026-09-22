import {
  captureScreenshareRecoveryCandidate,
  getScreenshareRecoveryDecision,
} from '../screenshareInterruptionRecovery';

const activeScreen = {
  101: {name: 'Screen', isActive: true, ts: 1000},
};

describe('screen-share RTC interruption recovery', () => {
  it('captures a candidate only when the active pinned screen UID disappears', () => {
    expect(
      captureScreenshareRecoveryCandidate({
        previousActiveUids: [101, 100, 200],
        currentActiveUids: [100, 200],
        previousPinnedUid: 101,
        previousSecondaryPinnedUid: 100,
        previousLayout: 'pinned',
        screenShareData: activeScreen,
        detectedAt: 2000,
      }),
    ).toEqual({
      uid: 101,
      previousPinnedUid: 101,
      previousSecondaryPinnedUid: 100,
      previousLayout: 'pinned',
      screenshareStartedAt: 1000,
      activeScreenshareUidsAtDetection: [101],
      detectedAt: 2000,
      joinedLogged: false,
    });
  });

  it('does not capture an unpinned screen interruption', () => {
    expect(
      captureScreenshareRecoveryCandidate({
        previousActiveUids: [200, 101, 100],
        currentActiveUids: [200, 100],
        previousPinnedUid: 200,
        previousLayout: 'pinned',
        screenShareData: activeScreen,
        detectedAt: 2000,
      }),
    ).toBeNull();
  });

  it('waits for both same-UID join and video publication before restore', () => {
    const candidate = {
      uid: 101,
      previousPinnedUid: 101,
      previousSecondaryPinnedUid: 100,
      previousLayout: 'pinned',
      screenshareStartedAt: 1000,
      activeScreenshareUidsAtDetection: [101],
      detectedAt: 2000,
      joinedLogged: false,
    };

    expect(
      getScreenshareRecoveryDecision({
        candidate,
        activeUids: [100, 200],
        isVideoPublished: false,
        screenShareData: activeScreen,
      }),
    ).toBe('waiting_for_join');
    expect(
      getScreenshareRecoveryDecision({
        candidate,
        activeUids: [100, 200, 101],
        isVideoPublished: false,
        screenShareData: activeScreen,
      }),
    ).toBe('waiting_for_video');
    expect(
      getScreenshareRecoveryDecision({
        candidate,
        activeUids: [100, 200, 101],
        isVideoPublished: true,
        screenShareData: activeScreen,
      }),
    ).toBe('restore');
  });

  it.each([
    [
      'cancel_stopped',
      {101: {name: 'Screen', isActive: false, ts: 1000}},
      undefined,
    ],
    [
      'cancel_replaced',
      {
        ...activeScreen,
        201: {name: 'New screen', isActive: true, ts: 1001},
      },
      undefined,
    ],
    ['cancel_user_override', activeScreen, 200],
  ])(
    'returns %s when recovery is no longer authoritative',
    (expected, screenShareData, pinnedUid) => {
      expect(
        getScreenshareRecoveryDecision({
          candidate: {
            uid: 101,
            previousPinnedUid: 101,
            previousLayout: 'pinned',
            screenshareStartedAt: 1000,
            activeScreenshareUidsAtDetection: [101],
            detectedAt: 2000,
            joinedLogged: false,
          },
          activeUids: [100, 101, 200],
          pinnedUid,
          isVideoPublished: true,
          screenShareData,
        }),
      ).toBe(expected);
    },
  );
});
