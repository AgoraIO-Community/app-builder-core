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
    chat: Boolean(useSearchParams().get('chat')) || true,
    topBar: Boolean(useSearchParams().get('topBar')) || true,
    bottomBar: Boolean(useSearchParams().get('bottomBar')) || true,
    stt: Boolean(useSearchParams().get('stt')) || true,
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
