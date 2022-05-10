import {SidePanelType} from 'fpe-api';
import ParticipantsView from '../../components/ParticipantsView';
import SettingsView from '../../components/SettingsView';
import Chat from '../../components/Chat';
export const DefaultSidePanels: SidePanelType[] = [
  {
    name: 'participants-view',
    iconName: (isPanelActive) =>
      isPanelActive ? 'participantFilledIcon' : 'participantIcon',
    component: ParticipantsView,
  },
  {
    name: 'chat-view',
    iconName: (isPanelActive) =>
      isPanelActive ? 'chatIconFilled' : 'chatIcon',
    component: Chat,
  },
  {
    name: 'setting-view',
    iconName: (isPanelActive) =>
      isPanelActive ? 'settingsFilled' : 'settings',
    component: SettingsView,
  },
];

export const getSidepanelNameForParticipantView = () =>
  DefaultSidePanels[0].name;
export const getSidepanelNameForChatView = () => DefaultSidePanels[1].name;
export const getSidepanelNameForSettingView = () => DefaultSidePanels[2].name;
