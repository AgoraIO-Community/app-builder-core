import {createHook} from 'customization-implementation';
import React from 'react';

interface Transcript {
  [key: string]: string;
}

export const CaptionContext = React.createContext<{
  isCaptionON: boolean;
  setIsCaptionON: React.Dispatch<React.SetStateAction<boolean>>;
  isCaptionON2: boolean;
  setIsCaptionON2: React.Dispatch<React.SetStateAction<boolean>>;
  isCaptionON3: boolean;
  setIsCaptionON3: React.Dispatch<React.SetStateAction<boolean>>;
  transcript: Transcript;
  setTranscript: React.Dispatch<React.SetStateAction<Transcript>>;
  isSTTActive: boolean;
  setIsSTTActive: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  isCaptionON: false,
  setIsCaptionON: () => {},
  isCaptionON2: false,
  setIsCaptionON2: () => {},
  isCaptionON3: false,
  setIsCaptionON3: () => {},
  transcript: {},
  setTranscript: () => {},
  isSTTActive: false,
  setIsSTTActive: () => {},
});

const CaptionProvider = ({children}) => {
  const [isCaptionON, setIsCaptionON] = React.useState<boolean>(false);
  const [isCaptionON2, setIsCaptionON2] = React.useState<boolean>(false); //TODO: to be removed
  const [isCaptionON3, setIsCaptionON3] = React.useState<boolean>(false); //TODO: to be removed
  const [transcript, setTranscript] = React.useState<Transcript>({});
  const [isSTTActive, setIsSTTActive] = React.useState<boolean>(false);

  return (
    <CaptionContext.Provider
      value={{
        isCaptionON,
        setIsCaptionON,
        isCaptionON2,
        setIsCaptionON2,
        isCaptionON3,
        setIsCaptionON3,
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
