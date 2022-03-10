/**
 * Core contexts
 */
export {RtcContext, MinUidContext, MaxUidContext, LocalUserContext, PropsContext, LocalContext} from '../agora-rn-uikit';
export {default as ChatContext} from '../src/components/ChatContext';
export {default as DeviceContext} from '../src/components/DeviceContext';
export {default as StorageContext} from '../src/components/StorageContext';

/**
 * UI contexts
 */
export { type PreCallContextInterface, PreCallProvider, usePreCall } from '../src/components/precall/usePreCall';
export { type VideoCallContextInterface, VideoCallProvider, useVideoCall } from '../src/pages/VideoCall/useVideoCall';
export { type ChatUIDataInterface, type privateMsgLastSeenInterface, ChatUIDataProvider, useChatUIData } from '../src/components/useChatUI';
export { type ShareLinkContextInterface, useShareLink, ShareLinkProvider } from '../src/pages/Create/ShareLink';
export { type ScreenShareContextInterface, useScreenShare, ScreenShareProvider  } from '../src/subComponents/screen-share/useScreenShare';
export { type RecordingContextInterface, useRecording, RecordingProvider} from '../src/subComponents/recording/useRecording';