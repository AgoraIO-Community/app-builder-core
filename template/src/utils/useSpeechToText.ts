import {useEffect, useRef} from 'react';
import {
  SidePanelType,
  customEvents,
  useContent,
  useRtc,
  useSTTAPI,
  useSidePanel,
} from 'customization-api';
import useTranscriptDownload from '../subComponents/caption/useTranscriptDownload';
import {useCaption} from '../subComponents/caption/useCaption';
import {LanguageType} from '../subComponents/caption/utils';
import useStreamMessageUtils from '../subComponents/caption/useStreamMessageUtils';
import {
  NativeStreamMessageArgs,
  StreamMessageArgs,
  WebStreamMessageArgs,
} from '../subComponents/caption/Caption';
import {isWebInternal} from './common';

const useSpeechToText = () => {
  const {
    isCaptionON: isSpeechToTextOn,
    setIsCaptionON,
    meetingTranscript: transcriptData,
    captionObj: captionData,
    prevSpeakerRef,
    activeSpeakerRef,
    isSTTListenerAdded,
    setIsSTTListenerAdded,
  } = useCaption();
  const {setSidePanel} = useSidePanel();

  const {start, restart, stop, isAuthorizedSTTUser} = useSTTAPI();
  const {defaultContent} = useContent();

  const isAuthorizedSTTUserRef = useRef(isAuthorizedSTTUser);
  const defaultContentRef = useRef(defaultContent);
  const {RtcEngineUnsafe} = useRtc();
  const {streamMessageCallback} = useStreamMessageUtils();

  const showTranscriptPanel = (show: boolean) => {
    show
      ? setSidePanel(SidePanelType.Transcript)
      : setSidePanel(SidePanelType.None);
  };

  const showCaptionPanel = (show: boolean) => {
    show ? setIsCaptionON(true) : setIsCaptionON(false);
  };

  useEffect(() => {
    if (!$config.ENABLE_STT) {
      //throw new Error('Speech To Text is not enabled');
      console.log('Speech To Text is not enabled');
    }
  }, []);

  useEffect(() => {
    isAuthorizedSTTUserRef.current = isAuthorizedSTTUser;
  }, [isAuthorizedSTTUser]);

  useEffect(() => {
    defaultContentRef.current = defaultContent;
  }, [defaultContent]);

  const {downloadTranscript} = useTranscriptDownload();

  const getActiveSpeakerName = (): string => {
    return defaultContentRef.current[activeSpeakerRef.current]?.name || '';
  };

  const getPrevSpeakerName = (): string => {
    return defaultContentRef.current[prevSpeakerRef.current]?.name || '';
  };

  const startSpeechToText = async (language: LanguageType[]) => {
    if (!isAuthorizedSTTUserRef.current) {
      throw new Error('Invalid user');
    }
    return await start(language);
  };

  const stopSpeechToText = async () => {
    if (!isAuthorizedSTTUserRef.current) {
      throw new Error('Invalid user');
    }
    return await stop();
  };

  const addStreamMessageListener = () => {
    !isSTTListenerAdded &&
      RtcEngineUnsafe.addListener(
        'onStreamMessage',
        handleStreamMessageCallback,
      );
  };
  const handleStreamMessageCallback = (...args: StreamMessageArgs) => {
    setIsSTTListenerAdded(true);
    if (isWebInternal()) {
      const [uid, data] = args as WebStreamMessageArgs;
      streamMessageCallback([uid, data]);
    } else {
      const [, uid, , data] = args as NativeStreamMessageArgs;
      streamMessageCallback([uid, data]);
    }
  };

  const changeSpeakingLanguage = async (language: LanguageType[]) => {
    if (!isAuthorizedSTTUserRef.current) {
      throw new Error('Invalid user');
    }
    return await restart(language);
  };

  return $config.ENABLE_STT
    ? {
        isSpeechToTextOn,
        startSpeechToText,
        stopSpeechToText,
        changeSpeakingLanguage,
        downloadTranscript,
        getActiveSpeakerName,
        getPrevSpeakerName,
        showTranscriptPanel,
        showCaptionPanel,
        transcriptData,
        captionData,
        addStreamMessageListener,
      }
    : {};
};

export default useSpeechToText;
