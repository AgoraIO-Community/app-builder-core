import {useEffect, useRef} from 'react';
import {
  SidePanelType,
  customEvents,
  useContent,
  useSTTAPI,
  useSidePanel,
} from 'customization-api';
import useTranscriptDownload from '../subComponents/caption/useTranscriptDownload';
import {useCaption} from '../subComponents/caption/useCaption';
import {LanguageType} from '../subComponents/caption/utils';

const useSpeechToText = () => {
  const {
    isCaptionON: isSpeechToTextOn,
    setIsCaptionON,
    meetingTranscript: transcriptData,
    captionObj: captionData,
    prevSpeakerRef,
    activeSpeakerRef,
  } = useCaption();
  const {setSidePanel} = useSidePanel();

  const {start, restart, stop, isAuthorizedSTTUser} = useSTTAPI();
  const {defaultContent} = useContent();

  const isAuthorizedSTTUserRef = useRef(isAuthorizedSTTUser);
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
      throw new Error('Speech To Text is not enabled');
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
      }
    : {};
};

export default useSpeechToText;
