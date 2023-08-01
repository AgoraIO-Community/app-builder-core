import {createHook} from 'customization-implementation';
import React from 'react';
import {LanguageType} from './utils';

type TranscriptItem = {
  uid: string;
  time: number;
  text: string;
};

type CaptionObj = {
  [key: string]: {
    text: string;
    lastUpdated: number;
  };
};

export const CaptionContext = React.createContext<{
  // for caption btn state
  isCaptionON: boolean;
  setIsCaptionON: React.Dispatch<React.SetStateAction<boolean>>;

  // for transcript btn state
  isTranscriptON: boolean;
  setIsTranscriptON: React.Dispatch<React.SetStateAction<boolean>>;

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

  activeSpeakerUID: string;
  setActiveSpeakerUID: React.Dispatch<React.SetStateAction<string>>;

  prevActiveSpeakerUID: string;
  setPrevActiveSpeakerUID: React.Dispatch<React.SetStateAction<string>>;
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
  captionObj: {},
  setCaptionObj: () => {},
  isSTTListenerAdded: false,
  setIsSTTListenerAdded: () => {},
  activeSpeakerUID: '',
  setActiveSpeakerUID: () => {},
  prevActiveSpeakerUID: '',
  setPrevActiveSpeakerUID: () => {},
});

const CaptionProvider = ({children}) => {
  const [isCaptionON, setIsCaptionON] = React.useState<boolean>(false);
  const [isTranscriptON, setIsTranscriptON] = React.useState<boolean>(false);
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
        captionObj,
        setCaptionObj,
        isSTTListenerAdded,
        setIsSTTListenerAdded,
        activeSpeakerUID,
        setActiveSpeakerUID,
        prevActiveSpeakerUID,
        setPrevActiveSpeakerUID,
      }}>
      {children}
    </CaptionContext.Provider>
  );
};

const useCaption = createHook(CaptionContext);

export {CaptionProvider, useCaption};
