import React from 'react';
import {CustomizationApiInterface} from 'customization-api';
import {isMobileUA} from '../utils/common';
import Bottombar from './components/Bottombar';
import CustomCreate from './components/CustomCreate';
import MobileTopBar from './components/mobile/Topbar';
import MobileBottombar from './components/mobile/Bottombar';
import CustomChatPanel from './components/CustomChatPanel';
import CustomSettingsPanel from './components/CustomSettingsPanel';
import {AgentProvider} from './components/AgentControls/AgentContext';

//LAYOUT_TYPE_1
import NewAnimationLayout from './layout/NewAnimation';
//LAYOUT_TYPE_2
import AIWithLocalUser from './layout/AIWithLocalUser';
//LAYOUT_TYPE_3
import ConversationalAILayout from './layout/ConversationalAI';

const DummyComponent = () => {
  return <></>;
};

const getAILayoutType = () => {
  return $config.AI_LAYOUT ? $config.AI_LAYOUT : 'LAYOUT_TYPE_1';
};

const getTopBarComponent = () => {
  return isMobileUA() || getAILayoutType() !== 'LAYOUT_TYPE_2'
    ? MobileTopBar
    : DummyComponent;
};

const getBottombarComponent = () => {
  return isMobileUA()
    ? MobileBottombar
    : getAILayoutType() === 'LAYOUT_TYPE_2'
    ? Bottombar
    : DummyComponent;
};

const getCustomLayoutComponent = () => {
  return getAILayoutType() === 'LAYOUT_TYPE_3'
    ? ConversationalAILayout
    : getAILayoutType() === 'LAYOUT_TYPE_2'
    ? AIWithLocalUser
    : NewAnimationLayout;
};

export const AI_AGENT_CUSTOMIZATION: CustomizationApiInterface = {
  components: {
    create: CustomCreate,
    videoCall: {
      wrapper: AgentProvider,
      customLayout() {
        return [
          {
            name: getAILayoutType(),
            label: 'Ai-Agent',
            icon: '',
            component: getCustomLayoutComponent(),
          },
        ];
      },
      customSidePanel: () => {
        return [
          {
            name: 'custom-settings-panel',
            component: CustomSettingsPanel,
            title: 'Settings',
            onClose: () => {},
          },
          {
            name: 'agent-transcript-panel',
            component: CustomChatPanel,
            title: 'Transcript',
            onClose: () => {},
          },
        ];
      },
      topToolBar: getTopBarComponent(),
      bottomToolBar: getBottombarComponent(),
    },
  },
};
