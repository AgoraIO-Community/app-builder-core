import ParticipantsView from '../../components/ParticipantsView';
import Chat from '../../components/Chat';
import Navbar, {
  ParticipantsCountView,
  ParticipantsIconButton,
  ChatIconButton,
  SettingsIconButton,
} from '../../components/Navbar';
import CopyJoinInfo from '../../subComponents/CopyJoinInfo';
import LayoutIconButton from '../../subComponents/LayoutIconButton';
import SettingsView from '../../components/SettingsView';
import Controls from '../../components/Controls';
import LiveStreamControls from '../../components/livestream/views/LiveStreamControls';
import LocalEndcall from '../../subComponents/LocalEndCall';
import LocalAudioMute from '../../subComponents/LocalAudioMute';
import LocalVideoMute from '../../subComponents/LocalVideoMute';
import Recording from '../../subComponents/Recording';
import LocalSwitchCamera from '../../subComponents/LocalSwitchCamera';
import ScreenshareButton from '../../subComponents/screenshare/ScreenshareButton';

import ChatBubble from '../../subComponents/ChatBubble';
import {ChatInput} from '../../subComponents/ChatInput';

const ToolbarComponents = {
  CopyJoinInfo,
  ParticipantsCountView,
  ParticipantsIconButton,
  ChatIconButton,
  LayoutIconButton,
  SettingsIconButton,
  LocalAudioMute,
  LocalVideoMute,
  LocalSwitchCamera,
  ScreenshareButton,
  Recording,
  LocalEndcall,
  LiveStreamControls,
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
