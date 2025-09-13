import React from 'react';
import {LanguageType} from '../utils';

type TranslationItem = {
  lang: string;
  text: string;
  isFinal: boolean;
};

export type TranscriptItem = {
  uid: string;
  time: number;
  text: string;
  translations?: TranslationItem[];
};

type CaptionObj = {
  [key: string]: {
    text: string;
    translations: TranslationItem[];
    lastUpdated: number;
  };
};

export const SonioxCaptionContext = React.createContext<{
  // for caption btn state
  isCaptionON: boolean;
  setIsCaptionON: React.Dispatch<React.SetStateAction<boolean>>;

  // for error state
  isSTTError: boolean;
  setIsSTTError: React.Dispatch<React.SetStateAction<boolean>>;

  // to check if stt is active in the call
  isSTTActive: boolean;
  setIsSTTActive: React.Dispatch<React.SetStateAction<boolean>>;

  // holds the language selection for stt
  language: LanguageType[];
  setLanguage: React.Dispatch<React.SetStateAction<LanguageType[]>>;

  // holds meeting transcript
  meetingTranscript: TranscriptItem[];
  setMeetingTranscript: React.Dispatch<React.SetStateAction<TranscriptItem[]>>;

  // holds status of stt language change process
  isLangChangeInProgress: boolean;
  setIsLangChangeInProgress: React.Dispatch<React.SetStateAction<boolean>>;

  // holds live captions
  captionObj: CaptionObj;
  setCaptionObj: React.Dispatch<React.SetStateAction<CaptionObj>>;

  // holds status of StreamMessageCallback listener added (caption/transcript)
  isSTTListenerAdded: boolean;
  setIsSTTListenerAdded: React.Dispatch<React.SetStateAction<boolean>>;

  activeSpeakerRef: React.MutableRefObject<string>;
  prevSpeakerRef: React.MutableRefObject<string>;

  selectedTranslationLanguage: string;
  setSelectedTranslationLanguage: React.Dispatch<React.SetStateAction<string>>;
}>({
  isCaptionON: false,
  setIsCaptionON: () => {},
  isSTTError: false,
  setIsSTTError: () => {},
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
  activeSpeakerRef: {current: ''},
  prevSpeakerRef: {current: ''},
  selectedTranslationLanguage: '',
  setSelectedTranslationLanguage: () => {},
});

interface SonioxCaptionProviderProps {
  callActive: boolean;
  children: React.ReactNode;
}

const SonioxCaptionProvider: React.FC<SonioxCaptionProviderProps> = ({
  callActive,
  children,
}) => {
  const [isSTTError, setIsSTTError] = React.useState<boolean>(false);
  const [isCaptionON, setIsCaptionON] = React.useState<boolean>(false);
  const [isSTTActive, setIsSTTActive] = React.useState<boolean>(false);
  const [language, setLanguage] = React.useState<[LanguageType]>(['']);
  const [isLangChangeInProgress, setIsLangChangeInProgress] =
    React.useState<boolean>(false);
  const [meetingTranscript, setMeetingTranscript] = React.useState<
    TranscriptItem[]
  >([]);
  const [captionObj, setCaptionObj] = React.useState<CaptionObj>({});
  const [isSTTListenerAdded, setIsSTTListenerAdded] =
    React.useState<boolean>(false);
  const [activeSpeakerUID, setActiveSpeakerUID] = React.useState<string>('');
  const [prevActiveSpeakerUID, setPrevActiveSpeakerUID] =
    React.useState<string>('');
  const [selectedTranslationLanguage, setSelectedTranslationLanguage] =
    React.useState<string>('');

  const activeSpeakerRef = React.useRef('');
  const prevSpeakerRef = React.useRef('');

  return (
    <SonioxCaptionContext.Provider
      value={{
        isCaptionON,
        setIsCaptionON,
        isSTTError,
        setIsSTTError,
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
        activeSpeakerRef,
        prevSpeakerRef,
        selectedTranslationLanguage,
        setSelectedTranslationLanguage,
      }}>
      {children}
    </SonioxCaptionContext.Provider>
  );
};

const useSonioxCaption = () => {
  const context = React.useContext(SonioxCaptionContext);
  if (!context) {
    throw new Error('useSonioxCaption must be used within SonioxCaptionProvider');
  }
  return context;
};

export {SonioxCaptionProvider, useSonioxCaption};