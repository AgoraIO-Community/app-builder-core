import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';

jest.mock('customization-implementation', () => ({
  useCustomization: () => undefined,
}));

jest.mock('customization-api', () => ({
  useCaption: jest.fn(),
  useContent: jest.fn(),
  useRoomInfo: jest.fn(),
}));

jest.mock('../../../agora-rn-uikit', () => {
  const ReactModule = require('react');
  return {
    PropsContext: ReactModule.createContext({}),
    DispatchContext: ReactModule.createContext({}),
    useLocalUid: jest.fn(() => 123),
  };
});

jest.mock('../../components/Router', () => ({
  useHistory: () => ({}),
}));

jest.mock('../../subComponents/LocalEndCall', () => ({
  stopForegroundService: jest.fn(),
}));

jest.mock('../../rtm/RTMEngine', () => {
  const unsubscribe = jest.fn();
  return {
    __esModule: true,
    default: {
      getInstance: () => ({engine: {unsubscribe}}),
    },
  };
});

jest.mock('../../auth/config', () => ({ENABLE_AUTH: true}));

jest.mock('../../auth/AuthProvider', () => ({
  useAuth: () => ({authLogin: jest.fn()}),
}));

jest.mock('../../components/chat/chatConfigure', () => ({
  useChatConfigure: () => ({deleteChatUser: jest.fn()}),
}));

jest.mock('../common', () => ({
  isWebInternal: jest.fn(),
}));

jest.mock('../../subComponents/caption/sttSessionId', () => ({
  cleanupSTTSessionOnEnd: jest.fn(),
}));

import {useCaption, useContent, useRoomInfo} from 'customization-api';
import {DispatchContext, PropsContext} from '../../../agora-rn-uikit';
import RTMEngine from '../../rtm/RTMEngine';
import {cleanupSTTSessionOnEnd} from '../../subComponents/caption/sttSessionId';
import {isWebInternal} from '../common';
import useEndCall from '../useEndCall';

const mockUseCaption = useCaption as jest.Mock<any>;
const mockUseContent = useContent as jest.Mock<any>;
const mockUseRoomInfo = useRoomInfo as jest.Mock<any>;
const mockCleanupSTTSessionOnEnd = cleanupSTTSessionOnEnd as jest.Mock<any>;
const mockIsWebInternal = isWebInternal as jest.Mock<any>;
const mockUnsubscribe = RTMEngine.getInstance().engine
  .unsubscribe as jest.Mock<any>;

const renderHook = (dispatch: (action: any) => void) => {
  let endCall!: ReturnType<typeof useEndCall>;
  let renderer!: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      <PropsContext.Provider value={{rtcProps: {channel: 'room'}} as any}>
        <DispatchContext.Provider value={{dispatch} as any}>
          {React.createElement(() => {
            endCall = useEndCall();
            return null;
          })}
        </DispatchContext.Provider>
      </PropsContext.Provider>,
    );
  });

  return {endCall, renderer};
};

