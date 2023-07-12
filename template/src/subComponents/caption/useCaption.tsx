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
  isTranscriptPaused: boolean;
  setIsTranscriptPaused: React.Dispatch<React.SetStateAction<boolean>>;
  isSTTActive: boolean;
  setIsSTTActive: React.Dispatch<React.SetStateAction<boolean>>;
  language: LanguageType[];
  setLanguage: React.Dispatch<React.SetStateAction<LanguageType[]>>;
  meetingTranscript: TranscriptItem[];
  setMeetingTranscript: React.Dispatch<React.SetStateAction<TranscriptItem[]>>;
  isLangChangeInProgress: boolean;
  setIsLangChangeInProgress: React.Dispatch<React.SetStateAction<boolean>>;
  captionObj: {[key: string]: string};
  setCaptionObj: React.Dispatch<React.SetStateAction<{[key: string]: string}>>;
  isSTTListenerAdded: boolean;
  setIsSTTListenerAdded: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  isCaptionON: false,
  setIsCaptionON: () => {},
  isTranscriptON: false,
  setIsTranscriptON: () => {},
  isTranscriptPaused: false,
  setIsTranscriptPaused: () => {},
  isSTTActive: false,
  setIsSTTActive: () => {},
  language: ['en-US'],
  setLanguage: () => {},
  meetingTranscript: [],
  setMeetingTranscript: () => {},
  isLangChangeInProgress: false,
  setIsLangChangeInProgress: () => {},
  captionObj: {},
  setCaptionObj: () => {},
  isSTTListenerAdded: false,
  setIsSTTListenerAdded: () => {},
});

const CaptionProvider = ({children}) => {
  const [isCaptionON, setIsCaptionON] = React.useState<boolean>(false);
  const [isTranscriptON, setIsTranscriptON] = React.useState<boolean>(false);
  const [isTranscriptPaused, setIsTranscriptPaused] =
    React.useState<boolean>(false);
  const [isSTTActive, setIsSTTActive] = React.useState<boolean>(false);
  const [language, setLanguage] = React.useState<[LanguageType]>(['en-US']);
  const [isLangChangeInProgress, setIsLangChangeInProgress] =
    React.useState<boolean>(false);
  const [meetingTranscript, setMeetingTranscript] = React.useState<
    TranscriptItem[]
  >([]);
  const [captionObj, setCaptionObj] = React.useState<{[key: string]: string}>(
    {},
  );
  const [isSTTListenerAdded, setIsSTTListenerAdded] =
    React.useState<boolean>(false);

  return (
    <CaptionContext.Provider
      value={{
        isCaptionON,
        setIsCaptionON,
        isTranscriptON,
        setIsTranscriptON,
        isTranscriptPaused,
        setIsTranscriptPaused,
        isSTTActive,
        setIsSTTActive,
        language,
        setLanguage,
        meetingTranscript,
        setMeetingTranscript,
        isLangChangeInProgress,
        setIsLangChangeInProgress,
        captionObj,
        setCaptionObj,
        isSTTListenerAdded,
        setIsSTTListenerAdded,
      }}>
      {children}
    </CaptionContext.Provider>
  );
};

const useCaption = createHook(CaptionContext);

export {CaptionProvider, useCaption};
