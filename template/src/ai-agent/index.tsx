import React, {useEffect, useState, useContext} from 'react';
import {ILocalAudioTrack, IRemoteAudioTrack} from 'agora-rtc-sdk-ng';
import {View, TouchableOpacity, Text} from 'react-native';
import {
  MaxVideoView,
  useContent,
  useLocalUid,
  type LayoutComponent,
  useRtc,
  useLocalAudio,
  ToolbarPreset,
  useEndCall,
  useSidePanel,
  ToolbarItem,
  IconButton,
} from 'customization-api';
import {isMobileUA} from '../utils/common';
import AudioVisualizer, {DisconnectedView} from './components/AudioVisualizer';
import Bottombar from './components/Bottombar';
import CustomCreate from './components/CustomCreate';
import CustomCreateNative from './components/CustomCreateNative';
import {AudioVisualizerEffect} from './components/LocalAudioWave';
import MobileTopBar from './components/mobile/Topbar';
import MobileLayoutComponent from './components/mobile/MobileLayoutComponent';
import MobileBottombar from './components/mobile/Bottombar';
import {AgentProvider} from './components/AgentControls/AgentContext';
import {AgentContext} from './components/AgentControls/AgentContext';
import {AgentState} from './components/AgentControls/const';
import {
  AGENT_PROXY_URL,
  AGORA_SSO_LOGOUT_PATH,
  AGORA_SSO_BASE,
} from './components/AgentControls/const';
import CustomSidePanel from './components/CustomSidePanel';
import CustomLoginRoute from './routes/CustomLoginRoute';
import CustomValidateRoute from './routes/CustomValidateRoute';

const Topbar = () => {
  const {sidePanel, setSidePanel} = useSidePanel();

  React.useEffect(() => {
    setSidePanel('agent-transcript-panel');
  }, []);

  return (
    <ToolbarPreset
      align="top"
      items={{
        'meeting-title': {hide: true},
        'participant-count': {hide: true},
        'recording-status': {hide: true},
        chat: {hide: true},
        participant: {hide: true},
        settings: {hide: false},
        agentTanscript: {
          align: 'end',
          component: () => {
            const {agentAuthToken, setAgentAuthToken} =
              useContext(AgentContext);
            const isOpen = sidePanel === 'agent-transcript-panel';

            const handlePress = () => {
              setSidePanel(isOpen ? null : 'agent-transcript-panel');
            };
            return (
              <ToolbarItem>
                <IconButton
                  iconProps={{
                    name: 'chat-nav',
                    iconSize: 24,
                    tintColor: 'white',
                    iconBackgroundColor: isOpen
                      ? $config.PRIMARY_ACTION_BRAND_COLOR
                      : $config.ICON_BG_COLOR,
                  }}
                  btnTextProps={{
                    textColor: 'white',
                  }}
                  onPress={handlePress}
                />
              </ToolbarItem>
            );
          },
        },
        Logout: {
          align: 'end',
          component: () => {
            const {agentAuthToken, setAgentAuthToken} =
              useContext(AgentContext);
            const endcall = useEndCall();

            const ssoLogout = async () => {
              const logoutUrl = `${AGENT_PROXY_URL}/logout`;

              const response = await fetch(logoutUrl, {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${agentAuthToken}`,
                },
              });

              await endcall();
              setAgentAuthToken(null);

              const data = await response.json();

              console.log({logoutdata: data});

              return data;
            };
            const logout = async () => {
              try {
                // await ssoLogout()
                const originURL = window.location.origin + '/create';
                const frontend_redirect_creds = {
                  token: agentAuthToken,
                  frontend_redirect: originURL,
                };
                const REDIRECT_URL = `${AGENT_PROXY_URL}/logout?state=${JSON.stringify(
                  frontend_redirect_creds,
                )}`;
                const ssoUrl = `${AGORA_SSO_BASE}/${AGORA_SSO_LOGOUT_PATH}?redirect_uri=${REDIRECT_URL}`;
                // console.log({REDIRECT_URL})
                window.open(`${ssoUrl}`, '_self');
              } catch (error) {
                console.log({logoutFailed: error});
              }
            };

            return null;
            return (
              <TouchableOpacity
                style={{
                  display: 'flex',
                  height: 35,
                  padding: 20,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: '#00C2FF',
                  flexDirection: 'row',
                }}
                onPress={logout}>
                <Text style={{color: '#FFF'}}>Logout</Text>
              </TouchableOpacity>
            );
          },
        },
      }}
    />
  );
};

const DesktopLayoutComponent: LayoutComponent = () => {
  const localUid = useLocalUid();
  const {defaultContent, activeUids} = useContent();
  const {RtcEngineUnsafe} = useRtc();
  const [localTracks, setLocalTrack] = useState<ILocalAudioTrack | null>(null);
  const [remoteTrack, setRemoteTrack] = useState<IRemoteAudioTrack | null>(
    null,
  );
  const [mediaStreamTrack, setMediaStreamTrack] =
    React.useState<MediaStreamTrack>();

  const {agentConnectionState, setAgentConnectionState, agentUID} =
    useContext(AgentContext);

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
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 10,
      }}>
      <MaxVideoView
        user={{
          ...defaultContent[agentUID],
          name: 'OpenAI',
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
      <View
        style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          display: 'flex',
          flexDirection: 'row',
          height: 200,
          width: 300,
        }}>
        <MaxVideoView user={defaultContent[localUid]} hideMenuOptions={true} />
        <View
          style={{
            position: 'absolute',
            bottom: 16,
            right: 10,
          }}>
          {localTracks && (
            <AudioVisualizerEffect
              type="user"
              barWidth={3}
              minBarHeight={2}
              maxBarHeight={25}
              audioTrack={localTracks}
              borderRadius={2}
              gap={4}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export const AI_AGENT_CUSTOMIZATION = {
  components: {
    appRoot: AgentProvider,
    create: isMobileUA() ? CustomCreateNative : CustomCreate,
    //preferenceWrapper: AgentProvider,
    videoCall: {
      customLayout() {
        return [
          {
            name: 'Ai-Agent',
            label: 'Ai-Agent',
            icon: '🤖',
            component: isMobileUA()
              ? MobileLayoutComponent
              : DesktopLayoutComponent,
          },
        ];
      },
      customSidePanel: () => {
        return [
          {
            name: 'agent-transcript-panel',
            component: CustomSidePanel,
            title: 'Agent Transcript',
            onClose: () => {},
          },
        ];
      },
      topToolBar: isMobileUA() ? MobileTopBar : Topbar,
      bottomToolBar: isMobileUA() ? MobileBottombar : Bottombar,
    },
  },
  customRoutes: [
    {
      component: CustomLoginRoute,
      exact: true,
      path: '/login',
      isTopLevelRoute: true,
    },
    {
      component: CustomValidateRoute,
      exact: true,
      path: '/validate',
      isTopLevelRoute: true,
    },
  ],
};
