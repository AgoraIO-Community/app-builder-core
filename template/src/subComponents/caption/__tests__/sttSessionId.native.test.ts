import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';

const mockStorage = {
  getChannelMetadata: jest.fn<any>(),
  setChannelMetadata: jest.fn<any>(),
  removeChannelMetadata: jest.fn<any>(),
};
const mockPresence = {
  getOnlineUsers: jest.fn<any>(),
};

jest.mock('../../../rtm/RTMEngine', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      engine: {storage: mockStorage, presence: mockPresence},
    }),
  },
}));

jest.mock('../../../utils/getUniqueID', () => ({
  __esModule: true,
  default: jest.fn(() => 'native-session'),
}));

import {
  ensureSTTSessionId,
  resetSTTSessionIdCache,
  STT_SESSION_ID_KEY,
} from '../sttSessionId';

const emptyChannelMetadata = {
  timestamp: 100,
  channelName: 'room',
  channelType: 1,
  majorRevision: 0,
  itemCount: 0,
  items: [],
};

describe('native STT session coordination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    resetSTTSessionIdCache();
    mockStorage.getChannelMetadata.mockResolvedValue(emptyChannelMetadata);
    mockStorage.setChannelMetadata.mockResolvedValue({
      timestamp: 100,
      channelName: 'room',
      channelType: 1,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates the shared session ID through the native RTM client', async () => {
    await expect(ensureSTTSessionId('room')).resolves.toBe('native-session');

    expect(mockStorage.setChannelMetadata).toHaveBeenCalledWith(
      'room',
      1,
      {
        items: [
          {
            key: STT_SESSION_ID_KEY,
            value: 'native-session',
            revision: 0,
          },
        ],
      },
      {addUserId: true, addTimeStamp: true},
    );
  });
});
