const mockPublish = jest.fn();

jest.mock('../../rtm/RTMEngine', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      isEngineReady: true,
      localUid: '101',
      channelUid: 'channel-1',
      engine: {
        publish: mockPublish,
        storage: {setUserMetadata: jest.fn().mockResolvedValue(undefined)},
      },
    }),
  },
}));

jest.mock('../../logger/AppBuilderLogger', () => ({
  LogSource: {Events: 'Events'},
  logger: {
    log: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../../bridge/rtm/web/Types', () => ({
  nativeChannelTypeMapping: {MESSAGE: 0, USER: 1},
}));

jest.mock('../../rtm/utils', () => ({adjustUID: (uid: number) => uid}));

import Events from '../Events';

describe('Events.send delivery result', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns true when RTM publish succeeds', async () => {
    mockPublish.mockResolvedValueOnce(undefined);

    await expect(new Events().send('screenshare', 'started')).resolves.toBe(
      true,
    );
  });

  it('returns false without throwing when RTM publish fails', async () => {
    mockPublish.mockRejectedValueOnce(new Error('network unavailable'));

    await expect(new Events().send('screenshare', 'started')).resolves.toBe(
      false,
    );
  });
});
