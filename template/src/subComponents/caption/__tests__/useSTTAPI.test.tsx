import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import {beforeEach, describe, expect, it, jest} from '@jest/globals';

jest.mock('../sttSessionId', () => ({
  ensureSTTSessionId: jest.fn(),
  rotateSTTSessionId: jest.fn(),
  wasSTTSessionIdFreshlyCreated: jest.fn(() => true),
  markSTTSessionIdUsed: jest.fn(),
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
    warn: jest.fn(),
  },
}));

jest.mock('../../../utils/getUniqueID', () => ({
  __esModule: true,
  default: () => 'request-id',
}));

import useSTTAPI from '../useSTTAPI';
import {
  ensureSTTSessionId,
  rotateSTTSessionId,
  wasSTTSessionIdFreshlyCreated,
  markSTTSessionIdUsed,
} from '../sttSessionId';
import {logger} from '../../../logger/AppBuilderLogger';

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

describe('useSTTAPI session coordination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (wasSTTSessionIdFreshlyCreated as jest.Mock<any>).mockReturnValue(true);
    (rotateSTTSessionId as jest.Mock<any>).mockReset();
    (markSTTSessionIdUsed as jest.Mock<any>).mockReset();
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
    expect(mockEnsureSTTSessionId).toHaveBeenCalledTimes(4);
    const fetchCalls = (global.fetch as jest.Mock<any>).mock.calls as [
      string,
      {body: string; headers: Record<string, string>},
    ][];
    for (const [, options] of fetchCalls) {
      expect(JSON.parse(options.body)).toMatchObject({
        passphrase: 'phrase',
        session_id: 'shared-session',
      });
      expect(options.headers['X-Session-Id']).toBe('logging-session');
    }
    expect(fetchCalls.map(([url]) => url)).toEqual([
      expect.stringMatching(/\/startv7$/),
      expect.stringMatching(/\/update$/),
      expect.stringMatching(/\/stopv7$/),
    ]);
    renderer.unmount();
  });

  it('correlates 631 recovery with the failed request ID even if the cache changed', async () => {
    mockEnsureSTTSessionId.mockResolvedValue('old-session');
    (rotateSTTSessionId as jest.Mock<any>).mockResolvedValue('new-session');
    (global.fetch as jest.Mock<any>)
      .mockImplementationOnce(async () => {
        // A peer replaced the local cached value while the old request was pending.
        mockEnsureSTTSessionId.mockResolvedValue('new-session');
        return {
          ok: false,
          status: 409,
          json: async () => ({error: {code: 631, message: 'session ended'}}),
        };
      })
      .mockResolvedValueOnce({ok: true, status: 200, json: async () => ({})});
    const {api, renderer} = await renderHook();
    let response;
    await act(async () => {
      response = await api.start(900000123, translationConfig);
    });
    expect(rotateSTTSessionId).toHaveBeenCalledWith('room', 'old-session');
    expect(response).toMatchObject({success: true, sessionId: 'new-session'});
    const attempts = (logger.log as jest.Mock<any>).mock.calls.filter(call =>
      call[2].endsWith('STT start attempt'),
    );
    expect(attempts.map(call => call[3])).toEqual([
      expect.objectContaining({
        attempt: 1,
        sessionId: 'old-session',
        channelName: 'room',
        requestId: 'request-id',
      }),
      expect.objectContaining({
        attempt: 2,
        sessionId: 'new-session',
        channelName: 'room',
        requestId: 'request-id',
      }),
    ]);
    expect(JSON.stringify(attempts)).not.toContain('phrase');
    expect(JSON.stringify(attempts)).not.toContain('Bearer');
    expect(logger.error).toHaveBeenCalledWith(
      expect.anything(),
      'stt',
      expect.stringContaining('STT API Failure'),
      expect.anything(),
      expect.objectContaining({sessionId: 'old-session', httpStatus: 409}),
    );
    renderer.unmount();
  });

  it('retains the sent session ID when a network request fails', async () => {
    mockEnsureSTTSessionId.mockResolvedValue('sent-session');
    (global.fetch as jest.Mock<any>).mockRejectedValue(new Error('offline'));
    const {api, renderer} = await renderHook();
    let response;
    await act(async () => {
      response = await api.start(900000123, translationConfig);
    });
    expect(response).toMatchObject({success: false, sessionId: 'sent-session'});
    expect(logger.error).toHaveBeenCalledWith(
      expect.anything(),
      'stt',
      expect.stringContaining('STT API Failure'),
      expect.anything(),
      expect.objectContaining({
        sessionId: 'sent-session',
        requestId: 'request-id',
      }),
    );
    renderer.unmount();
  });

  it.each([
    'COMPLETED',
    'FAILED',
    'ARTIFACTS_PENDING',
    'PROCESSING',
    'STARTED',
    'INPROGRESS',
    'NOT_LISTED',
  ])('preflights a reused ID in state %s before start', async status => {
    mockEnsureSTTSessionId.mockResolvedValue('stored-session');
    (wasSTTSessionIdFreshlyCreated as jest.Mock<any>).mockReturnValue(false);
    const shouldRotate = [
      'COMPLETED',
      'FAILED',
      'ARTIFACTS_PENDING',
      'PROCESSING',
    ].includes(status);
    (rotateSTTSessionId as jest.Mock<any>).mockImplementation(async () => {
      mockEnsureSTTSessionId.mockResolvedValue('replacement');
      return 'replacement';
    });
    (global.fetch as jest.Mock<any>)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          stts:
            status === 'NOT_LISTED'
              ? []
              : [{session_id: 'stored-session', status}],
        }),
      })
      .mockResolvedValueOnce({ok: true, status: 200, json: async () => ({})});
    const {api, renderer} = await renderHook();
    await act(async () => {
      await api.start(900000123, translationConfig);
    });
    const calls = (global.fetch as jest.Mock<any>).mock.calls;
    expect(calls[0][0]).toMatch(/\/v1\/stt-transcript$/);
    expect(JSON.parse(calls[0][1].body)).toEqual({
      passphrase: 'phrase',
      page: 1,
      limit: 50,
    });
    expect(JSON.parse(calls[1][1].body).session_id).toBe(
      shouldRotate ? 'replacement' : 'stored-session',
    );
    expect(rotateSTTSessionId).toHaveBeenCalledTimes(shouldRotate ? 1 : 0);
    renderer.unmount();
  });

  it('checks a locally minted ID on a later start after it has been used', async () => {
    mockEnsureSTTSessionId.mockResolvedValue('minted-session');
    (markSTTSessionIdUsed as jest.Mock<any>).mockImplementation(() => {
      (wasSTTSessionIdFreshlyCreated as jest.Mock<any>).mockReturnValue(false);
    });
    (global.fetch as jest.Mock<any>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({stts: []}),
    });
    const {api, renderer} = await renderHook();
    await act(async () => {
      await api.start(900000123, translationConfig);
      await api.start(900000123, translationConfig);
    });
    expect(
      (global.fetch as jest.Mock<any>).mock.calls.map(call => call[0]),
    ).toEqual([
      expect.stringMatching(/\/startv7$/),
      expect.stringMatching(/\/stt-transcript$/),
      expect.stringMatching(/\/startv7$/),
    ]);
    renderer.unmount();
  });

  it('retries start once after a 631 on the last transient retry', async () => {
    jest.useFakeTimers();
    try {
      mockEnsureSTTSessionId.mockResolvedValue('old-session');
      (rotateSTTSessionId as jest.Mock<any>).mockImplementation(async () => {
        mockEnsureSTTSessionId.mockResolvedValue('new-session');
        return 'new-session';
      });
      (global.fetch as jest.Mock<any>)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({error: {code: 610, message: 'temporary'}}),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({error: {code: 610, message: 'temporary'}}),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({error: {code: 610, message: 'temporary'}}),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({error: {code: 610, message: 'temporary'}}),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 409,
          json: async () => ({error: {code: 631, message: 'session ended'}}),
        })
        .mockResolvedValueOnce({ok: true, status: 200, json: async () => ({})});
      const {api, renderer} = await renderHook();
      let response;
      await act(async () => {
        const pending = api.start(900000123, translationConfig);
        await jest.runAllTimersAsync();
        response = await pending;
      });
      expect(response).toMatchObject({success: true, sessionId: 'new-session'});
      expect(global.fetch).toHaveBeenCalledTimes(6);
      expect(rotateSTTSessionId).toHaveBeenCalledTimes(1);
      renderer.unmount();
    } finally {
      jest.useRealTimers();
    }
  });

  it('falls through to start when the optional preflight times out', async () => {
    jest.useFakeTimers();
    try {
      mockEnsureSTTSessionId.mockResolvedValue('stored-session');
      (wasSTTSessionIdFreshlyCreated as jest.Mock<any>).mockReturnValue(false);
      (global.fetch as jest.Mock<any>)
        .mockImplementationOnce(
          (_url, options) =>
            new Promise((_resolve, reject) => {
              options.signal.addEventListener('abort', () =>
                reject(new Error('aborted')),
              );
            }),
        )
        .mockResolvedValueOnce({ok: true, status: 200, json: async () => ({})});
      const {api, renderer} = await renderHook();
      let response;
      await act(async () => {
        const pending = api.start(900000123, translationConfig);
        await jest.runAllTimersAsync();
        response = await pending;
      });
      expect(response).toMatchObject({
        success: true,
        sessionId: 'stored-session',
      });
      expect(rotateSTTSessionId).not.toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(jest.getTimerCount()).toBe(0);
      renderer.unmount();
    } finally {
      jest.useRealTimers();
    }
  });

  it('returns a repeated 631 after one recovery instead of rotating forever', async () => {
    mockEnsureSTTSessionId.mockResolvedValue('old-session');
    (rotateSTTSessionId as jest.Mock<any>).mockResolvedValue('replacement');
    (global.fetch as jest.Mock<any>).mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({error: {code: 631, message: 'session ended'}}),
    });
    const {api, renderer} = await renderHook();
    let response;
    await act(async () => {
      response = await api.start(900000123, translationConfig);
    });
    expect(response).toMatchObject({success: false, error: {code: 631}});
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(rotateSTTSessionId).toHaveBeenCalledTimes(1);
    renderer.unmount();
  });
});
