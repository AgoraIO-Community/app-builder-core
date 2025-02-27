import React, {useEffect, useState, useContext} from 'react';
import {ILocalAudioTrack, IRemoteAudioTrack} from 'agora-rtc-sdk-ng';
import {View, Text} from 'react-native';
import {
  MaxVideoView,
  useContent,
  useLocalUid,
  type LayoutComponent,
  useRtc,
  useLocalAudio,
  CustomizationApiInterface,
  Spacer,
  useLayout,
  CustomAgentInterfaceProps,
} from 'customization-api';
import {isMobileUA} from '../utils/common';
import AudioVisualizer, {DisconnectedView} from './components/AudioVisualizer';
import Bottombar from './components/Bottombar';
import CustomCreate from './components/CustomCreate';
import MobileTopBar from './components/mobile/Topbar';
import MobileBottombar from './components/mobile/Bottombar';
import {AgentState, AIAgentState} from './components/AgentControls/const';
import CustomChatPanel from './components/CustomChatPanel';
import CustomSettingsPanel from './components/CustomSettingsPanel';
import {
  AgentContext,
  AgentProvider,
} from './components/AgentControls/AgentContext';
import {ConversationalAI} from './layout/ConversationalAI';
import {DefaultAIOnly} from './layout/DefaultAIOnly';

const Topbar = () => {
  const {currentLayout} = useLayout();
  const [showMobileLayout, setShowMobileLayout] = useState(false);

  useEffect(() => {
    if (currentLayout === 'conversational-ai') {
      setShowMobileLayout(true);
    } else {
      setShowMobileLayout(false);
    }
  }, [currentLayout]);

  if (showMobileLayout) {
    return <MobileTopBar />;
  }

  return <></>;
};

const DesktopLayoutComponent: LayoutComponent = () => {
  const localUid = useLocalUid();
  const {defaultContent, activeUids} = useContent();
  const {RtcEngineUnsafe} = useRtc();
  const [localTracks, setLocalTrack] = useState<ILocalAudioTrack | null>(null);
  const [remoteTrack, setRemoteTrack] = useState<IRemoteAudioTrack | null>(
    null,
  );

  const {agentConnectionState, agentUID} = useContext(AgentContext);

  const {getLocalAudioStream, getRemoteAudioStream} = useLocalAudio();

  const connected = activeUids.includes(agentUID);
  console.log({activeUids}, 'active uids');

  // this state occurs when agent_stop is successful, but
  // user is still not disconnected from the RTC channel - state-of-wait
  const isAwaitingLeave = agentConnectionState === AgentState.AWAITING_LEAVE;
  console.log(
    {isAwaitingLeave},
    {connected},
    'what is going on',
    agentConnectionState,
  );
  useEffect(() => {
    if (getLocalAudioStream()) {
      setLocalTrack(getLocalAudioStream());
    }
  }, [RtcEngineUnsafe]);

  useEffect(() => {
    if (getRemoteAudioStream(agentUID)) {
      setRemoteTrack(getRemoteAudioStream(agentUID));
    }
  }, [activeUids]);

  return (
    <View
      style={[
        {flex: 1, display: 'flex', flexDirection: 'row'},
        isMobileUA() ? {marginBottom: 100} : {},
      ]}>
      <View
        style={[
          {
            flex: 2,
            display: 'flex',
            flexDirection: 'row',
            borderRadius: 10,
          },
          isMobileUA() ? {flexDirection: 'column', padding: 12} : {},
        ]}>
        <View style={{flex: 1}}>
          <MaxVideoView
            user={{
              ...defaultContent[agentUID],
              name: 'Ai Agent',
              video: false,
            }}
            CustomChild={() =>
              // show agent voice waves, when agent is connected to the channel, but also not on a state-of-wait,
              connected && !isAwaitingLeave ? (
                <AudioVisualizer audioTrack={remoteTrack} />
              ) : (
                <DisconnectedView isConnected={connected} />
              )
            }
            hideMenuOptions={true}
          />
        </View>
        {connected && !isAwaitingLeave ? (
          <>
            <Spacer size={8} horizontal={isMobileUA() ? false : true} />
            <View style={{flex: 1}}>
              <MaxVideoView
                user={defaultContent[localUid]}
                hideMenuOptions={true}
              />
            </View>
          </>
        ) : (
          <></>
        )}
      </View>
    </View>
  );
};

// const AiAgentCustomView = ({connectionState}: CustomAgentInterfaceProps) => {
//   return (
//     <View
//       style={{
//         flex: 1,
//         backgroundColor: $config.VIDEO_AUDIO_TILE_COLOR,
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//       }}>
//       <Text style={{color: $config.FONT_COLOR}}>{connectionState}</Text>
//     </View>
//   );
// };

export const AI_AGENT_CUSTOMIZATION: CustomizationApiInterface = {
  components: {
    create: CustomCreate,
    videoCall: {
      wrapper: AgentProvider,
      //customAgentInterface: AiAgentCustomView,
      customLayout() {
        return [
          {
            name: 'Ai-Agent',
            label: 'Ai-Agent',
            icon: '🤖',
            component: DesktopLayoutComponent,
          },
          {
            name: 'conversational-ai',
            label: 'Conversational AI',
            icon: '🤖',
            component: ConversationalAI,
          },
          {
            name: 'default-ai-only',
            label: 'Default AI Only',
            icon: '🤖',
            component: DefaultAIOnly,
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
      topToolBar: isMobileUA() ? MobileTopBar : Topbar,
      bottomToolBar: isMobileUA() ? MobileBottombar : Bottombar,
    },
  },
};
