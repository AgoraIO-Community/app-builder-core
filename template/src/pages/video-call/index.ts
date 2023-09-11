import ParticipantsView from '../../components/ParticipantsView';
import Chat from '../../components/Chat';
import Navbar, {
  MeetingTitleToolbarItem,
  ParticipantCountToolbarItem,
  RecordingStatusToolbarItem,
  ChatToolbarItem,
  ParticipantToolbarItem,
  SettingsToobarItem,
} from '../../components/Navbar';
import Controls, {
  LayoutToolbarItem,
  InviteToolbarItem,
  RaiseHandToolbarItem,
  LocalAudioToolbarItem,
  LocalVideoToolbarItem,
  SwitchCameraToolbarItem,
  ScreenShareToolbarItem,
  RecordingToolbarItem,
  LocalEndcallToolbarItem,
} from '../../components/Controls';
import ChatBubble from '../../subComponents/ChatBubble';
import {ChatInput} from '../../subComponents/ChatInput';
import SettingsView from '../../components/SettingsView';

const ToolbarComponents = {
  MeetingTitleToolbarItem,
  ParticipantCountToolbarItem,
  RecordingStatusToolbarItem,
  ChatToolbarItem,
  ParticipantToolbarItem,
  SettingsToobarItem,
  LayoutToolbarItem,
  InviteToolbarItem,
  RaiseHandToolbarItem,
  LocalAudioToolbarItem,
  LocalVideoToolbarItem,
  SwitchCameraToolbarItem,
  ScreenShareToolbarItem,
  RecordingToolbarItem,
  LocalEndcallToolbarItem,
};
export {
  ParticipantsView,
  Chat,
  Navbar,
  SettingsView,
  Controls,
  ChatBubble,
  ChatInput,
  ToolbarComponents,
};
