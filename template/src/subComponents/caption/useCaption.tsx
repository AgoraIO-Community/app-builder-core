import {createHook} from 'customization-implementation';
import React from 'react';

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
  isSTTActive: boolean;
  setIsSTTActive: React.Dispatch<React.SetStateAction<boolean>>;
  language: 'en-US' | 'hi-IN' | 'zh-CN' | '';
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  meetingTranscript: TranscriptItem[];
  setMeetingTranscript: React.Dispatch<React.SetStateAction<TranscriptItem[]>>;
}>({
  isCaptionON: false,
  setIsCaptionON: () => {},
  isSTTActive: false,
  setIsSTTActive: () => {},
  language: 'en-US',
  setLanguage: () => {},
  meetingTranscript: [],
  setMeetingTranscript: () => {},
});

const CaptionProvider = ({children}) => {
  const [isCaptionON, setIsCaptionON] = React.useState<boolean>(false);
  const [isSTTActive, setIsSTTActive] = React.useState<boolean>(false);
  const [language, setLanguage] = React.useState<string>('');
  const [meetingTranscript, setMeetingTranscript] = React.useState<
    TranscriptItem[]
  >([]);

  return (
    <CaptionContext.Provider
      value={{
        isCaptionON,
        setIsCaptionON,
        isSTTActive,
        setIsSTTActive,
        language,
        setLanguage,
        meetingTranscript,
        setMeetingTranscript,
      }}>
      {children}
    </CaptionContext.Provider>
  );
};

const useCaption = createHook(CaptionContext);

export {CaptionProvider, useCaption};
