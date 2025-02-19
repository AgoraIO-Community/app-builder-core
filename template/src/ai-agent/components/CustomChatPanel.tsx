import {StyleSheet, View} from 'react-native';
import React, {useContext} from 'react';
import {useRtc} from 'customization-api';
import {AgentContext} from './AgentControls/AgentContext';
import ChatScreen from './agent-chat-panel/agent-chat-ui';

const CustomSidePanel = () => {
  const {RtcEngineUnsafe} = useRtc();
  const {isSubscribedForStreams, setIsSubscribedForStreams, addChatItem} =
    useContext(AgentContext);

  const messageCache = {};
  const TIMEOUT_MS = 5000; // Timeout for incomplete messages

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

  return (
    <View style={styles.container}>
      <ChatScreen />
    </View>
  );
};

export default CustomSidePanel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    height: '100%',
  },
});
