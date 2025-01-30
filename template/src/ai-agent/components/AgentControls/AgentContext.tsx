import React, {createContext, useState} from 'react';
import {AIAgentState, AgentState} from './const';
import {UidType} from 'customization-api';

export interface ChatItem {
  id: string;
  uid: UidType;
  text: string;
  isFinal: boolean;
  time: number;
  isSelf: boolean;
}

export interface AgentContextInterface {
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
}

export const AgentContext = createContext<AgentContextInterface>({
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
  };

  return (
    <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
  );
};
