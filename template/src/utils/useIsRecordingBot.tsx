import {useSearchParams} from './useSearchParams';

interface RecordingBotUIConfig {
  chat: boolean;
  topBar: boolean;
  bottomBar: boolean;
  stt: boolean;
}

export function useIsRecordingBot() {
  const isRecordingBot = useSearchParams().get('bot');
  const recordingBotToken = useSearchParams().get('token');
  const recordingBotName = useSearchParams().get('user_name');
  const isRecordingBotRoute = isRecordingBot && recordingBotToken;

  const recordingBotUIConfig: RecordingBotUIConfig = {
    chat: true,
    topBar: true,
    bottomBar: true,
    stt: true,
  };

  return {
    isRecordingBotRoute,
    isRecordingBot,
    recordingBotToken,
    recordingBotName,
    recordingBotUIConfig,
  };
}
