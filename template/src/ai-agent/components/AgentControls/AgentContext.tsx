import React, {createContext, useContext, useEffect, useState} from 'react';
import StorageContext from '../../../components/StorageContext';
import {AIAgentState, ASR_LANGUAGES, AgentState} from './const';
import {AI_AGENT_VOICE} from './const';
import {createHook} from 'customization-implementation';
import {
  UidType,
  useContent,
  useRoomInfo,
  Toast,
  useRtc,
} from 'customization-api';

export interface ChatItem {
  id: string;
  uid: UidType;
  text: string;
  isFinal: boolean;
  time: number;
  isSelf: boolean;
}

export interface AgentContextInterface {
  toggleAgentConnection: (forceStop?: boolean) => Promise<boolean>;
  agentConnectionState: AIAgentState;
  setAgentConnectionState: (agentState: AIAgentState) => void;
  agentAuthToken: string | null;
  setAgentAuthToken: (token: string | null) => void;
  isSubscribedForStreams: boolean;
  setIsSubscribedForStreams: (state: boolean) => void;
  agentUID: UidType | null;
  setAgentUID: (uid: UidType | null) => void;
  chatItems: ChatItem[];
  addChatItem: (newItem: ChatItem) => void;
  agentId: string;
  setAgentId: (id: string) => void;
  agentVoice?: keyof typeof AI_AGENT_VOICE | '';
  setAgentVoice: (voice: keyof typeof AI_AGENT_VOICE) => void;
  language?: keyof typeof ASR_LANGUAGES | '';
  setLanguage: (language: keyof typeof ASR_LANGUAGES) => void;
  prompt?: string;
  setPrompt: (prompt: string) => void;
  isInterruptionHandlingEnabled: boolean;
  setIsInterruptionHandlingEnabled: (value: boolean) => void;
}

export const AgentContext = createContext<AgentContextInterface>({
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
  chatItems: [],
  addChatItem: () => {}, // Default no-op
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
});

/**
 * Helper function to find the correct insertion index for a new item using binary search.
 * Ensures that the array remains sorted by the `time` property after insertion.
 *
 * @param array The array to search within.
 * @param time The `time` value of the new item to insert.
 * @returns The index where the new item should be inserted.
 */
const findInsertionIndex = (array: ChatItem[], time: number): number => {
  let low = 0;
  let high = array.length;

  // Perform binary search to find the insertion index
  while (low < high) {
    const mid = Math.floor((low + high) / 2);

    // If the middle item's time is less than the new time, search the upper half
    if (array[mid].time < time) {
      low = mid + 1;
    } else {
      // Otherwise, search the lower half
      high = mid;
    }
  }

  return low; // The correct index for insertion
};

