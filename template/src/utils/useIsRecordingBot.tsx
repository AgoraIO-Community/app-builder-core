import {useSearchParams} from './useSearchParams';

export function useIsRecordingBot() {
  const isRecordingBot = useSearchParams().get('bot');
  // const isRecordingBot = true;
  const recordingBotToken = useSearchParams().get('token');
  const recordingBotName = useSearchParams().get('user_name');
  const isRecordingBotRoute = isRecordingBot && recordingBotToken;
  return {
    isRecordingBotRoute,
    isRecordingBot,
    recordingBotToken,
    recordingBotName,
  };
}
