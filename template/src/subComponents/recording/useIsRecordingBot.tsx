import {useSearchParams} from '../../utils/useSearchParams';

interface RecordingBotUIConfig {
  chat: boolean;
  topBar: boolean;
  bottomBar: boolean;
  stt: boolean;
}

const regexPattern = new RegExp('true');

export function useIsRecordingBot() {
  // Reading and setting URL params
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
    topBar: topBarParam ? regexPattern.test(topBarParam) : false,
    bottomBar: bottomBarParam ? regexPattern.test(bottomBarParam) : false,
    stt: sttParam ? regexPattern.test(sttParam) : false,
  };

  return {
    isRecordingBotRoute,
    isRecordingBot,
    recordingBotToken,
    recordingBotName,
    recordingBotUIConfig,
  };
}
