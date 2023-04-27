import {createHook} from 'customization-implementation';
import React from 'react';

interface Transcript {
  [key: string]: string;
}

export const CaptionToggleContext = React.createContext<{
  isCaptionON: boolean;
  setIsCaptionON: React.Dispatch<React.SetStateAction<boolean>>;
  transcript: Transcript;
  setTranscript: React.Dispatch<React.SetStateAction<Transcript>>;
}>({
  isCaptionON: false,
  setIsCaptionON: () => {},
  transcript: {},
  setTranscript: () => {},
});

const CaptionToggleProvider = ({children}) => {
  const [isCaptionON, setIsCaptionON] = React.useState<boolean>(false);
  const [transcript, setTranscript] = React.useState<Transcript>({}); // to hold current caption

  return (
    <CaptionToggleContext.Provider
      value={{isCaptionON, setIsCaptionON, transcript, setTranscript}}>
      {children}
    </CaptionToggleContext.Provider>
  );
};

const useCaptionToggle = createHook(CaptionToggleContext);

export {CaptionToggleProvider, useCaptionToggle};
