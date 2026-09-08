const mockCreateScreenVideoTrack = jest.fn();

jest.mock('agora-rtc-sdk-ng', () => ({
  __esModule: true,
  default: {
    createScreenVideoTrack: mockCreateScreenVideoTrack,
    setArea: jest.fn(),
    setLogLevel: jest.fn(),
    enableLogUpload: jest.fn(),
    disableLogUpload: jest.fn(),
  },
}));

jest.mock('react-native-agora', () => ({}));

jest.mock('../../../../agora-rn-uikit', () => ({
  ChannelProfileType: {
    ChannelProfileCommunication: 0,
    ChannelProfileLiveBroadcasting: 1,
  },
  ClientRoleType: {
    ClientRoleBroadcaster: 1,
    ClientRoleAudience: 2,
  },
}));

jest.mock('../../../../src/logger/AppBuilderLogger', () => ({
  LogSource: {AgoraSDK: 'AgoraSDK'},
  logger: {
    log: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
};

const deferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {promise, resolve, reject};
};

const createTrack = () => {
  const handlers: Record<string, () => Promise<void>> = {};
  return {
    handlers,
    track: {
      on: jest.fn((event: string, handler: () => Promise<void>) => {
        handlers[event] = handler;
      }),
      stop: jest.fn(),
      close: jest.fn(),
      getMediaStreamTrack: jest.fn(() => ({
        readyState: 'ended',
        enabled: true,
        muted: false,
        label: 'screen',
        getSettings: () => ({}),
      })),
    },
  };
};

describe('web RTC screen-share lifecycle', () => {
  let RtcEngine: any;
  let engine: any;
  let screenClient: any;

  const callScreenshare = (action: 'start' | 'stop', sessionId = 'session-1') =>
    engine.startScreenshare(
      'token',
      'channel',
      null,
      101,
      'app-id',
      engine,
      null,
      {encoderConfig: '1080p_2'},
      'auto',
      {
        action,
        screenshareAttemptId: `${action}-request`,
        screenshareSessionId: sessionId,
        screenShareUid: 101,
        stopOrigin: 'toolbar',
      },
    );

  beforeAll(() => {
    (global as any).window = {};
    RtcEngine = require('../RtcEngine').default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    engine = new RtcEngine();
    engine.initialize({appId: 'app-id'});
    screenClient = {
      uid: 101,
      join: jest.fn().mockResolvedValue(101),
      publish: jest.fn().mockResolvedValue(undefined),
      leave: jest.fn().mockResolvedValue(undefined),
      setEncryptionConfig: jest.fn().mockResolvedValue(undefined),
    };
    engine.screenClient = screenClient;
    engine.client = {off: jest.fn()};
  });

  it('rejects a second Start before it can open another picker', async () => {
    const picker = deferred<any>();
    const {track} = createTrack();
    mockCreateScreenVideoTrack.mockReturnValueOnce(picker.promise);

    const firstStart = callScreenshare('start');
    await expect(
      callScreenshare('start', 'duplicate-session'),
    ).rejects.toMatchObject({code: 'SCREENSHARE_OPERATION_IN_PROGRESS'});

    expect(mockCreateScreenVideoTrack).toHaveBeenCalledTimes(1);
    picker.resolve(track);
    await firstStart;
    expect(screenClient.join).toHaveBeenCalledTimes(1);
    expect(screenClient.publish).toHaveBeenCalledTimes(1);
  });

  it('executes an explicit Stop as a no-op when RTC is inactive', async () => {
    const stopped = jest.fn();
    engine.eventsMap.set('onScreenshareStopped', stopped);

    await callScreenshare('stop');

    expect(mockCreateScreenVideoTrack).not.toHaveBeenCalled();
    expect(screenClient.join).not.toHaveBeenCalled();
    expect(screenClient.leave).not.toHaveBeenCalled();
    expect(stopped).toHaveBeenCalledTimes(1);
  });

  it('cleans only locally created tracks when Start fails', async () => {
    const {track} = createTrack();
    mockCreateScreenVideoTrack.mockResolvedValueOnce(track);
    screenClient.join.mockRejectedValueOnce(
      Object.assign(new Error('already connected'), {
        code: 'INVALID_OPERATION',
      }),
    );

    await expect(callScreenshare('start')).rejects.toMatchObject({
      code: 'INVALID_OPERATION',
    });

    expect(track.stop).toHaveBeenCalledTimes(1);
    expect(track.close).toHaveBeenCalledTimes(1);
    expect(screenClient.leave).not.toHaveBeenCalled();
    expect(engine.screenStream).toEqual({});
  });

  it('leaves and closes local tracks when publish fails', async () => {
    const {track} = createTrack();
    mockCreateScreenVideoTrack.mockResolvedValueOnce(track);
    screenClient.publish.mockRejectedValueOnce(new Error('publish failed'));

    await expect(callScreenshare('start')).rejects.toThrow('publish failed');

    expect(track.stop).toHaveBeenCalledTimes(1);
    expect(track.close).toHaveBeenCalledTimes(1);
    expect(screenClient.leave).toHaveBeenCalledTimes(1);
    expect(engine.screenStream).toEqual({});
  });

  it('preserves the publish error and attempts every cleanup operation when a track cleanup throws', async () => {
    const {track} = createTrack();
    const publishError = new Error('publish failed');
    track.stop.mockImplementationOnce(() => {
      throw new Error('track stop failed');
    });
    mockCreateScreenVideoTrack.mockResolvedValueOnce(track);
    screenClient.publish.mockRejectedValueOnce(publishError);

    await expect(callScreenshare('start')).rejects.toBe(publishError);

    expect(track.stop).toHaveBeenCalledTimes(1);
    expect(track.close).toHaveBeenCalledTimes(1);
    expect(screenClient.leave).toHaveBeenCalledTimes(1);
    expect(engine.screenStream).toEqual({});
    expect(engine.inScreenshare).toBe(false);
  });

  it('returns to inactive after picker cancellation so a later Start can run', async () => {
    mockCreateScreenVideoTrack.mockRejectedValueOnce(
      Object.assign(new Error('permission denied'), {
        code: 'PERMISSION_DENIED',
      }),
    );

    await expect(callScreenshare('start')).rejects.toMatchObject({
      code: 'PERMISSION_DENIED',
    });

    const {track} = createTrack();
    mockCreateScreenVideoTrack.mockResolvedValueOnce(track);
    await callScreenshare('start', 'session-2');

    expect(mockCreateScreenVideoTrack).toHaveBeenCalledTimes(2);
    expect(screenClient.join).toHaveBeenCalledTimes(1);
    expect(screenClient.publish).toHaveBeenCalledTimes(1);
    expect(screenClient.leave).not.toHaveBeenCalled();
  });

  it('does not publish a pending Start after end-call release', async () => {
    const picker = deferred<any>();
    const {track} = createTrack();
    mockCreateScreenVideoTrack.mockReturnValueOnce(picker.promise);

    const pendingStart = callScreenshare('start');
    await engine.release('end_call_cleanup');
    picker.resolve(track);

    await expect(pendingStart).rejects.toMatchObject({
      code: 'SCREENSHARE_START_CANCELLED',
    });
    expect(track.stop).toHaveBeenCalledTimes(1);
    expect(track.close).toHaveBeenCalledTimes(1);
    expect(screenClient.join).not.toHaveBeenCalled();
    expect(screenClient.publish).not.toHaveBeenCalled();
  });

  it('ignores a stale track-ended callback after app cleanup', async () => {
    const {track, handlers} = createTrack();
    const stopped = jest.fn();
    engine.eventsMap.set('onScreenshareStopped', stopped);
    mockCreateScreenVideoTrack.mockResolvedValueOnce(track);

    await callScreenshare('start');
    await callScreenshare('stop');
    await handlers['track-ended']();

    expect(screenClient.leave).toHaveBeenCalledTimes(1);
    expect(track.stop).toHaveBeenCalledTimes(1);
    expect(track.close).toHaveBeenCalledTimes(1);
    expect(stopped).toHaveBeenCalledTimes(1);
  });

  it('joins an existing cleanup when Stop is requested twice', async () => {
    const {track} = createTrack();
    const leave = deferred<void>();
    const stopped = jest.fn();
    engine.eventsMap.set('onScreenshareStopped', stopped);
    mockCreateScreenVideoTrack.mockResolvedValueOnce(track);
    screenClient.leave.mockReturnValueOnce(leave.promise);

    await callScreenshare('start');
    const firstStop = callScreenshare('stop');
    const secondStop = callScreenshare('stop');
    leave.resolve(undefined);
    await Promise.all([firstStop, secondStop]);

    expect(screenClient.leave).toHaveBeenCalledTimes(1);
    expect(track.stop).toHaveBeenCalledTimes(1);
    expect(track.close).toHaveBeenCalledTimes(1);
    expect(stopped).toHaveBeenCalledTimes(1);
  });

  it('attempts leave and the stopped callback when track cleanup fails', async () => {
    const {track} = createTrack();
    const stopped = jest.fn();
    engine.eventsMap.set('onScreenshareStopped', stopped);
    mockCreateScreenVideoTrack.mockResolvedValueOnce(track);
    track.stop.mockImplementationOnce(() => {
      throw new Error('track stop failed');
    });

    await callScreenshare('start');
    await expect(callScreenshare('stop')).resolves.toBeUndefined();

    expect(track.close).toHaveBeenCalledTimes(1);
    expect(screenClient.leave).toHaveBeenCalledTimes(1);
    expect(stopped).toHaveBeenCalledTimes(1);
    expect(engine.inScreenshare).toBe(false);
  });

  it('handles leave rejection from native track-ended without rejecting the SDK callback', async () => {
    const {track, handlers} = createTrack();
    const stopped = jest.fn();
    engine.eventsMap.set('onScreenshareStopped', stopped);
    mockCreateScreenVideoTrack.mockResolvedValueOnce(track);
    screenClient.leave.mockRejectedValueOnce(new Error('leave failed'));

    await callScreenshare('start');
    await expect(handlers['track-ended']()).resolves.toBeUndefined();

    expect(screenClient.leave).toHaveBeenCalledTimes(1);
    expect(stopped).toHaveBeenCalledTimes(1);
    expect(engine.inScreenshare).toBe(false);
    const {logger} = require('../../../../src/logger/AppBuilderLogger');
    const journeyMessages = logger.log.mock.calls
      .map((call: unknown[]) => call[2])
      .filter((message: unknown) =>
        String(message).includes('[SCREENSHARE_JOURNEY]'),
      );
    expect(journeyMessages[journeyMessages.length - 1]).toBe(
      '----- [SCREENSHARE_JOURNEY] SCREEN SHARE SESSION END | sessionId=session-1 -----',
    );
  });

  it('writes the session end boundary after release cleanup logs', async () => {
    const {track} = createTrack();
    const stopped = jest.fn();
    engine.eventsMap.set('onScreenshareStopped', stopped);
    mockCreateScreenVideoTrack.mockResolvedValueOnce(track);

    await callScreenshare('start');
    await engine.release('end_call_cleanup');

    const {logger} = require('../../../../src/logger/AppBuilderLogger');
    const journeyMessages = logger.log.mock.calls
      .map((call: unknown[]) => call[2])
      .filter((message: unknown) =>
        String(message).includes('[SCREENSHARE_JOURNEY]'),
      );
    expect(journeyMessages[journeyMessages.length - 1]).toBe(
      '----- [SCREENSHARE_JOURNEY] SCREEN SHARE SESSION END | sessionId=session-1 -----',
    );
  });

  it('logs a receiver screen-share termination once for an RTC event', () => {
    const remoteTrack = createTrack().track;
    engine.remoteStreams.set(202, {video: remoteTrack});
    engine.registerRemoteScreenshareUid(202);

    engine.logRemoteScreenshareTermination(202, 'user-unpublished', 'video');
    engine.logRemoteScreenshareTermination(202, 'user-left');

    const {logger} = require('../../../../src/logger/AppBuilderLogger');
    const terminationLogs = logger.log.mock.calls.filter((call: unknown[]) =>
      String(call[2]).includes(
        'receiver detected screen share stopped through RTC',
      ),
    );
    expect(terminationLogs).toHaveLength(1);
    expect(terminationLogs[0][2]).toContain('user-unpublished');
    expect(terminationLogs[0][3]).toMatchObject({
      action: 'stop',
      stage: 'receiver_rtc_termination',
      role: 'viewer',
      screenShareUid: 202,
      sdkEvent: 'user-unpublished',
    });
  });
});
