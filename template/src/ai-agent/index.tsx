import React, {lazy} from 'react';
import {CustomizationApiInterface} from 'customization-api';
import {isMobileUA} from '../utils/common';
import Bottombar from './components/Bottombar';
import CustomCreate from './components/CustomCreate';
import MobileTopBar from './components/mobile/Topbar';
import MobileBottombar from './components/mobile/Bottombar';
import CustomChatPanel from './components/CustomChatPanel';
import CustomSettingsPanel from './components/CustomSettingsPanel';
import {AgentProvider} from './components/AgentControls/AgentContext';

//lazy loading the layout components
//LAYOUT_TYPE_1
const DefaultLayout = lazy(() => import('./layout/DefaultLayout'));
//LAYOUT_TYPE_2
const ConversationalAILayout = lazy(() => import('./layout/ConversationalAI'));
//LAYOUT_TYPE_3
const NewAnimationLayout = lazy(() => import('./layout/NewAnimation'));

const DummyComponent = () => {
  return <></>;
};

const getTopBarComponent = () => {
  return isMobileUA() || $config.AI_LAYOUT !== 'LAYOUT_TYPE_1'
    ? MobileTopBar
    : DummyComponent;
};

const getBottombarComponent = () => {
  return isMobileUA()
    ? MobileBottombar
    : $config.AI_LAYOUT === 'LAYOUT_TYPE_1'
    ? Bottombar
    : DummyComponent;
};

const getCustomLayoutComponent = () => {
  return $config.AI_LAYOUT === 'LAYOUT_TYPE_3'
    ? NewAnimationLayout
    : $config.AI_LAYOUT === 'LAYOUT_TYPE_2'
    ? ConversationalAILayout
    : DefaultLayout;
};
export const AI_AGENT_CUSTOMIZATION: CustomizationApiInterface = {
  components: {
    create: CustomCreate,
    videoCall: {
      wrapper: AgentProvider,
      customLayout() {
        return [
          {
            name: $config.AI_LAYOUT,
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
