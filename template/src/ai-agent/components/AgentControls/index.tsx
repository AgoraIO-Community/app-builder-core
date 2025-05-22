import React, {useContext} from 'react';
import {AI_AGENT_STATE, AgentState} from './const';
import {TouchableOpacity, Text, ActivityIndicator, Image} from 'react-native';
import {AgentContext} from './AgentContext';
import {ThemeConfig} from 'customization-api';
//@ts-ignore
import JoinCallIcon from '../../assets/join-call.png';
//@ts-ignore
import LeaveCallIcon from '../../assets/leave-call.png';
import {isMobileUA} from '../../../utils/common';
import {useIsAgentAvailable} from '../utils';

export const AgentControl: React.FC = () => {
  const {agentConnectionState, toggleAgentConnection} =
    useContext(AgentContext);

  // stop_agent API is successful, but agent has not yet left the RTC channel
  const isAwaitingLeave = agentConnectionState === AgentState.AWAITING_LEAVE;
  const isAgentAvailable = useIsAgentAvailable();

  const isLoading =
    agentConnectionState === AgentState.REQUEST_SENT ||
    agentConnectionState === AgentState.AGENT_DISCONNECT_REQUEST ||
    // || agentConnectionState === AgentState.AWAITING_LEAVE
    agentConnectionState === AgentState.AWAITING_JOIN;

  const isStartAgent =
    agentConnectionState === AgentState.NOT_CONNECTED ||
    agentConnectionState === AgentState.AGENT_REQUEST_FAILED ||
    isAwaitingLeave;
  const isEndAgent =
    agentConnectionState === AgentState.AGENT_CONNECTED ||
    agentConnectionState === AgentState.AGENT_DISCONNECT_FAILED;

  const backgroundColorStyle = {
    backgroundColor: isEndAgent ? $config.SEMANTIC_ERROR : '#0097D4',
  };
  const fontcolorStyle = {color: $config.FONT_COLOR};

  return (
    <TouchableOpacity
      style={[
        isMobileUA()
          ? {
              display: 'flex',
              height: 48,
              width: 48,
              marginHorizontal: 24,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 40,
              flexDirection: 'row',
              ...backgroundColorStyle,
            }
          : {
              display: 'flex',
              height: 48,
              padding: 20,
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: 40,
              flexDirection: 'row',
              ...backgroundColorStyle,
            },
        {opacity: !isAgentAvailable ? 0.6 : 1},
      ]}
      onPress={() => toggleAgentConnection()}
      disabled={isLoading || !isAgentAvailable}>
      {isLoading ? (
        <ActivityIndicator size="small" color={$config.FONT_COLOR} />
      ) : isStartAgent ? (
        <Image style={{width: 24, height: 24}} source={JoinCallIcon} />
      ) : (
        <Image style={{width: 24, height: 24}} source={LeaveCallIcon} />
      )}
      {!isMobileUA() &&
      !(
        agentConnectionState === 'AGENT_CONNECTED' ||
        agentConnectionState === 'AGENT_DISCONNECT_FAILED'
      ) ? (
        <Text
          style={{
            fontFamily: ThemeConfig.FontFamily.sansPro,
            fontSize: 18,
            lineHeight: 18,
            fontWeight: '600',
            ...fontcolorStyle,
          }}>{` ${AI_AGENT_STATE[agentConnectionState]}`}</Text>
      ) : (
        <></>
      )}
    </TouchableOpacity>
  );
};
