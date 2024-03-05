import {useState} from 'react';
import {
  ChatType,
  useChatUIControls,
} from '../components/chat-ui/useChatUIControls';
import {useSearchParams} from './useSearchParams';
import {useSidePanel} from '../utils/useSidePanel';
import {useCaption} from '../subComponents/caption/useCaption';
import {SidePanelType} from '../subComponents/SidePanelEnum';

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
    topBar: topBarParam ? regexPattern.test(topBarParam) : true,
    bottomBar: bottomBarParam ? regexPattern.test(bottomBarParam) : true,
    stt: sttParam ? regexPattern.test(sttParam) : true,
  };

  // Creating UI based on URL params
  // const [recordingBotUI, setRecordingBotUI] = useState(recordingBotUIConfig);

  console.log('supriya recordingBotUIConfig', recordingBotUIConfig);
  const {setChatType} = useChatUIControls();
  const {setSidePanel} = useSidePanel();
  const {setIsCaptionON} = useCaption();

  const setRecordingBotUI = () => {
    if (isRecordingBot) {
      setSidePanel(SidePanelType.Chat);
      setChatType(ChatType.Group);
      setIsCaptionON(true);
    }
  };

  return {
    isRecordingBotRoute,
    isRecordingBot,
    recordingBotToken,
    recordingBotName,
    recordingBotUIConfig,
    setRecordingBotUI,
  };
}
