import React, {Suspense, useContext, useEffect, useRef, useState} from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  LayoutComponent,
  MUTE_LOCAL_TYPE,
  useSidePanel,
  useLocalUserInfo,
  useMuteToggleLocal,
  SidePanelType,
} from 'customization-api';
import ThemeConfig from '../../theme';
import {AgentContext} from '../components/AgentControls/AgentContext';
import {AgentState} from '../components/AgentControls/const';
import {useIsAgentAvailable} from '../components/utils';

//@ts-ignore
import JoinCallIcon from '../assets/join-call.png';
//@ts-ignore
import MicOnIcon from '../assets/mic-on.png';
//@ts-ignore
import MicOffIcon from '../assets/mic-off.png';
//@ts-ignore
import TranscriptIcon from '../assets/transcript.png';
//@ts-ignore
import SettingsIcon from '../assets/settings.png';
//@ts-ignore
import DisconnectIcon from '../assets/close.png';
const {Application} = require('@splinetool/runtime');

const MicButton = () => {
  const {audio} = useLocalUserInfo();
  const muteToggle = useMuteToggleLocal();
  return (
    <TouchableOpacity
      style={{
        backgroundColor: audio
          ? $config.PRIMARY_ACTION_BRAND_COLOR
          : $config.TOOLBAR_COLOR,
        borderRadius: 50,
      }}
      onPress={() => muteToggle(MUTE_LOCAL_TYPE.audio)}>
      <Image style={styles.iconStyle} source={audio ? MicOnIcon : MicOffIcon} />
    </TouchableOpacity>
  );
};
const TranscriptButton = () => {
  const {setSidePanel, sidePanel} = useSidePanel();
  return (
    <TouchableOpacity
      style={{
        backgroundColor:
          sidePanel === 'agent-transcript-panel'
            ? $config.PRIMARY_ACTION_BRAND_COLOR
            : $config.TOOLBAR_COLOR,
        borderRadius: 50,
      }}
      onPress={() => {
        if (sidePanel === 'agent-transcript-panel') {
          setSidePanel(SidePanelType.None);
        } else if (sidePanel !== 'agent-transcript-panel') {
          setSidePanel('agent-transcript-panel');
        }
      }}>
      <Image style={styles.iconStyle} source={TranscriptIcon} />
    </TouchableOpacity>
  );
};

const SettingButton = () => {
  const {setSidePanel, sidePanel} = useSidePanel();
  return (
    <TouchableOpacity
      style={{
        backgroundColor:
          sidePanel === 'custom-settings-panel'
            ? $config.PRIMARY_ACTION_BRAND_COLOR
            : $config.TOOLBAR_COLOR,
        borderRadius: 50,
      }}
      onPress={() => {
        if (sidePanel === 'custom-settings-panel') {
          setSidePanel(SidePanelType.None);
        } else if (sidePanel !== 'custom-settings-panel') {
          setSidePanel('custom-settings-panel');
        }
      }}>
      <Image style={styles.iconStyle} source={SettingsIcon} />
    </TouchableOpacity>
  );
};

const DisconnectButton = () => {
  const {toggleAgentConnection} = useContext(AgentContext);
  return (
    <TouchableOpacity
      style={{backgroundColor: $config.SEMANTIC_ERROR, borderRadius: 50}}
      onPress={() => {
        toggleAgentConnection(true);
      }}>
      <Image style={styles.iconStyle} source={DisconnectIcon} />
    </TouchableOpacity>
  );
};

export const ConversationalAI: LayoutComponent = () => {
  const {agentConnectionState, toggleAgentConnection} =
    useContext(AgentContext);
  // const spline = useRef();
  // const sphere = useRef();

  useEffect(() => {
    setTimeout(() => {
      // make sure you have a canvas in the body
      const canvas = document.getElementById('ai-agent') as HTMLCanvasElement;

      // start the application and load the scene
      const spline = new Application(canvas);
      spline.load(
        'https://d1i64xs2div6cu.cloudfront.net/scene-250216.splinecode',
      );
    });
  }, []);

  function onLoad(splineApp) {
    // save the app in a ref for later use
    // spline.current = splineApp;
    // sphere.current = splineApp.findObjectByName('Sphere');
  }

  const isLoading =
    agentConnectionState === AgentState.REQUEST_SENT ||
    agentConnectionState === AgentState.AGENT_DISCONNECT_REQUEST ||
    agentConnectionState === AgentState.AWAITING_JOIN;
  const isAwaitingLeave = agentConnectionState === AgentState.AWAITING_LEAVE;
  const isStartAgent =
    agentConnectionState === AgentState.NOT_CONNECTED ||
    agentConnectionState === AgentState.AGENT_REQUEST_FAILED ||
    isAwaitingLeave;
  const isAgentAvailable = useIsAgentAvailable();

  return (
    <View style={styles.layoutRootContainer}>
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeInnerContainer}>
          <Text style={styles.welcomeText}>Hi</Text>
        </View>
      </View>
      <View style={styles.container}>
        <canvas id="ai-agent" width="100%" height="100%"></canvas>
        {/* <Suspense fallback={<div>Loading...</div>}>
          <Spline
            scene="https://d1i64xs2div6cu.cloudfront.net/scene-250216.splinecode"
            onLoad={onLoad}
          />
        </Suspense> */}
      </View>
      <View style={styles.btnContainer}>
        {!isLoading && agentConnectionState === 'AGENT_CONNECTED' ? (
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-evenly',
            }}>
            <MicButton />
            <TranscriptButton />
            <SettingButton />
            <DisconnectButton />
          </View>
        ) : (
          <TouchableOpacity
            disabled={isLoading || !isAgentAvailable}
            style={[
              styles.callAgentBtnContainer,
              agentConnectionState === AgentState.AGENT_DISCONNECT_REQUEST
                ? {backgroundColor: $config.SEMANTIC_ERROR}
                : {},
            ]}
            onPress={() => {
              toggleAgentConnection();
            }}>
            <View style={styles.callAgentBtnInnerContainer}>
              {isStartAgent ? (
                <>
                  <Image
                    source={JoinCallIcon}
                    style={{width: 24, height: 24}}
                    tintColor={$config.FONT_COLOR}
                  />
                  <Text style={styles.callAgentBtnText}>Call AI Agent</Text>
                </>
              ) : (
                <>
                  <ActivityIndicator size="small" color={$config.FONT_COLOR} />
                  <Text style={[styles.callAgentBtnText]}>
                    {agentConnectionState === AgentState.REQUEST_SENT
                      ? 'Connecting...'
                      : agentConnectionState ===
                        AgentState.AGENT_DISCONNECT_REQUEST
                      ? 'Disconnecting...'
                      : 'Loading...'}
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconStyle: {
    width: 34,
    height: 34,
    margin: 12,
  },
  layoutRootContainer: {
    flex: 1,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
  },
  callAgentBtnInnerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  callAgentBtnContainer: {
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    borderRadius: 40,
    alignSelf: 'center',
    display: 'flex',
    flex: 1,
  },
  callAgentBtnText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 18,
    fontWeight: '600',
    color: $config.FONT_COLOR,
    paddingLeft: 8,
  },
  welcomeContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 500,
    top: 50,
  },
  welcomeText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 50,
    fontWeight: '800',
    color: $config.FONT_COLOR,
  },
  welcomeInnerContainer: {
    alignSelf: 'center',
    display: 'flex',
    flex: 1,
  },
  btnContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 500,
    bottom: 50,
  },
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_3_COLOR,
    borderRadius: 8,
    ...Platform.select({
      web: {
        pointerEvents: 'none',
      },
    }),
  },
});