describe('useEndCall STT session cleanup', () => {
  const mockStopSTT = jest.fn<any>();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockUseCaption.mockReturnValue({
      isSTTActive: true,
      stopSTTBotSession: mockStopSTT,
    });
    mockUseContent.mockReturnValue({
      defaultContent: {
        123: {
          type: 'rtc',
          isHost: 'true',
          offline: false,
        },
      },
    });
    mockUseRoomInfo.mockReturnValue({data: {isHost: true}});
    mockStopSTT.mockResolvedValue(undefined);
    mockUnsubscribe.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('awaits web cleanup before RTM unsubscribe and end-call dispatch', async () => {
    const calls: string[] = [];
    mockIsWebInternal.mockReturnValue(true);
    mockStopSTT.mockImplementation(async () => {
      calls.push('stop');
    });
    mockCleanupSTTSessionOnEnd.mockImplementation(
      async (_channel, _uid, _active, stop) => {
        calls.push('cleanup-start');
        await stop();
        calls.push('cleanup-end');
      },
    );
    mockUnsubscribe.mockImplementation(async () => {
      calls.push('unsubscribe');
    });
    const {endCall, renderer} = renderHook(() => calls.push('dispatch'));

    await act(async () => {
      await endCall();
    });

    expect(mockCleanupSTTSessionOnEnd).toHaveBeenCalledWith(
      'room',
      '123',
      true,
      mockStopSTT,
    );
    expect(calls).toEqual([
      'cleanup-start',
      'stop',
      'cleanup-end',
      'unsubscribe',
    ]);

    act(() => jest.runOnlyPendingTimers());
    expect(calls).toEqual([
      'cleanup-start',
      'stop',
      'cleanup-end',
      'unsubscribe',
      'dispatch',
    ]);
    renderer.unmount();
  });

  it('awaits native cleanup before RTM unsubscribe and end-call dispatch', async () => {
    const calls: string[] = [];
    mockIsWebInternal.mockReturnValue(false);
    mockStopSTT.mockImplementation(async () => {
      calls.push('stop');
    });
    mockCleanupSTTSessionOnEnd.mockImplementation(
      async (_channel, _uid, _active, stop) => {
        calls.push('cleanup-start');
        await stop();
        calls.push('cleanup-end');
      },
    );
    mockUnsubscribe.mockImplementation(async () => {
      calls.push('unsubscribe');
    });
    const {endCall, renderer} = renderHook(() => calls.push('dispatch'));

    await act(async () => {
      await endCall();
    });

    expect(mockCleanupSTTSessionOnEnd).toHaveBeenCalledWith(
      'room',
      '123',
      true,
      expect.any(Function),
    );
    expect(calls).toEqual([
      'cleanup-start',
      'stop',
      'cleanup-end',
      'unsubscribe',
    ]);

    act(() => jest.runOnlyPendingTimers());
    expect(calls).toEqual([
      'cleanup-start',
      'stop',
      'cleanup-end',
      'unsubscribe',
      'dispatch',
    ]);
    renderer.unmount();
  });

  it('falls back to the native last-host stop when RTM cleanup fails', async () => {
    const calls: string[] = [];
    mockIsWebInternal.mockReturnValue(false);
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockCleanupSTTSessionOnEnd.mockImplementation(async () => {
      calls.push('cleanup');
      throw new Error('RTM unavailable');
    });
    mockStopSTT.mockImplementation(async () => {
      calls.push('stop');
    });
    mockUnsubscribe.mockImplementation(async () => {
      calls.push('unsubscribe');
    });
    const {endCall, renderer} = renderHook(() => calls.push('dispatch'));

    await act(async () => {
      await endCall();
    });

    expect(mockStopSTT).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(['cleanup', 'stop', 'unsubscribe']);

    act(() => jest.runOnlyPendingTimers());
    expect(calls).toEqual(['cleanup', 'stop', 'unsubscribe', 'dispatch']);
    renderer.unmount();
  });

  it('does not stop native STT twice when metadata removal fails after stop', async () => {
    mockIsWebInternal.mockReturnValue(false);
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockCleanupSTTSessionOnEnd.mockImplementation(
      async (_channel, _uid, _active, stop) => {
        await stop();
        throw new Error('metadata removal failed');
      },
    );
    const {endCall, renderer} = renderHook(() => {});

    await act(async () => {
      await endCall();
    });

    expect(mockStopSTT).toHaveBeenCalledTimes(1);
    renderer.unmount();
  });

  it('continues native end-call when RTM cleanup and fallback stop both fail', async () => {
    const calls: string[] = [];
    mockIsWebInternal.mockReturnValue(false);
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockCleanupSTTSessionOnEnd.mockRejectedValue(new Error('RTM unavailable'));
    mockStopSTT.mockRejectedValue(new Error('stop unavailable'));
    mockUnsubscribe.mockImplementation(async () => {
      calls.push('unsubscribe');
    });
    const {endCall, renderer} = renderHook(() => calls.push('dispatch'));

    await act(async () => {
      await endCall();
    });

    expect(calls).toEqual(['unsubscribe']);
    act(() => jest.runOnlyPendingTimers());
    expect(calls).toEqual(['unsubscribe', 'dispatch']);
    renderer.unmount();
  });
});
