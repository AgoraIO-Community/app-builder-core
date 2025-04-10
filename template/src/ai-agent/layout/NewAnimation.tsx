import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  ActivityIndicator,
} from 'react-native';
import ThemeConfig from '../../theme';
import {useAIAgent} from '../components/AgentControls/AgentContext';
import {AgentState} from '../components/AgentControls/const';
import {useIsAgentAvailable} from '../components/utils';
import AiAgentCustomView from '../ai-interface/AIAgentInterface';
import {
  DisconnectButton,
  MicButton,
  SettingButton,
  TranscriptButton,
} from '../components/ControlButtons';
//@ts-ignore
import JoinCallIcon from '../assets/join-call.png';

export default function NewAnimation() {
  const {agentConnectionState, toggleAgentConnection} = useAIAgent();

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
        <AiAgentCustomView connectionState={agentConnectionState} />
      </View>
      <View style={styles.btnContainer}>
        {!isLoading && agentConnectionState === 'AGENT_CONNECTED' ? (
          <View style={styles.controlsContainer}>
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
                    style={styles.callAgentIconStyle}
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
  callAgentIconStyle: {
    width: 24,
    height: 24,
  },
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
    backgroundColor: $config.CARD_LAYER_1_COLOR,
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
  callAgentBtnText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 18,
    fontWeight: '600',
    color: $config.FONT_COLOR,
    paddingLeft: 8,
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
