import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import {beforeEach, describe, expect, it, jest} from '@jest/globals';

let mockContent: any;
let mockLayout: any;
let mockScreenContext: any;

const mockDispatch = jest.fn();
const mockSetPinnedLayout = jest.fn();
const mockChangeLayout = jest.fn();

jest.mock('../../../../agora-rn-uikit', () => {
  const ReactModule = require('react');
  return {
    DispatchContext: ReactModule.createContext({dispatch: jest.fn()}),
    PropsContext: ReactModule.createContext({
      rtcProps: {
        channel: 'channel',
        appId: 'app-id',
        screenShareUid: 101,
        screenShareToken: 'screen-token',
        encryption: {},
      },
    }),
  };
});

jest.mock('../useScreenshare', () => {
  const ReactModule = require('react');
  return {
    ScreenshareContext: ReactModule.createContext({
      isScreenshareActive: false,
      operationState: 'inactive',
      startScreenshare: jest.fn(),
      stopScreenshare: jest.fn(),
    }),
  };
});

jest.mock('customization-api', () => ({
  controlMessageEnum: {kickScreenshare: 'kickScreenshare'},
  useContent: () => mockContent,
  useLayout: () => mockLayout,
  useRtc: () => ({
    RtcEngineUnsafe: {
      addListener: jest.fn(),
      registerScreenShareStoppedCallback: jest.fn(),
      startScreenshare: jest.fn(),
      stopScreenshare: jest.fn(),
    },
  }),
}));

jest.mock('../../../pages/video-call/DefaultLayouts', () => ({
  getGridLayoutName: () => 'grid',
  getPinnedLayoutName: () => 'pinned',
  useChangeDefaultLayout: () => mockChangeLayout,
  useSetPinnedLayout: () => mockSetPinnedLayout,
}));

jest.mock('../../../components/contexts/ScreenShareContext', () => ({
  useScreenContext: () => mockScreenContext,
}));

jest.mock('../../../rtm-events-api', () => ({
  __esModule: true,
  default: {
    on: jest.fn(() => jest.fn()),
    send: jest.fn(async () => true),
  },
  PersistanceLevel: {Sender: 'sender'},
}));

jest.mock('../../../rtm-events', () => ({
  EventActions: {
    SCREENSHARE_STARTED: 'screenshare-started',
    SCREENSHARE_STOPPED: 'screenshare-stopped',
  },
  EventNames: {SCREENSHARE_ATTRIBUTE: 'screenshare-attribute'},
}));

jest.mock('../../recording/useRecordingLayoutQuery', () => ({
  __esModule: true,
  default: () => ({
    executeNormalQuery: jest.fn(),
    executePresenterQuery: jest.fn(),
  }),
}));

jest.mock('../../../logger/AppBuilderLogger', () => ({
  LogSource: {Internals: 'Internals'},
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  },
}));

jest.mock('../../../utils/useString', () => ({
  useString: () => () => 'Screen share error',
}));

jest.mock('../../../../react-native-toast-message', () => ({
  __esModule: true,
  default: {show: jest.fn()},
}));

jest.mock('../../../utils/getUniqueID', () => ({
  __esModule: true,
  default: () => 'test-id',
}));

jest.mock('../../../utils', () => ({
  filterObject: (value: Record<string, any>, predicate: Function) =>
    Object.fromEntries(Object.entries(value).filter(entry => predicate(entry))),
}));

import {DispatchContext} from '../../../../agora-rn-uikit';
import {ScreenshareConfigure} from '../ScreenshareConfigure.tsx';

const activeScreenShare = {
  101: {name: 'Screen 101', isActive: true, ts: 1000},
};

const renderConfigurator = (version: number) => (
  <DispatchContext.Provider value={{dispatch: mockDispatch} as any}>
    <ScreenshareConfigure isRecordingActive={false}>
      <React.Fragment key={version} />
    </ScreenshareConfigure>
  </DispatchContext.Provider>
);

const updateConfigurator = async (
  renderer: TestRenderer.ReactTestRenderer,
  version: number,
) => {
  await act(async () => {
    renderer.update(renderConfigurator(version));
  });
};

describe('ScreenshareConfigure interruption recovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockContent = {
      activeUids: [101, 100, 200],
      pinnedUid: 101,
      secondaryPinnedUid: 100,
      defaultContent: {
        101: {name: 'Screen 101', parentUid: 100, video: 1},
        100: {name: 'User 100', video: 1},
        200: {name: 'User 200', video: 1},
      },
    };
    mockLayout = {currentLayout: 'pinned'};
    mockScreenContext = {
      screenShareData: activeScreenShare,
      setScreenShareData: jest.fn(),
    };
  });

  it('restores the primary pin only after the interrupted screen republishes video', async () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(renderConfigurator(0));
    });
    mockDispatch.mockClear();
    mockSetPinnedLayout.mockClear();

    mockContent = {...mockContent, activeUids: [100, 200]};
    mockLayout = {currentLayout: 'grid'};
    await updateConfigurator(renderer, 1);
    expect(mockDispatch).not.toHaveBeenCalledWith({
      type: 'UserPin',
      value: [101],
    });

    mockContent = {
      ...mockContent,
      activeUids: [100, 200, 101],
      defaultContent: {
        ...mockContent.defaultContent,
        101: {...mockContent.defaultContent[101], video: 0},
      },
    };
    await updateConfigurator(renderer, 2);
    expect(mockDispatch).not.toHaveBeenCalledWith({
      type: 'UserPin',
      value: [101],
    });

    mockContent = {
      ...mockContent,
      defaultContent: {
        ...mockContent.defaultContent,
        101: {...mockContent.defaultContent[101], video: 1},
      },
    };
    await updateConfigurator(renderer, 3);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UserPin',
      value: [101],
    });
    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({type: 'UserSecondaryPin'}),
    );
    expect(mockSetPinnedLayout).toHaveBeenCalledTimes(1);

    renderer.unmount();
  });

  it('does not restore the interrupted screen after the user pins another tile', async () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(renderConfigurator(0));
    });
    mockDispatch.mockClear();
    mockSetPinnedLayout.mockClear();

    mockContent = {...mockContent, activeUids: [100, 200]};
    mockLayout = {currentLayout: 'grid'};
    await updateConfigurator(renderer, 1);

    mockContent = {
      ...mockContent,
      activeUids: [100, 200, 101],
      pinnedUid: 200,
      defaultContent: {
        ...mockContent.defaultContent,
        101: {...mockContent.defaultContent[101], video: 1},
      },
    };
    await updateConfigurator(renderer, 2);

    expect(mockDispatch).not.toHaveBeenCalledWith({
      type: 'UserPin',
      value: [101],
    });
    expect(mockSetPinnedLayout).not.toHaveBeenCalled();

    renderer.unmount();
  });
});
