//Common components
export {default as HorizontalRule} from '../src/atoms/HorizontalRule';
export {default as PrimaryButton} from '../src/atoms/PrimaryButton';
export {default as SecondaryButton} from '../src/atoms/SecondaryButton';
export {default as TextInput} from '../src/atoms/TextInput';
//Icons
export {Icons} from '../agora-rn-uikit';

// commented for v1 release
//create screen
//export {default as Create} from '../src/pages/Create';

// commented for v1 release
//share screen
//export {default as Share} from '../src/components/Share';

// commented for v1 release
//Precall components
//export * from '../src/components/precall/index';

//video call components
export {
  ParticipantsView,
  Controls,
  ControlsComponentsArray,
  Navbar,
  NavBarComponentsArray,
  ChatBubble,
  ChatSendButton,
  ChatTextInput,
  Chat,
  SettingsView,
} from '../src/pages/video-call/index';
export {default as GridLayout} from '../src/components/GridVideo';
export {default as PinnedLayout} from '../src/components/PinnedVideo';
export {default as VideoComponent} from '../src/pages/video-call/VideoComponent';
export {default as MaxVideoView} from '../src/pages/video-call/VideoRenderer';
export {default as RenderComponent} from '../src/pages/video-call/RenderComponent';
export {default as NameWithMicIcon} from '../src/pages/video-call/NameWithMicIcon';
export {default as NetworkQualityPill} from '../src/subComponents/NetworkQualityPill';
//videocall screen
export {default as VideocallScreen} from '../src/pages/video-call/VideoCallScreen';

// commented for v1 release
//Settings screen
//export {default as HostControlView} from '../src/components/HostControlView';
// export {
//   default as SelectDevice,
//   SelectDeviceComponentsArray,
// } from '../src/subComponents/SelectDevice';
//export {default as LanguageSelector} from '../src/subComponents/LanguageSelector';

//Sidepanel buttons
export {SidePanelButtonsArray} from '../src/subComponents/SidePanelButtons';
export {
  ImageIcon as UiKitImageIcon,
  MaxVideoView as UiKitMaxVideoView,
  BtnTemplate as UiKitBtnTemplate,
  ClientRole as UikitClientRole,
  ChannelProfile as UikitChannelProfile,
} from '../agora-rn-uikit';
export type {BtnTemplateInterface as UikitBtnTemplateInterface} from '../agora-rn-uikit';
