/**
 * Core contexts
 */
import {createHook} from 'customization-implementation';
import {RtcContext, ContentContext} from '../agora-rn-uikit';

import {default as DeviceContext} from '../src/components/DeviceContext';
import {default as StorageContext} from '../src/components/StorageContext';
import {ErrorContext} from '../src/components/common/Error';
import {AgentContext} from '../src/ai-agent/components/AgentControls/AgentContext';
/**
 * The RTC app state exposes the internal RtcEngine object as well as dispatch interface to perform various actions.
 */
export const useRtc = createHook(RtcContext);
/**
 * The Render app state governs the information necessary to render each user content view displayed in the videocall screen.
 */
export const useContent = createHook(ContentContext);

export {useLocalUserInfo} from '../src/app-state/useLocalUserInfo';

export const useDeviceContext = createHook(DeviceContext);
export const useStorageContext = createHook(StorageContext);
export const useErrorContext = createHook(ErrorContext);

export const useAIAgent = createHook(AgentContext);
/**
 * UI contexts
 */
// commented for v1 release
export {usePreCall} from '../src/components/precall/usePreCall';
export type {PreCallContextInterface} from '../src/components/precall/usePreCall';
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
export {
  useRoomInfo,
  RoomInfoDefaultValue,
} from '../src/components/room-info/useRoomInfo';
export type {RoomInfoContextInterface} from '../src/components/room-info/useRoomInfo';
export {useSetRoomInfo} from '../src/components/room-info/useSetRoomInfo';
export {useMessages} from '../src/app-state/useMessages';
export type {messageInterface} from '../src/app-state/useMessages';
export {SidePanelType} from '../src/subComponents/SidePanelEnum';
export {useSidePanel} from '../src/utils/useSidePanel';

export {useNoiseSupression} from '../src/app-state/useNoiseSupression';
export {useVideoQuality} from '../src/app-state/useVideoQuality';

//hook used to get/set username
export {default as useUserName} from '../src/utils/useUserName';

export {
  useChatUIControls,
  ChatType,
} from '../src/components/chat-ui/useChatUIControls';
export type {ChatUIControlsInterface} from '../src/components/chat-ui/useChatUIControls';
export {useVirtualBackground} from '../src/app-state/useVirtualBackground';
export {useBeautyEffects} from '../src/app-state/useBeautyEffects';
export {useLiveStreamDataContext} from '../src/components/contexts/LiveStreamDataContext';
export {useRtm} from '../src/components/ChatContext';
export {useGetHostIds} from '../src/utils/useGetHostUids';
export type {AIAgentContextInterface} from '../src/ai-agent/components/AgentControls/AgentContext';
export type {AIAgentState} from '../src/ai-agent/components/AgentControls/const';
export {useUserActionMenu} from '../src/components/useUserActionMenu';
