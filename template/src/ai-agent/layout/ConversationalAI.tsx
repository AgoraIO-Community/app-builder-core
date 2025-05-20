import React, {useContext, useEffect} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useSidePanel} from 'customization-api';
import ThemeConfig from '../../theme';
import {AgentContext} from '../components/AgentControls/AgentContext';
import {AgentState} from '../components/AgentControls/const';
import {useIsAgentAvailable} from '../components/utils';
import {isMobileUA, isAndroid, isIOS} from '../../utils/common';
//@ts-ignore
import JoinCallIcon from '../assets/join-call.png';
import {
  DisconnectButton,
  MicButton,
  TranscriptButton,
} from '../components/ControlButtons';

export default function ConversationalAI() {
  const {setSidePanel} = useSidePanel();
  const {agentConnectionState, toggleAgentConnection} =
    useContext(AgentContext);

  useEffect(() => {
    if (!(isAndroid() || isIOS())) {
      setTimeout(() => {
        // make sure you have a canvas in the body
        const canvas = document?.getElementById(
          'ai-agent',
        ) as HTMLCanvasElement;

        if (canvas) {
          const {Application} = require('@splinetool/runtime');
          // start the application and load the scene
          const spline = new Application(canvas);
          spline
            ?.load(
              'https://d1i64xs2div6cu.cloudfront.net/scene-250216.splinecode',
            )
            ?.then(() => {
              if (isMobileUA()) {
                spline?.setZoom(0.5);
              }
            });
        }
      });
    }

    setTimeout(() => {
      !isMobileUA() && setSidePanel('custom-settings-panel');
    });
  }, []);

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
      <View style={styles.container}>
        {isAndroid() || isIOS() ? (
          <View style={styles.nativeTextContainer}>
            <Text style={styles.nativeText}>AI Agent...</Text>
          </View>
        ) : (
          <canvas
            id="ai-agent"
            width="100%"
            height="100%"
            style={{pointerEvents: 'none'}}
          />
        )}
      </View>
      <View style={styles.btnContainer}>
        {!isLoading &&
        (agentConnectionState === 'AGENT_CONNECTED' ||
          agentConnectionState === 'AGENT_DISCONNECT_FAILED') ? (
          <View style={styles.controlsContainer}>
            <MicButton />
            <TranscriptButton />
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
              isLoading || !isAgentAvailable ? styles.disabledOpacity : {},
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
}

const styles = StyleSheet.create({
  controlsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  iconStyle: {
    width: 34,
    height: 34,
    margin: 12,
  },
  layoutRootContainer: {
    flex: 1,
    backgroundColor: '#1D1D1D',
    borderRadius: 8,
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
  disabledOpacity: {
    opacity: 0.6,
  },
  callAgentBtnText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 18,
    fontWeight: '600',
    color: $config.FONT_COLOR,
    paddingLeft: 8,
  },
  nativeTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nativeText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 18,
    fontWeight: '800',
    color: $config.FONT_COLOR,
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
  },
});
