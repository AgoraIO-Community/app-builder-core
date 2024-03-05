import {useSearchParams} from './useSearchParams';

interface RecordingBotUIConfig {
  chat: boolean;
  topBar: boolean;
  bottomBar: boolean;
  stt: boolean;
}

const regexPattern = new RegExp('true');

export function useIsRecordingBot() {
  const isRecordingBot = useSearchParams().get('bot');
  const recordingBotToken = useSearchParams().get('token');
  const recordingBotName = useSearchParams().get('user_name');
  const isRecordingBotRoute = isRecordingBot && recordingBotToken;

  const chatParam = useSearchParams().get('chat');
  const topBarParam = useSearchParams().get('topBar');
  const bottomBarParam = useSearchParams().get('bottomBar');
  const sttParam = useSearchParams().get('stt');

  const recordingBotUIConfig: RecordingBotUIConfig = {
    chat: chatParam ? regexPattern.test(chatParam) : true,
    topBar: topBarParam ? regexPattern.test(topBarParam) : true,
    bottomBar: bottomBarParam ? regexPattern.test(bottomBarParam) : true,
    stt: sttParam ? regexPattern.test(sttParam) : true,
  };

  console.log('supriya recordingBotUIConfig', recordingBotUIConfig);

  return {
    isRecordingBotRoute,
    isRecordingBot,
    recordingBotToken,
    recordingBotName,
    recordingBotUIConfig,
  };
}
