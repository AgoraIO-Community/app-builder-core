import {UidType, useContent, useRoomInfo, Toast} from 'customization-api';
import React, {createContext, useContext, useEffect} from 'react';
import {AgentContext} from './AgentContext';
import {AgentState} from './const';
import StorageContext from '../../../components/StorageContext';

export interface AgentContextInterface {
  toggleAgentConnection: (forceStop?: boolean) => Promise<boolean>;
}

export const AgentConnectionContext = createContext<AgentContextInterface>({
  toggleAgentConnection: () => {
    return Promise.resolve(false);
  },
});

export const AgentConnectionProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {activeUids: users} = useContent();
  const {
    agentUID,
    agentConnectionState,
    setAgentConnectionState,
    agentId,
    setAgentUID,
    prompt,
  } = useContext(AgentContext);
  const {
    data: {channel: channel_name, uid: localUid, agents},
  } = useRoomInfo();
  const {store} = useContext(StorageContext);

  useEffect(() => {
    console.log('debugging users agent contrl', {users});
    // welcome agent
    const aiAgentUID = users.filter(item => item === agentUID);

    if (
      aiAgentUID.length &&
      agentConnectionState === AgentState.AWAITING_JOIN
    ) {
      setAgentConnectionState(AgentState.AGENT_CONNECTED);

      Toast.show({
        leadingIconName: 'tick-fill',
        type: 'success',
        text1: 'Say Hi!!',
        text2: null,
        visibilityTime: 3000,
        primaryBtn: null,
        secondaryBtn: null,
        leadingIcon: null,
      });
    }
    // when agent leaves, show left toast, and set agent to not connected state
    if (
      !aiAgentUID.length &&
      agentConnectionState === AgentState.AWAITING_LEAVE
    ) {
      setAgentConnectionState(AgentState.NOT_CONNECTED);
    }
  }, [users, agentUID]);

  const handleConnectionToggle = async (forceStop: boolean = false) => {
    try {
      // connect to agent when agent is in not connected state or when earlier connect failed
      if (
        agentConnectionState === AgentState.NOT_CONNECTED ||
        agentConnectionState === AgentState.AGENT_REQUEST_FAILED ||
        agentConnectionState === AgentState.AWAITING_LEAVE
      ) {
        try {
          setAgentConnectionState(AgentState.REQUEST_SENT);
          const data = await connectToAIAgent(
            'start',
            channel_name,
            localUid,
            store.token,
            {
              agent_id: agentId,
              prompt: prompt,
              voice: agents.find(a => a.id === agentId)?.config?.tts?.params
                ?.voice_name,
            },
          );
          // console.log("response X-Client-ID", newClientId, typeof newClientId)
          // @ts-ignore
          const {agent_uid = null} = data;

          //setClientId(agent_id);
          setAgentUID(agent_uid);

          setAgentConnectionState(AgentState.AWAITING_JOIN);

          Toast.show({
            leadingIconName: 'tick-fill',
            type: 'success',
            text1: 'Agent requested to join',
            text2: null,
            visibilityTime: 3000,
            primaryBtn: null,
            secondaryBtn: null,
            leadingIcon: null,
          });
          return Promise.resolve(true);
        } catch (agentConnectError) {
          setAgentConnectionState(AgentState.AGENT_REQUEST_FAILED);

          if (agentConnectError.toString().indexOf('401') !== -1) {
            Toast.show({
              leadingIconName: 'alert',
              type: 'error',
              text1: 'Your session is expired. Please sign in to join call.',
              text2: null,
              visibilityTime: 5000,
              primaryBtn: null,
              secondaryBtn: null,
              leadingIcon: null,
            });
          } else {
            Toast.show({
              leadingIconName: 'alert',
              type: 'error',
              text1: 'Uh oh! Agent failed to connect',
              text2: null,
              visibilityTime: 5000,
              primaryBtn: null,
              secondaryBtn: null,
              leadingIcon: null,
            });
          }

          throw agentConnectError;
        }
      }
      // disconnect agent with agent is already connected or when earlier disconnect failed
      if (
        forceStop === true ||
        agentConnectionState === AgentState.AGENT_CONNECTED ||
        agentConnectionState === AgentState.AGENT_DISCONNECT_FAILED
      ) {
        try {
          setAgentConnectionState(AgentState.AGENT_DISCONNECT_REQUEST);
          await connectToAIAgent('stop', channel_name, localUid, store.token, {
            agent_id: agentId,
          });
          setAgentConnectionState(AgentState.AWAITING_LEAVE);
          if (!forceStop) {
            Toast.show({
              leadingIconName: 'tick-fill',
              type: 'success',
              text1: 'Agent disconnected',
              text2: null,
              visibilityTime: 3000,
              primaryBtn: null,
              secondaryBtn: null,
              leadingIcon: null,
            });
          }
          return Promise.resolve(true);
        } catch (agentDisconnectError) {
          setAgentConnectionState(AgentState.AGENT_DISCONNECT_FAILED);

          Toast.show({
            leadingIconName: 'alert',
            type: 'error',
            text1: 'Uh oh! Agent failed to disconnect',
            text2: null,
            visibilityTime: 5000,
            primaryBtn: null,
            secondaryBtn: null,
            leadingIcon: null,
          });

          throw agentDisconnectError;
        }
      }
    } catch (error) {
      console.log(`Agent failed to connect/disconnect - ${error}`);
    }
  };

  const value = {
    toggleAgentConnection: handleConnectionToggle,
  };

  return (
    <AgentConnectionContext.Provider value={value}>
      {children}
    </AgentConnectionContext.Provider>
  );
};

export const connectToAIAgent = async (
  agentAction: 'start' | 'stop',
  channel_name: string,
  localUid: UidType,
  agentAuthToken: string,
  data?: {agent_id: string; prompt?: string; voice?: string},
): Promise<{}> => {
  // const apiUrl = '/api/proxy';
  const apiUrl = $config.BACKEND_ENDPOINT + '/v1/convoai';
  const requestBody = {
    channel_name: channel_name,
    uid: localUid, // user uid // localUid or 0
  };

  if (data && data?.agent_id) {
    requestBody['ai_agent_id'] = data.agent_id;
  }
  if (data && data?.voice) {
    requestBody['voice'] = data.voice;
  }
  if (data && data?.prompt) {
    requestBody['prompt'] = data.prompt;
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${agentAuthToken}`,
  };

  try {
    const response = await fetch(`${apiUrl}/${agentAction}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log(
      `AI agent ${agentAction === 'start' ? 'connected' : 'disconnected'}`,
      data,
    );
    if (agentAction === 'start') {
      return data;
    }
  } catch (error) {
    console.error(`Failed to ${agentAction} AI agent connection:`, error);
    throw error;
  }
};
