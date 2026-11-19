import {beforeEach, describe, expect, it, jest} from '@jest/globals';

jest.mock('../../../logger/AppBuilderLogger', () => ({
  LogSource: {Internals: 'Internals'},
  logger: {log: jest.fn()},
}));

jest.mock('../../../rtm/RTMEngine', () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(),
  },
}));

jest.mock('../../../utils/getUniqueID', () => ({
  __esModule: true,
  default: jest.fn(() => 'default-candidate'),
}));

import {
  createSTTSessionCoordinator,
  STT_SESSION_ID_KEY,
} from '../sttSessionId.web';

const channelMetadata = (value?: string, revision = 7) => ({
  timestamp: 100,
  channelName: 'room',
  channelType: 1,
  majorRevision: revision,
  itemCount: value ? 1 : 0,
  items: value
    ? [
        {
          key: STT_SESSION_ID_KEY,
          value,
          revision,
          authorUserId: '1',
          updateTs: 99,
        },
      ]
    : [],
});

const presence = (...userIds: string[]) => ({
  timestamp: 100,
  totalOccupancy: userIds.length,
  occupants: userIds.map(userId => ({
    userId,
    statesCount: 0,
    states: [],
  })),
  nextPage: '',
});

const createHarness = () => {
  const storage = {
    getChannelMetadata: jest.fn<any>(),
    setChannelMetadata: jest.fn<any>(),
    removeChannelMetadata: jest.fn<any>(),
  };
  const rtmPresence = {
    getOnlineUsers: jest.fn<any>(),
  };
  const createId = jest.fn(() => 'candidate');
  const wait = jest.fn(async () => {});
  const log = jest.fn();
  const coordinator = createSTTSessionCoordinator({
    log,
    getClient: () => ({storage, presence: rtmPresence} as any),
    createId,
    wait,
  });

  return {coordinator, createId, rtmPresence, storage, wait, log};
};

