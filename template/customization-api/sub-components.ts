//Common components
export {default as TextInput} from '../src/atoms/TextInput';
//Icons
//export {Icons} from '../agora-rn-uikit';

// commented for v1 release
//create screen
//export {default as Create} from '../src/pages/Create';

// commented for v1 release
//share screen
//export {default as Share} from '../src/components/Share';

// commented for v1 release
//Precall components
export * from '../src/components/precall/index';

//video call components
export {
  ParticipantsView,
  ChatBubble,
  ChatInput,
  Chat,
  SettingsView,
  ChatAttachmentButton,
  ChatEmojiButton,
  ChatUploadStatus,
  ChatSendButton,
  ToolbarComponents,
} from '../src/pages/video-call/index';
export {default as GridLayout} from '../src/components/GridVideo';
export {default as PinnedLayout} from '../src/components/PinnedVideo';
export {default as VideoComponent} from '../src/pages/video-call/VideoComponent';
export {default as MaxVideoView} from '../src/pages/video-call/VideoRenderer';
export type {VideoRendererProps as MaxVideoViewProps} from '../src/pages/video-call/VideoRenderer';
export {default as NameWithMicIcon} from '../src/pages/video-call/NameWithMicIcon';
export {default as NetworkQualityPill} from '../src/subComponents/NetworkQualityPill';
//videocall screen
export {default as VideocallScreen} from '../src/pages/video-call/VideoCallScreen';
export {default as PrecallScreen} from '../src/components/Precall';
export {default as VBPanel} from '../src/components/virtual-background/VBPanel';
export {WhiteboardListener} from '../src/components/Controls';

// commented for v1 release
//Settings screen
//export {default as HostControlView} from '../src/components/HostControlView';
// export {
//   default as SelectDevice,
//   SelectDeviceComponentsArray,
// } from '../src/subComponents/SelectDevice';
//export {default as LanguageSelector} from '../src/subComponents/LanguageSelector';

//Sidepanel buttons
//export {SidePanelButtonsArray} from '../src/subComponents/SidePanelButtons';
export {
  MaxVideoView as UiKitMaxVideoView,
  ClientRoleType as UikitClientRole,
  ChannelProfileType as UikitChannelProfile,
  PropsContext as UikitPropsContext,
} from '../agora-rn-uikit';
export {default as Toolbar} from '../src/atoms/Toolbar';
export {default as ToolbarItem} from '../src/atoms/ToolbarItem';
export {default as ToolbarPreset} from '../src/atoms/ToolbarPreset';
export {default as ToolbarMenu} from '../src/atoms/ToolbarMenu';
export type {
  ToolbarPresetAlign,
  ToolbarDefaultItem,
  ToolbarDefaultItemsConfig,
  ToolbarHideCallback,
  ToolbarMoreButtonDefaultFields,
  ToolbarMoreButtonCustomFields,
  ToolbarMoreDefaultItem,
  ToolbarItemsConfig,
  TopToolbarItemsConfig,
  BottomToolbarItemsConfig,
  TopToolbarDefaultKeys,
  BottomToolbarDefaultKeys,
  ToolbarItemAlign,
  ToolbarItemHide,
  ToolbarPresetProps,
  ToolbarItemLabel,
  ToolbarItemLabelCallback,
} from '../src/atoms/ToolbarPreset';
export {default as TranscriptPanel} from '../src/subComponents/caption/Transcript';
export type {TranscriptProps} from '../src/subComponents/caption/Transcript';
export {default as CaptionPanel} from '../src/subComponents/caption/CaptionContainer';
export {default as VBPreview} from '../src/components/virtual-background/VideoPreview';
export {default as Toast} from '../react-native-toast-message';
export {default as CaptionContainer} from '../src/subComponents/caption/CaptionContainer';
export {default as Loading} from '../src/subComponents/Loading';
export {default as UserAvatar} from '../src/atoms/UserAvatar';
export {default as Card} from '../src/atoms/Card';
export {default as ThemeConfig} from '../src/theme';
export {default as SelectDevice} from '../src/subComponents/SelectDevice';
export {EditName} from '../src/components/SettingsView';
export {
  UserActionMenuItem,
  type UserActionMenuItemProps,
} from '../src/atoms/ActionMenu';
