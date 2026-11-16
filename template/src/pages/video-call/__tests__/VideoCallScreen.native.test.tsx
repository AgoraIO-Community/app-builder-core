import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import {AppState, PermissionsAndroid} from 'react-native';
import ForegroundService from '@supersami/rn-foreground-service';
import {RtcContext} from '../../../../agora-rn-uikit';
import VideoCallScreen from '../VideoCallScreen.native';

jest.mock('react-native', () => ({
  AppRegistry: {registerComponent: jest.fn()},
  AppState: {currentState: 'active'},
  Platform: {OS: 'android'},
  PermissionsAndroid: {
    PERMISSIONS: {RECORD_AUDIO: 'android.permission.RECORD_AUDIO'},
    check: jest.fn(),
  },
}));
jest.mock('@supersami/rn-foreground-service', () => ({
  register: jest.fn(),
  add_task: jest.fn(),
  start: jest.fn(async () => undefined),
}));
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({children}: {children: React.ReactNode}) => children,
}));
jest.mock('../../../../agora-rn-uikit', () => ({
  RtcContext: require('react').createContext({rtcTracksReady: false}),
}));
jest.mock('customization-implementation', () => ({
  useCustomization: () => ({VideocallWrapper: require('react').Fragment}),
}));
jest.mock('../../../utils/common', () => ({isValidReactComponent: jest.fn()}));
jest.mock('../VideoCallMobileView', () => () => null);

const permissionCheck = PermissionsAndroid.check as jest.Mock;

async function renderScreen(ready: boolean) {
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(
      <RtcContext.Provider value={{rtcTracksReady: ready} as any}>
        <VideoCallScreen />
      </RtcContext.Provider>,
    );
  });
  return renderer;
}

beforeEach(() => {
  jest.clearAllMocks();
  AppState.currentState = 'active';
  permissionCheck.mockResolvedValue(true);
});

it('waits for RTC initialization before starting the microphone service', async () => {
  const renderer = await renderScreen(false);
  expect(permissionCheck).not.toHaveBeenCalled();
  expect(ForegroundService.start).not.toHaveBeenCalled();
  act(() => renderer.unmount());
});

it('starts the service only after microphone permission has been checked', async () => {
  const renderer = await renderScreen(true);
  expect(permissionCheck).toHaveBeenCalledWith(
    'android.permission.RECORD_AUDIO',
  );
  expect(ForegroundService.start).toHaveBeenCalledTimes(1);
  act(() => renderer.unmount());
});

it('does not start a microphone service when permission is denied', async () => {
  permissionCheck.mockResolvedValue(false);
  const renderer = await renderScreen(true);
  expect(ForegroundService.start).not.toHaveBeenCalled();
  act(() => renderer.unmount());
});

it('does not start a microphone service from the background', async () => {
  AppState.currentState = 'background';
  const renderer = await renderScreen(true);
  expect(ForegroundService.start).not.toHaveBeenCalled();
  act(() => renderer.unmount());
});

it('does not start the service after the call screen has unmounted', async () => {
  let resolvePermission!: (granted: boolean) => void;
  permissionCheck.mockReturnValue(
    new Promise(resolve => {
      resolvePermission = resolve;
    }),
  );
  const renderer = await renderScreen(true);
  act(() => renderer.unmount());
  await act(async () => resolvePermission(true));
  expect(ForegroundService.start).not.toHaveBeenCalled();
});
