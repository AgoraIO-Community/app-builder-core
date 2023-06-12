import {createHook} from 'customization-implementation';
import React from 'react';
import {LanguageType} from './LanguageSelectorPopup';

interface Transcript {
  [key: string]: string;
}
type TranscriptItem = {
  name: string;
  uid: string;
  time: number;
  text: string;
};

export const CaptionContext = React.createContext<{
  isCaptionON: boolean;
  setIsCaptionON: React.Dispatch<React.SetStateAction<boolean>>;
  isTranscriptON: boolean;
  setIsTranscriptON: React.Dispatch<React.SetStateAction<boolean>>;
  isSTTActive: boolean;
  setIsSTTActive: React.Dispatch<React.SetStateAction<boolean>>;
  language: LanguageType[];
  setLanguage: React.Dispatch<React.SetStateAction<LanguageType[]>>;
  meetingTranscript: TranscriptItem[];
  setMeetingTranscript: React.Dispatch<React.SetStateAction<TranscriptItem[]>>;
  isLangChangeInProgress: boolean;
  setIsLangChangeInProgress: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  isCaptionON: false,
  setIsCaptionON: () => {},
  isTranscriptON: false,
  setIsTranscriptON: () => {},
  isSTTActive: false,
  setIsSTTActive: () => {},
  language: ['en-US'],
  setLanguage: () => {},
  meetingTranscript: [],
  setMeetingTranscript: () => {},
  isLangChangeInProgress: false,
  setIsLangChangeInProgress: () => {},
});

const CaptionProvider = ({children}) => {
  const [isCaptionON, setIsCaptionON] = React.useState<boolean>(false);
  const [isTranscriptON, setIsTranscriptON] = React.useState<boolean>(false);
  const [isSTTActive, setIsSTTActive] = React.useState<boolean>(false);
  const [language, setLanguage] = React.useState<[LanguageType]>(['en-US']);
  const [isLangChangeInProgress, setIsLangChangeInProgress] =
    React.useState<boolean>(false);
  const [meetingTranscript, setMeetingTranscript] = React.useState<
    TranscriptItem[]
  >([]);

  return (
    <CaptionContext.Provider
      value={{
        isCaptionON,
        setIsCaptionON,
        isTranscriptON,
        setIsTranscriptON,
        isSTTActive,
        setIsSTTActive,
        language,
        setLanguage,
        meetingTranscript,
        setMeetingTranscript,
        isLangChangeInProgress,
        setIsLangChangeInProgress,
      }}>
      {children}
    </CaptionContext.Provider>
  );
};

const useCaption = createHook(CaptionContext);

export {CaptionProvider, useCaption};
