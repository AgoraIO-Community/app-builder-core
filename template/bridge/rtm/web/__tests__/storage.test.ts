import {beforeEach, describe, expect, it, jest} from '@jest/globals';

const mockSetChannelMetadata = jest.fn<any>();
const mockGetChannelMetadata = jest.fn<any>();
const mockRemoveChannelMetadata = jest.fn<any>();

jest.mock('agora-rtm-sdk', () => ({
  __esModule: true,
  default: {
    RTM: jest.fn().mockImplementation(() => ({
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      removeAllListeners: jest.fn(),
      storage: {
        setChannelMetadata: mockSetChannelMetadata,
        getChannelMetadata: mockGetChannelMetadata,
        removeChannelMetadata: mockRemoveChannelMetadata,
      },
      presence: {},
    })),
  },
}));

import {RTMWebClient} from '../index';

describe('RTMWebClient channel metadata bridge', () => {
  let client: RTMWebClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetChannelMetadata.mockResolvedValue({});
    mockRemoveChannelMetadata.mockResolvedValue({});
    client = new RTMWebClient('app-id', 'user-id');
  });

  it('preserves revision zero for create-only channel metadata', async () => {
    await client.storage.setChannelMetadata(
      'room',
      1,
      {
        items: [
          {
            key: 'STT_SESSION_ID',
            value: 'session-a',
            revision: 0,
          },
        ],
      },
      {addUserId: true, addTimeStamp: true},
    );

    expect(mockSetChannelMetadata).toHaveBeenCalledWith(
      'room',
      'MESSAGE',
      [
        {
          key: 'STT_SESSION_ID',
          value: 'session-a',
          revision: 0,
        },
      ],
      {addUserId: true, addTimeStamp: true},
    );
  });

  it('maps channel metadata revision, author, and timestamp fields', async () => {
    mockGetChannelMetadata.mockResolvedValue({
      channelName: 'room',
      channelType: 'MESSAGE',
      timestamp: 100,
      totalCount: 1,
      majorRevision: 12,
      metadata: {
        STT_SESSION_ID: {
          value: 'session-a',
          revision: 11,
          authorUid: '42',
          updated: 99,
        },
      },
    });

    await expect(client.storage.getChannelMetadata('room', 1)).resolves.toEqual(
      {
        majorRevision: 12,
        items: [
          {
            key: 'STT_SESSION_ID',
            value: 'session-a',
            revision: 11,
            authorUserId: '42',
            updateTs: 99,
          },
        ],
        itemCount: 1,
        timestamp: 100,
        channelName: 'room',
        channelType: 1,
      },
    );
  });

  it('removes only the requested channel metadata revision', async () => {
    await client.storage.removeChannelMetadata('room', 1, {
      data: {
        items: [
          {
            key: 'STT_SESSION_ID',
            value: '',
            revision: 11,
          },
        ],
      },
      addUserId: true,
      addTimeStamp: true,
    });

    expect(mockRemoveChannelMetadata).toHaveBeenCalledWith('room', 'MESSAGE', {
      data: [
        {
          key: 'STT_SESSION_ID',
          value: '',
          revision: 11,
        },
      ],
      addUserId: true,
      addTimeStamp: true,
    });
  });
});
