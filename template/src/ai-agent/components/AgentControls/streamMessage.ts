import {LogSource, logger} from '../../../logger/AppBuilderLogger';
// Cache for storing message fragments until they are complete
const messageCache: Record<string, TDataChunk[]> = {};
const MESSAGE_CACHE_TIMEOUT = 5000; // Timeout for incomplete messages = 5000;

export type TDataChunk = {
  message_id: string;
  part_idx: number;
  part_sum: number;
  content: string;
};

enum ETranscriptionObjectType {
  USER_TRANSCRIPTION = 'user.transcription',
  AGENT_TRANSCRIPTION = 'assistant.transcription',
  MSG_INTERRUPTED = 'message.interrupt',
}

export type IUserTranscription = {
  object: 'user.transcription';
  text: string;
  start_ms: number;
  duration_ms: number;
  language: string;
  turn_id: number;
  stream_id: number;
  user_id: string;
  words: any[] | null;
  final: boolean;
};

export type IAgentTranscription = {
  object: 'assistant.transcription';
  text: string;
  start_ms: number;
  duration_ms: number;
  language: string;
  turn_id: number;
  stream_id: number;
  user_id: string;
  words: any[] | null;
  quiet: boolean;
  turn_seq_id: number;
  turn_status: number;
};

export type IMessageInterrupt = {
  object: 'message.interrupt';
  message_id: string;
  data_type: 'message';
  turn_id: number;
  start_ms: number;
  send_ts: number;
};

function decodeStreamMessage(stream: Uint8Array) {
  const decoder = new TextDecoder();
  return decoder.decode(stream);
}

export function handleStreamMessageCallback(...args: any[]) {
  const [uid, stream] = args;
  const chunk = decodeStreamMessage(stream);
  logger.debug(
    LogSource.AgoraSDK,
    'AI_AGENT',
    `Decodede raw stream message:`,
    chunk,
  );
  handleChunk(chunk, handleMessage);
}

/**
 * Processes a chunk of streamed data and invokes the appropriate handler.
 *
 * @param formattedChunk - The decoded chunk of message data.
 * @param callback - The function to process the chunk (e.g., handleMessage).
 */

function handleChunk<
  T extends IUserTranscription | IAgentTranscription | IMessageInterrupt,
>(chunk: string, callback?: (message: T) => void): void {
  try {
    // Split chunk by '|'
    const [msgId, partIdx, partSum, partData] = chunk.split('|');

    // Convert data to structured format
    const input: TDataChunk = {
      message_id: msgId,
      part_idx: parseInt(partIdx, 10),
      part_sum: partSum === '???' ? -1 : parseInt(partSum, 10), // -1 means total parts unknown
      content: partData,
    };

    // If total parts are unknown, wait for further parts
    if (input.part_sum === -1) {
      logger.debug(
        LogSource.AgoraSDK,
        'AI_AGENT',
        `Total parts unknown, waiting for further parts.`,
      );
      return;
    }

    // Case 1: If message is not cached, create a new cache entry
    if (!messageCache[input.message_id]) {
      messageCache[input.message_id] = [];

      // Set cache timeout - drop incomplete messages
      setTimeout(() => {
        if (
          messageCache[input.message_id] &&
          messageCache[input.message_id].length < input.part_sum
        ) {
          logger.debug(
            LogSource.AgoraSDK,
            'AI_AGENT',
            `Message cache timeout, dropping message: ${input.message_id}`,
          );
          delete messageCache[input.message_id];
        }
      }, MESSAGE_CACHE_TIMEOUT);
    }

    // Case 2: Add new chunk if not already stored
    if (
      !messageCache[input.message_id]?.find(
        chunk => chunk.part_idx === input.part_idx,
      )
    ) {
      messageCache[input.message_id].push(input);
    }

    // Sort chunks in order
    messageCache[input.message_id].sort((a, b) => a.part_idx - b.part_idx);

    // If message is complete, assemble and process it
    if (messageCache[input.message_id].length === input.part_sum) {
      const assembledMessage = messageCache[input.message_id]
        .map(chunk => chunk.content)
        .join('');

      // Decode base64 message
      const decodedMessage: T = JSON.parse(atob(assembledMessage));

      logger.debug(
        LogSource.AgoraSDK,
        'AI_AGENT',
        'Fully assembled message:',
        decodedMessage,
      );

      // Invoke the callback with the complete message
      callback?.(decodedMessage);

      // Remove from cache after processing
      delete messageCache[input.message_id];
    }
  } catch (error) {
    logger.error(
      LogSource.AgoraSDK,
      'AI_AGENT',
      'Error in handleChunk:',
      error,
    );
  }
}

function handleMessage(
  message: IUserTranscription | IAgentTranscription | IMessageInterrupt,
) {
  // check if message is transcription
  const isAgentMessage =
    message.object === ETranscriptionObjectType.AGENT_TRANSCRIPTION;
  const isUserMessage =
    message.object === ETranscriptionObjectType.USER_TRANSCRIPTION;
  const isMessageInterrupt =
    message.object === ETranscriptionObjectType.MSG_INTERRUPTED;
}
