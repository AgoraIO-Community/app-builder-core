/**
 * Core contexts
 */
import {createHook} from 'fpe-implementation';
import {
  RtcContext,
  RenderContext,
  PropsContext,
  LocalContext,
} from '../agora-rn-uikit';
// commented for v1 release
//import {default as DeviceContext} from '../src/components/DeviceContext';
//import {default as StorageContext} from '../src/components/StorageContext';

export const useRtcContext = createHook(RtcContext);
export const useRenderContext = createHook(RenderContext);
export const usePropsContext = createHook(PropsContext);
export const useLocalContext = createHook(LocalContext);
// commented for v1 release
//export const useDeviceContext = createHook(DeviceContext);
//export const useStorageContext = createHook(StorageContext);

/**
 * UI contexts
 */
// commented for v1 release
//export {usePreCall} from '../src/components/precall/usePreCall';
//export type {PreCallContextInterface} from '../src/components/precall/usePreCall';
export {useLayout} from '../src/utils/useLayout';
export type {LayoutContextInterface} from '../src/utils/useLayout';
// commented for v1 release
// export {
//   useShareLink,
//   SHARE_LINK_CONTENT_TYPE,
// } from '../src/components/useShareLink';
//export type {ShareLinkContextInterface} from '../src/components/useShareLink';
// export {useScreenshare} from '../src/subComponents/screenshare/useScreenshare';
// export type {ScreenshareContextInterface} from '../src/subComponents/screenshare/useScreenshare';
export {useRecording} from '../src/subComponents/recording/useRecording';
export type {RecordingContextInterface} from '../src/subComponents/recording/useRecording';
export {useMeetingInfo} from '../src/components/meeting-info/useMeetingInfo';
export type {MeetingInfoContextInterface} from '../src/components/meeting-info/useMeetingInfo';
// commented for v1 release
// export {useChatUIControl} from '../src/components/chat-ui/useChatUIControl';
// export type {ChatUIControlInterface} from '../src/components/chat-ui/useChatUIControl';
