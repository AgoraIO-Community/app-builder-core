//hooks used for create/join meeting
export {default as useCreateRoom} from '../src/utils/useCreateRoom';
export {default as useJoinRoom} from '../src/utils/useJoinRoom';

//remove remote user from the call
export {default as useRemoteEndcall} from '../src/utils/useRemoteEndCall';
//switch camera
export {default as useSwitchCamera} from '../src/utils/useSwitchCamera';

export {controlMessageEnum} from '../src/components/ChatContext';
//audio/video toggle state
export {ToggleState} from '../agora-rn-uikit/src/Contexts/PropsContext';

export {
  useChatUIControls,
  ChatType,
} from '../src/components/chat-ui/useChatUIControls';
export type {ChatUIControlsInterface} from '../src/components/chat-ui/useChatUIControls';
