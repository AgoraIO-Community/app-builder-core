/**
 * Core contexts
 */
import {createHook} from 'customization-implementation';
import {RtcContext, RenderContext} from '../agora-rn-uikit';

// commented for v1 release
//import {default as DeviceContext} from '../src/components/DeviceContext';
//import {default as StorageContext} from '../src/components/StorageContext';
/**
 * The RTC app state exposes the internal RtcEngine object as well as dispatch interface to perform various actions.
 */
export const useRtc = createHook(RtcContext);
/**
 * The Render app state governs the information necessary to render each user content view displayed in the videocall screen.
 */
export const useRender = createHook(RenderContext);

export {useLocalUserInfo} from '../src/app-state/useLocalUserInfo';

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
export {useChatUIControl} from '../src/components/chat-ui/useChatUIControl';
export type {ChatUIControlInterface} from '../src/components/chat-ui/useChatUIControl';
export {useMessages} from '../src/app-state/useMessages';
export type {messageInterface} from '../src/app-state/useMessages';
export {SidePanelType} from '../src/subComponents/SidePanelEnum';
export {useSidePanel} from '../src/utils/useSidePanel';

//hook used to get/set username
export {default as useUserName} from '../src/utils/useUserName';
