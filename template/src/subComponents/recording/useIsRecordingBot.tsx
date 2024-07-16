import {useEffect} from 'react';
import {useSearchParams} from '../../utils/useSearchParams';
import {logger, LogSource} from '../../logger/AppBuilderLogger';

interface RecordingBotUIConfig {
  chat: boolean;
  topBar: boolean;
  bottomBar: boolean;
  stt: boolean;
}

const regexPattern = new RegExp('true');

export function useIsRecordingBot() {
  /**
   * Reading and setting URL params.
   * To identify its a recording bot user
   * 1. Check if bot param is there
   * 2. Check if token param is there
   * 3. Decode that token and check if user_id contains ******
   */

  const botParam = useSearchParams().get('bot');
  const recordingBotParam = botParam ? regexPattern.test(botParam) : false;
  const recordingBotToken = useSearchParams().get('token');
  const recordingBotName = useSearchParams().get('user_name');
  const isRecordingBot = recordingBotParam && recordingBotToken;

  useEffect(() => {
    logger.log(LogSource.Internals, 'RECORDING', 'Recording bot check', {
      bot: recordingBotParam,
      token: recordingBotToken,
      name: recordingBotName,
      isRecordingBot: isRecordingBot,
    });
  }, [isRecordingBot, recordingBotName, recordingBotToken, recordingBotParam]);

  const chatParam = useSearchParams().get('chat');
  const topBarParam = useSearchParams().get('topBar');
  const bottomBarParam = useSearchParams().get('bottomBar');
  const sttParam = useSearchParams().get('stt');

  const recordingBotUIConfig: RecordingBotUIConfig = {
    chat: chatParam ? regexPattern.test(chatParam) : true,
    topBar: topBarParam ? regexPattern.test(topBarParam) : false,
    bottomBar: bottomBarParam ? regexPattern.test(bottomBarParam) : false,
    stt: sttParam ? regexPattern.test(sttParam) : false,
  };

  return {
    isRecordingBot,
    recordingBotToken,
    recordingBotName,
    recordingBotUIConfig,
  };
}
