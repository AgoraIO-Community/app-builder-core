import {useEffect, useRef} from 'react';
import {
  SidePanelType,
  customEvents,
  useContent,
  useSTTAPI,
  useSidePanel,
} from 'customization-api';
import useTranscriptDownload from '../subComponents/caption/useTranscriptDownload';
import {
  LanguageTranslationConfig,
  useCaption,
} from '../subComponents/caption/useCaption';
import {LanguageType} from '../subComponents/caption/utils';

const useSpeechToText = () => {
  const {
    isCaptionON: isSpeechToTextOn,
    setIsCaptionON,
    meetingTranscript: transcriptData,
    captionObj: captionData,
    prevSpeakerRef,
    activeSpeakerRef,
    startSTTBotSession,
    updateSTTBotSession,
    stopSTTBotSession,
  } = useCaption();
  const {setSidePanel} = useSidePanel();

  // const {start, restart, stop, isAuthorizedSTTUser} = useSTTAPI();
  const {defaultContent} = useContent();

  // const isAuthorizedSTTUserRef = useRef(isAuthorizedSTTUser);
  const defaultContentRef = useRef(defaultContent);

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

  // useEffect(() => {
  //   isAuthorizedSTTUserRef.current = isAuthorizedSTTUser;
  // }, [isAuthorizedSTTUser]);

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

  const startSpeechToText = async (
    translateConfig: LanguageTranslationConfig,
  ) => {
    //  if (!isAuthorizedSTTUserRef.current) {
    //   throw new Error('Invalid user');
    // }
    return await startSTTBotSession(translateConfig);
  };

  const stopSpeechToText = async () => {
    // Ask-bhupendra
    // if (!isAuthorizedSTTUserRef.current) {
    //   throw new Error('Invalid user');
    // }
    return await stopSTTBotSession();
  };

  // Kept for customization API compatibility. CaptionProvider owns the single
  // meeting-lifetime listener now, so callers no longer need to register one.
  const addStreamMessageListener = () => {};

  const changeSpeakingLanguage = async (
    translateConfig: LanguageTranslationConfig,
  ) => {
    // if (!isAuthorizedSTTUserRef.current) {
    //   throw new Error('Invalid user');
    // }
    return await updateSTTBotSession(translateConfig);
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
