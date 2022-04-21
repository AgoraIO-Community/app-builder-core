/**
 * Core contexts
 */
import {createHook} from 'fpe-implementation';
import {
  RtcContext,
  MinUidContext,
  MaxUidContext,
  PropsContext,
  LocalContext,
} from '../agora-rn-uikit';
import {default as DeviceContext} from '../src/components/DeviceContext';
import {default as StorageContext} from '../src/components/StorageContext';

export const useRtcContext = createHook(RtcContext);
export const useMinUidContext = createHook(MinUidContext);
export const useMaxUidContext = createHook(MaxUidContext);
export const usePropsContext = createHook(PropsContext);
export const useLocalContext = createHook(LocalContext);
export const useDeviceContext = createHook(DeviceContext);
export const useStorageContext = createHook(StorageContext);

/**
 * UI contexts
 */
export {
  PreCallProvider,
  usePreCall,
} from '../src/components/precall/usePreCall';
export type {PreCallContextInterface} from '../src/components/precall/usePreCall';
export {
  VideoCallProvider,
  useVideoCall,
} from '../src/pages/video-call/useVideoCall';
export type {VideoCallContextInterface} from '../src/pages/video-call/useVideoCall';
export {useShareLink, ShareLinkProvider} from '../src/pages/ShareLink';
export type {ShareLinkContextInterface} from '../src/pages/ShareLink';
export {
  useScreenshare,
  ScreenshareProvider,
} from '../src/subComponents/screenshare/index';
export type {ScreenshareContextInterface} from '../src/subComponents/screenshare/index';
export {
  useRecording,
  RecordingProvider,
} from '../src/subComponents/recording/useRecording';
export type {RecordingContextInterface} from '../src/subComponents/recording/useRecording';
