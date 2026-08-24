import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import {beforeEach, describe, expect, it, jest} from '@jest/globals';

jest.mock('../sttSessionId', () => ({
  ensureSTTSessionId: jest.fn(),
}));

jest.mock('../../../utils/common', () => ({
  isWebInternal: () => true,
}));

jest.mock('../../../components/StorageContext', () => {
  const ReactModule = require('react');
  return {
    __esModule: true,
    default: ReactModule.createContext({store: {token: 'token'}}),
  };
});

jest.mock('../../../components/room-info/useRoomInfo', () => ({
  useRoomInfo: () => ({data: {roomId: {host: 'phrase'}}}),
}));

jest.mock('../../../../agora-rn-uikit', () => {
  const ReactModule = require('react');
  return {
    PropsContext: ReactModule.createContext({
      rtcProps: {channel: 'room', encryption: {mode: 8}},
    }),
    useLocalUid: () => 123,
  };
});

jest.mock('../../../logger/AppBuilderLogger', () => ({
  LogSource: {NetworkRest: 'NetworkRest'},
  logger: {
    getSessionId: () => 'logging-session',
    log: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../../utils/getUniqueID', () => ({
  __esModule: true,
  default: () => 'request-id',
}));

import useSTTAPI from '../useSTTAPI';
import {ensureSTTSessionId} from '../sttSessionId';

const mockEnsureSTTSessionId = ensureSTTSessionId as jest.Mock<any>;

const translationConfig = {
  source: ['en-US'],
  targets: ['de-DE'],
} as any;

const renderHook = async () => {
  let api!: ReturnType<typeof useSTTAPI>;
  let renderer!: TestRenderer.ReactTestRenderer;

  await act(async () => {
    renderer = TestRenderer.create(
      <React.Fragment>
        {React.createElement(() => {
          api = useSTTAPI();
          return null;
        })}
      </React.Fragment>,
    );
  });

  return {api, renderer};
};

describe('useSTTAPI web session coordination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn<any>(async () => ({
      json: async () => ({}),
    }));
  });

  it('does not call STT when the shared session ID cannot be resolved', async () => {
    mockEnsureSTTSessionId.mockRejectedValue(new Error('RTM unavailable'));
    const {api, renderer} = await renderHook();

    let response;
    await act(async () => {
      response = await api.start(900000123, translationConfig);
    });

    expect(response).toMatchObject({
      success: false,
      error: {message: 'RTM unavailable'},
    });
    expect(mockEnsureSTTSessionId).toHaveBeenCalledWith('room');
    expect(global.fetch).not.toHaveBeenCalled();
    renderer.unmount();
  });

  it('adds the shared ID to start, update, and stop while retaining the logging header', async () => {
    mockEnsureSTTSessionId.mockResolvedValue('shared-session');
    const {api, renderer} = await renderHook();

    await act(async () => {
      await api.start(900000123, translationConfig);
      await api.update(900000123, translationConfig);
      await api.stop(900000123);
    });

    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(mockEnsureSTTSessionId).toHaveBeenCalledTimes(3);
    for (const [, options] of (global.fetch as jest.Mock).mock.calls) {
      expect(JSON.parse(options.body)).toMatchObject({
        passphrase: 'phrase',
        session_id: 'shared-session',
      });
      expect(options.headers['X-Session-Id']).toBe('logging-session');
    }
    expect((global.fetch as jest.Mock).mock.calls.map(([url]) => url)).toEqual([
      expect.stringMatching(/\/startv7$/),
      expect.stringMatching(/\/update$/),
      expect.stringMatching(/\/stopv7$/),
    ]);
    renderer.unmount();
  });
});