export const AgentProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [agentConnectionState, setAgentConnectionState] =
    useState<AIAgentState>(AgentState.NOT_CONNECTED);
  const [agentAuthToken, setAgentAuthToken] = useState<string | null>(null);
  const [agentUID, setAgentUID] = useState<UidType | null>(null);
  const [isSubscribedForStreams, setIsSubscribedForStreams] = useState(false);
  const [chatItems, setChatItems] = useState<ChatItem[]>([]);
  const [agentId, setAgentId] = useState('');
  const [agentVoice, setAgentVoice] =
    useState<AgentContextInterface['agentVoice']>('');
  const [prompt, setPrompt] = useState('');
  const {activeUids: users} = useContent();
  const [isStartAPICalled, setStartAPICalled] = useState(false);
  const [isStopAPICalled, setStopAPICalled] = useState(false);
  const [isInterruptionHandlingEnabled, setIsInterruptionHandlingEnabled] =
    useState(false);
  const [language, setLanguage] =
    useState<AgentContextInterface['language']>('');

  const {
    data: {channel: channel_name, uid: localUid, agents},
  } = useRoomInfo();
  const {store, setStore} = useContext(StorageContext);

  const {RtcEngineUnsafe} = useRtc();

  const messageCache = {};
  const TIMEOUT_MS = 5000; // Timeout for incomplete messages

  //set agent id when user refresh the page
  useEffect(() => {
    //@ts-ignore
    if (store?.agentUID && store?.agentUID !== agentUID) {
      //@ts-ignore
      setAgentUID(store.agentUID);
    }
  }, [store, agentUID]);

  React.useEffect(() => {
    if (!isSubscribedForStreams) {
      RtcEngineUnsafe.addListener(
        'onStreamMessage',
        handleStreamMessageCallback,
      );
      setIsSubscribedForStreams(true);
    }
  }, []);

  const handleStreamMessageCallback = (...args) => {
    console.log('rec', args);
    parseData(args[1]);
  };

  const parseData = data => {
    let decoder = new TextDecoder('utf-8');
    let decodedMessage = decoder.decode(data);
    console.log('[test] textstream raw data', decodedMessage);
    handleChunk(decodedMessage);
  };
  // Function to process received chunk via event emitter
  const handleChunk = (formattedChunk: string) => {
    try {
      // Split the chunk by the delimiter "|"
      const [message_id, partIndexStr, totalPartsStr, content] =
        formattedChunk.split('|');

      const part_index = parseInt(partIndexStr, 10);
      const total_parts =
        totalPartsStr === '???' ? -1 : parseInt(totalPartsStr, 10); // -1 means total parts unknown

      // Ensure total_parts is known before processing further
      if (total_parts === -1) {
        console.warn(
          `Total parts for message ${message_id} unknown, waiting for further parts.`,
        );
        return;
      }

      const chunkData = {
        message_id,
        part_index,
        total_parts,
        content,
      };

      // Check if we already have an entry for this message
      if (!messageCache[message_id]) {
        messageCache[message_id] = [];
        // Set a timeout to discard incomplete messages
        setTimeout(() => {
          if (messageCache[message_id]?.length !== total_parts) {
            console.warn(`Incomplete message with ID ${message_id} discarded`);
            delete messageCache[message_id]; // Discard incomplete message
          }
        }, TIMEOUT_MS);
      }

      // Cache this chunk by message_id
      messageCache[message_id].push(chunkData);

      // If all parts are received, reconstruct the message
      if (messageCache[message_id].length === total_parts) {
        const completeMessage = reconstructMessage(messageCache[message_id]);
        const data = atob(completeMessage);
        const {stream_id, is_final, text, text_ts} = JSON.parse(data);
        /** Data type of above object
         * stream_id: number
         * is_final: boolean
         * text: string
         * text_ts: number
         */
        const textItem = {
          id: message_id,
          uid: stream_id,
          time: text_ts,
          dataType: 'transcribe',
          text: text,
          isFinal: is_final,
          isSelf: stream_id === 0 ? false : true,
        };

        if (text.trim().length > 0) {
          //this.emit("textChanged", textItem);
          console.warn('emit textChanged: ', textItem);
          addChatItem(textItem);
        }

        // Clean up the cache
        delete messageCache[message_id];
      }
    } catch (error) {
      console.error('Error processing chunk:', error);
    }
  };

  const reconstructMessage = chunks => {
    // Sort chunks by their part index
    chunks.sort((a, b) => a.part_index - b.part_index);

    // Concatenate all chunks to form the full message
    return chunks.map(chunk => chunk.content).join('');
  };

  useEffect(() => {
    console.log(
      'debugging users agent contrl',
      agentConnectionState,
      {users},
      agentUID,
    );

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
      setAgentConnectionState(AgentState.NOT_CONNECTED);
      if (isStopAPICalled) {
        setStartAPICalled(true);
      }
    }
  }, [
    users,
    agentUID,
    agentConnectionState,
    isStartAPICalled,
    isStopAPICalled,
  ]);

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
          const data = await connectToAIAgent(
            'start',
            channel_name,
            localUid,
            store.token,
            {
              agent_id: agentId || agents?.length ? agents[0].id : null,
              prompt: prompt,
              voice: agents.find(a => a.id === agentId)?.config?.tts?.params
                ?.voice_name,
              enable_interruption_handling: isInterruptionHandlingEnabled,
              language: language,
            },
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

  /**
   * Adds a new chat item to the chat state while ensuring:
   * - Outdated messages are discarded.
   * - Non-finalized messages are updated if a newer message is received.
   * - Finalized messages are added without duplication.
   * - Chat items remain sorted by their `time` property.
   *
   * @param newItem The new chat item to add.
   */
  const addChatItem = (newItem: ChatItem) => {
    setChatItems(prevItems => {
      // Find the index of the last finalized chat item for the same user
      // Finalized messages are typically considered "complete" and should not be updated by non-final messages
      const LastFinalIndex = prevItems.findLastIndex(
        el => el.uid === newItem.uid && el.isFinal,
      );

      // Find the index of the last non-finalized chat item for the same user
      // Non-finalized messages represent "in-progress" messages that can be updated or replaced
      const LastNonFinalIndex = prevItems.findLastIndex(
        el => el.uid === newItem.uid && !el.isFinal,
      );

      // Retrieve the actual items for the indices found above
      const LastFinalItem =
        LastFinalIndex !== -1 ? prevItems[LastFinalIndex] : null;
      const LastNonFinalItem =
        LastNonFinalIndex !== -1 ? prevItems[LastNonFinalIndex] : null;

      // If the new message's timestamp is older than or equal to the last finalized message,
      // it is considered outdated and discarded to prevent unnecessary overwrites.
      if (LastFinalItem && newItem.time <= LastFinalItem.time) {
        console.log(
          '[AgentProvider] addChatItem - Discarded outdated message:',
          newItem,
        );
        return prevItems; // Return the previous state without changes
      }

      // Create a new copy of the current chat items to maintain immutability
      let updatedItems = [...prevItems];

      // If there is a non-finalized message for the same user, replace it with the new message
      if (LastNonFinalItem) {
        console.log(
          '[AgentProvider] addChatItem - Updating non-finalized message:',
          newItem,
        );
        updatedItems[LastNonFinalIndex] = newItem; // Replace the non-finalized message
      } else {
        // If no non-finalized message exists, the new message is added to the array
        console.log(
          '[AgentProvider] addChatItem - Adding new message:',
          newItem,
        );

        // Use binary search to find the correct insertion index for the new message
        // This ensures the array remains sorted by the `time` property
        const insertIndex = findInsertionIndex(updatedItems, newItem.time);

        // Insert the new message at the correct position to maintain chronological order
        updatedItems.splice(insertIndex, 0, newItem);
      }

      // Return the updated array, which will replace the previous state
      return updatedItems;
    });
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
    chatItems,
    addChatItem, // Expose the function in the context
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

export const useAgent = createHook(AgentContext);
