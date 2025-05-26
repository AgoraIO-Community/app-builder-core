import React, {createContext, useContext, useEffect, useState} from 'react';
import StorageContext from '../../../components/StorageContext';
import {AIAgentState, ASR_LANGUAGES, AgentState} from './const';
import {AI_AGENT_VOICE} from './const';
import {
  UidType,
  useContent,
  useRoomInfo,
  Toast,
  useRtc,
  isWebInternal,
  useHistory,
} from 'customization-api';
import LocalEventEmitter, {
  LocalEventsEnum,
} from '../../../../src/rtm-events-api/LocalEvents';
import {
  messageService,
  initializeMessageEngine,
  closeMessageEngine,
  IMessageListItem,
} from './message';

export interface ChatItem {
  id: string;
  uid: UidType;
  text: string;
  isFinal: boolean;
  time: number;
  isSelf: boolean;
}

export interface AIAgentContextInterface {
  toggleAgentConnection: (forceStop?: boolean) => Promise<boolean>;
  agentConnectionState: AIAgentState;
  setAgentConnectionState: (agentState: AIAgentState) => void;
  agentAuthToken: string | null;
  setAgentAuthToken: (token: string | null) => void;
  isSubscribedForStreams: boolean;
  setIsSubscribedForStreams: (state: boolean) => void;
  agentUID: UidType | null;
  setAgentUID: (uid: UidType | null) => void;
  agentId: string;
  setAgentId: (id: string) => void;
  agentVoice?: keyof typeof AI_AGENT_VOICE | '';
  setAgentVoice: (voice: keyof typeof AI_AGENT_VOICE) => void;
  language?: keyof typeof ASR_LANGUAGES | '';
  setLanguage: (language: keyof typeof ASR_LANGUAGES) => void;
  prompt?: string;
  setPrompt: (prompt: string) => void;
  isInterruptionHandlingEnabled?: boolean;
  setIsInterruptionHandlingEnabled: (value: boolean) => void;
  chatHistory: IMessageListItem[];
  setChatHistory: (history: IMessageListItem[]) => void;
  clearChatHistory: () => void;
}

export const AgentContext = createContext<AIAgentContextInterface>({
  toggleAgentConnection: () => {
    return Promise.resolve(false);
  },
  agentConnectionState: AgentState.NOT_CONNECTED,
  setAgentConnectionState: () => {},
  agentAuthToken: null,
  setAgentAuthToken: () => {},
  isSubscribedForStreams: false,
  setIsSubscribedForStreams: () => {},
  agentUID: null,
  setAgentUID: () => {},
  agentVoice: '',
  setAgentVoice: () => {},
  agentId: '',
  setAgentId: () => {},
  prompt: '',
  setPrompt: () => {},
  isInterruptionHandlingEnabled: false,
  setIsInterruptionHandlingEnabled: () => {},
  language: '',
  setLanguage: () => {},
  chatHistory: [],
  setChatHistory: () => {},
  clearChatHistory: () => {},
});

