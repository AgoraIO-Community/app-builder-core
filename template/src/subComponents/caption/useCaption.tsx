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
}>({
  isCaptionON: false,
  setIsCaptionON: () => {},
  transcript: {},
  setTranscript: () => {},
});

const CaptionProvider = ({children}) => {
  const [isCaptionON, setIsCaptionON] = React.useState<boolean>(false);
  const [transcript, setTranscript] = React.useState<Transcript>({}); // to hold current caption

  return (
    <CaptionContext.Provider
      value={{isCaptionON, setIsCaptionON, transcript, setTranscript}}>
      {children}
    </CaptionContext.Provider>
  );
};

const useCaption = createHook(CaptionContext);

export {CaptionProvider, useCaption};
