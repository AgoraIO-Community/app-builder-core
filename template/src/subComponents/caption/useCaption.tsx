import {createHook} from 'customization-implementation';
import React from 'react';

interface Transcript {
  [key: string]: string;
}

export const CaptionContext = React.createContext<{
  isCaptionON: boolean;
  setIsCaptionON: React.Dispatch<React.SetStateAction<boolean>>;
  transcript: Transcript;
  setTranscript: React.Dispatch<React.SetStateAction<Transcript>>;
  isSTTActive: boolean;
  setIsSTTActive: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  isCaptionON: false,
  setIsCaptionON: () => {},
  transcript: {},
  setTranscript: () => {},
  isSTTActive: false,
  setIsSTTActive: () => {},
});

const CaptionProvider = ({children}) => {
  const [isCaptionON, setIsCaptionON] = React.useState<boolean>(false);
  const [transcript, setTranscript] = React.useState<Transcript>({});
  const [isSTTActive, setIsSTTActive] = React.useState<boolean>(false);

  return (
    <CaptionContext.Provider
      value={{
        isCaptionON,
        setIsCaptionON,
        transcript,
        setTranscript,
        isSTTActive,
        setIsSTTActive,
      }}>
      {children}
    </CaptionContext.Provider>
  );
};

const useCaption = createHook(CaptionContext);

export {CaptionProvider, useCaption};