describe('web STT session coordinator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('two peers converge on one replacement and delayed errors adopt it', async () => {
    const {storage, rtmPresence} = createHarness();
    let value = 'stale';
    let revision = 9;
    storage.getChannelMetadata.mockImplementation(async () =>
      channelMetadata(value, revision),
    );
    storage.setChannelMetadata.mockImplementation(
      async (_channel, _type, data) => {
        if (data.items[0].revision !== revision) {
          throw new Error('revision conflict');
        }
        value = data.items[0].value;
        revision += 1;
        return {};
      },
    );
    const makePeer = (candidate: string, log = jest.fn()) =>
      createSTTSessionCoordinator({
        getClient: () => ({storage, presence: rtmPresence} as any),
        createId: () => candidate,
        wait: async () => {},
        log,
      });
    const logB = jest.fn();
    const a = makePeer('new-a');
    const b = makePeer('new-b', logB);
    const ids = await Promise.all([
      a.rotateSessionId('room', 'stale'),
      b.rotateSessionId('room', 'stale'),
    ]);
    expect(ids).toEqual(['new-a', 'new-a']);
    expect(await a.ensureSTTSessionId('room')).toBe('new-a');
    expect(await b.ensureSTTSessionId('room')).toBe('new-a');
    expect(logB).toHaveBeenCalledWith(
      'STT session rotation adopted',
      expect.objectContaining({sessionId: 'new-a', staleSessionId: 'stale'}),
    );
    storage.setChannelMetadata.mockClear();
    expect(await b.rotateSessionId('room', 'stale')).toBe('new-a');
    expect(storage.setChannelMetadata).not.toHaveBeenCalled();
  });

  it('surfaces a failed rotation instead of adopting the unchanged stale value', async () => {
    const {coordinator, storage} = createHarness();
    storage.getChannelMetadata.mockResolvedValue(channelMetadata('stale'));
    storage.setChannelMetadata.mockRejectedValue(
      new Error('permission denied'),
    );
    await expect(coordinator.rotateSessionId('room', 'stale')).rejects.toThrow(
      'permission denied',
    );
  });

  it('does not let an older lookup restore a stale value after recovery', async () => {
    const {coordinator, storage} = createHarness();
    let finishRead!: (value: any) => void;
    storage.getChannelMetadata
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            finishRead = resolve;
          }),
      )
      .mockResolvedValue(channelMetadata('stale'));
    storage.setChannelMetadata.mockResolvedValue({});
    const lookup = coordinator.ensureSTTSessionId('room');
    const rotation = coordinator.rotateSessionId('room', 'stale');
    finishRead(channelMetadata('stale'));
    await lookup;
    expect(await rotation).toBe('candidate');
    expect(await coordinator.ensureSTTSessionId('room')).toBe('candidate');
  });

  it('only skips validation until a locally created ID is first used', async () => {
    const {coordinator, storage, log} = createHarness();
    storage.getChannelMetadata.mockResolvedValue(channelMetadata());
    storage.setChannelMetadata.mockResolvedValue({});
    log.mockImplementation(() => {
      throw new Error('transport failed');
    });
    expect(await coordinator.ensureSTTSessionId('room')).toBe('candidate');
    expect(coordinator.wasSessionIdFreshlyCreated('room')).toBe(true);
    coordinator.markSessionIdUsed('room', 'other-id');
    expect(coordinator.wasSessionIdFreshlyCreated('room')).toBe(true);
    coordinator.markSessionIdUsed('room', 'candidate');
    expect(coordinator.wasSessionIdFreshlyCreated('room')).toBe(false);
    expect(await coordinator.ensureSTTSessionId('room')).toBe('candidate');
  });

  it('reuses existing channel metadata without writing', async () => {
    const {coordinator, storage} = createHarness();
    storage.getChannelMetadata.mockResolvedValue(
      channelMetadata('existing-session'),
    );

    await expect(coordinator.ensureSTTSessionId('room')).resolves.toBe(
      'existing-session',
    );
    expect(storage.setChannelMetadata).not.toHaveBeenCalled();
  });

  it('shares one revision-zero creation across concurrent local calls', async () => {
    const {coordinator, storage} = createHarness();
    storage.getChannelMetadata.mockResolvedValue(channelMetadata());
    storage.setChannelMetadata.mockResolvedValue({
      timestamp: 100,
      channelName: 'room',
      channelType: 1,
    });

    const [first, second] = await Promise.all([
      coordinator.ensureSTTSessionId('room'),
      coordinator.ensureSTTSessionId('room'),
    ]);

    expect(first).toBe('candidate');
    expect(second).toBe('candidate');
    expect(storage.setChannelMetadata).toHaveBeenCalledTimes(1);
    expect(storage.setChannelMetadata).toHaveBeenCalledWith(
      'room',
      1,
      {
        items: [
          {
            key: STT_SESSION_ID_KEY,
            value: 'candidate',
            revision: 0,
          },
        ],
      },
      {addUserId: true, addTimeStamp: true},
    );
  });

  it('re-reads and uses the winning value after a create conflict', async () => {
    const {coordinator, storage} = createHarness();
    storage.getChannelMetadata
      .mockResolvedValueOnce(channelMetadata())
      .mockResolvedValueOnce(channelMetadata('winner-session'));
    storage.setChannelMetadata.mockRejectedValue(
      new Error('revision conflict'),
    );

    await expect(coordinator.ensureSTTSessionId('room')).resolves.toBe(
      'winner-session',
    );
  });

  it('fails after three reads instead of returning a local fallback', async () => {
    const {coordinator, storage, wait} = createHarness();
    storage.getChannelMetadata.mockRejectedValue(new Error('RTM unavailable'));

    await expect(coordinator.ensureSTTSessionId('room')).rejects.toThrow(
      'Unable to resolve the shared STT session ID',
    );
    expect(storage.getChannelMetadata).toHaveBeenCalledTimes(3);
    expect(storage.setChannelMetadata).not.toHaveBeenCalled();
    expect(wait).toHaveBeenNthCalledWith(1, 100);
    expect(wait).toHaveBeenNthCalledWith(2, 250);
  });

  it('keeps metadata while another RTM participant is present', async () => {
    const {coordinator, rtmPresence, storage} = createHarness();
    rtmPresence.getOnlineUsers.mockResolvedValue(presence('1', '2'));

    await expect(
      coordinator.clearSTTSessionIdIfLast('room', '1'),
    ).resolves.toBe(false);
    expect(storage.getChannelMetadata).not.toHaveBeenCalled();
    expect(storage.removeChannelMetadata).not.toHaveBeenCalled();
  });

  it('stops STT before final revision-aware metadata removal', async () => {
    const {coordinator, rtmPresence, storage} = createHarness();
    const calls: string[] = [];
    rtmPresence.getOnlineUsers.mockResolvedValue(presence('1'));
    storage.getChannelMetadata.mockResolvedValue(
      channelMetadata('session-a', 9),
    );
    storage.removeChannelMetadata.mockImplementation(async () => {
      calls.push('remove');
      return {timestamp: 100, channelName: 'room', channelType: 1};
    });

    await coordinator.cleanupSTTSessionOnEnd('room', '1', true, async () => {
      calls.push('stop');
    });

    expect(calls).toEqual(['stop', 'remove']);
    expect(rtmPresence.getOnlineUsers).toHaveBeenCalledTimes(3);
    expect(storage.removeChannelMetadata).toHaveBeenCalledWith('room', 1, {
      data: {
        items: [
          {
            key: STT_SESSION_ID_KEY,
            value: '',
            revision: 9,
          },
        ],
      },
      addUserId: true,
      addTimeStamp: true,
    });
  });
});