export const AgentProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const history = useHistory();
  const [agentConnectionState, setAgentConnectionState] =
    useState<AIAgentState>(AgentState.NOT_CONNECTED);
  const [agentAuthToken, setAgentAuthToken] = useState<string | null>(null);
  const [agentUID, setAgentUID] = useState<UidType | null>(null);
  const [isSubscribedForStreams, setIsSubscribedForStreams] = useState(false);
  const [chatHistory, setChatHistory] = useState<IMessageListItem[]>([]);
  const [agentId, setAgentId] = useState('');
  const [agentVoice, setAgentVoice] =
    useState<AIAgentContextInterface['agentVoice']>('');
  const [prompt, setPrompt] = useState('');
  const {activeUids: users} = useContent();
  const [isStartAPICalled, setStartAPICalled] = useState(false);
  const [isStopAPICalled, setStopAPICalled] = useState(false);
  const [isInterruptionHandlingEnabled, setIsInterruptionHandlingEnabled] =
    useState(undefined);
  const [language, setLanguage] =
    useState<AIAgentContextInterface['language']>('');

  const {
    data: {channel: channel_name, uid: localUid, agents},
  } = useRoomInfo();
  const {store, setStore} = useContext(StorageContext);

  const {RtcEngineUnsafe} = useRtc();

  const messageCache = {};
  const TIMEOUT_MS = 5000; // Timeout for incomplete messages

  useEffect(() => {
    const extraRemoteUser = users
      // filter local user
      ?.filter(i => i !== localUid)
      // filter agent user
      ?.filter(i => !i?.toString()?.startsWith('3'));
    if (
      extraRemoteUser &&
      extraRemoteUser?.length &&
      extraRemoteUser[0] !== localUid
    ) {
      //navigate extra user to new meeting
      history.push('/');
    }
  }, [users, localUid]);

  //set agent uid when user refresh the page - to maintain the app state
  useEffect(() => {
    //@ts-ignore
    if (store?.agentUID && store?.agentUID !== agentUID) {
      //@ts-ignore
      setAgentUID(store.agentUID);
    }
  }, [store, agentUID]);

  //set agent id when user refresh the page - to maintain the app state
  useEffect(() => {
    //@ts-ignore
    if (
      //@ts-ignore
      store?.agentId &&
      //@ts-ignore
      store?.agentId !== agentId &&
      agents?.length &&
      //@ts-ignore
      agents?.filter(i => i?.id === store?.agentId)?.length
    ) {
      //@ts-ignore
      setAgentId(store.agentId);
    } else {
      if (!agentId && agents?.length) {
        setAgentId(agents[0]?.id);
        setStore(prevState => {
          return {
            ...prevState,
            agentId: agents[0]?.id,
          };
        });
      }
    }
  }, [store, agentId, agents]);

  React.useEffect(() => {
    if (!isSubscribedForStreams) {
      RtcEngineUnsafe.addListener('onStreamMessage', (...args: any[]) => {
        if (isWebInternal()) {
          messageService?.handleStreamMessage(args[1]);
        } else {
          messageService?.handleStreamMessage(args[3]);
        }
      });
      setIsSubscribedForStreams(true);
    }
  }, []);

  React.useEffect(() => {
    const getChatHistoryFromEvent = (event: MessageEvent) => {
      const {data} = event;
      // console.log('get chat history from event', data);
      if (data.type === 'message') {
        setChatHistory(prevChatHistory => [...(data?.chatHistory || [])]);
      }
    };
    LocalEventEmitter.on(
      LocalEventsEnum.AGENT_TRANSCRIPT_CHANGE,
      getChatHistoryFromEvent,
    );
    return () => {
      LocalEventEmitter.off(
        LocalEventsEnum.AGENT_TRANSCRIPT_CHANGE,
        getChatHistoryFromEvent,
      );
    };
  }, []);

  useEffect(() => {
    // welcome agent
    const aiAgentUID = users.filter(item => item === agentUID);

    if (
      //join via start api
      (isStartAPICalled &&
        aiAgentUID.length &&
        agentConnectionState === AgentState.AWAITING_JOIN) ||
      //on refresh - start is called already
      (!isStopAPICalled &&
        !isStartAPICalled &&
        aiAgentUID.length &&
        agentConnectionState !== AgentState.AGENT_CONNECTED)
    ) {
      setAgentConnectionState(AgentState.AGENT_CONNECTED);
      initializeMessageEngine();
      if (isStartAPICalled) {
        setStartAPICalled(false);
      }

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
      //agent disconnect with stop api
      (!isStartAPICalled &&
        isStopAPICalled &&
        !aiAgentUID.length &&
        agentConnectionState === AgentState.AWAITING_LEAVE) ||
      //agent disconnect - might be timeout
      (!isStartAPICalled &&
        !isStopAPICalled &&
        !aiAgentUID.length &&
        agentConnectionState !== AgentState.NOT_CONNECTED)
    ) {
      closeMessageEngine(); // release message engine
      setAgentConnectionState(AgentState.NOT_CONNECTED);
      if (isStopAPICalled) {
        setStopAPICalled(false);
      }
    }
  }, [
    users,
    agentUID,
    agentConnectionState,
    isStartAPICalled,
    isStopAPICalled,
  ]);

  const clearChatHistory = () => {
    setChatHistory([]);
  };

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
          setStartAPICalled(true);
          const params = {
            agent_id: agentId,
            prompt: prompt,
            voice: agents?.find(a => a.id === agentId)?.tts?.params?.voice_name,
            enable_interruption_handling: isInterruptionHandlingEnabled,
            language: language,
          };
          const data = await connectToAIAgent(
            'start',
            channel_name,
            localUid,
            store.token,
            params,
          );
          // console.log("response X-Client-ID", newClientId, typeof newClientId)
          // @ts-ignore
          const {agent_uid = null} = data;

          //setClientId(agent_id);
          setAgentUID(agent_uid);

          //setting agent uid in the store so we can retrive it if user refresh the page
          setStore(prevState => {
            return {
              ...prevState,
              agentUID: agent_uid,
            };
          });

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
          } else if (agentConnectError.toString().indexOf('403') !== -1) {
            Toast.show({
              leadingIconName: 'alert',
              type: 'error',
              text1: 'Uh oh! Agent failed to connect',
              text2:
                "Verify if you've enabled your project for Agora Conversational AI on Agora Console. Or if your project's customer ID and certificate is configured correctly.",
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
          setStopAPICalled(true);
          await connectToAIAgent('stop', channel_name, localUid, store.token, {
            agent_id: agentId || agents?.length ? agents[0].id : null,
          });
          setStore(prevState => {
            return {
              ...prevState,
              agentUID: null,
            };
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
    agentConnectionState,
    setAgentConnectionState,
    agentAuthToken,
    setAgentAuthToken,
    isSubscribedForStreams,
    setIsSubscribedForStreams,
    agentUID,
    setAgentUID,
    agentId,
    setAgentId,
    agentVoice,
    setAgentVoice,
    prompt,
    setPrompt,
    isInterruptionHandlingEnabled,
    setIsInterruptionHandlingEnabled,
    language,
    setLanguage,
    setChatHistory,
    chatHistory,
    clearChatHistory,
  };

  return (
    <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
  );
};

export const connectToAIAgent = async (
  agentAction: 'start' | 'stop',
  channel_name: string,
  localUid: UidType,
  agentAuthToken: string,
  data?: {
    agent_id: string;
    prompt?: string;
    voice?: string;
    language?: keyof typeof ASR_LANGUAGES | '';
    enable_interruption_handling?: boolean;
  },
): Promise<{}> => {
  const apiUrl = $config.BACKEND_ENDPOINT + '/v1/convoai';
  const requestBody = {
    channel_name: channel_name,
    uid: localUid,
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
  if (data && data?.language) {
    requestBody['asr_language'] = data.language;
  }
  if (data && data?.enable_interruption_handling) {
    requestBody['enable_aivad'] = data.enable_interruption_handling;
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
