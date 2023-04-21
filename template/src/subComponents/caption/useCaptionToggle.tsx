import {createHook} from 'customization-implementation';
import React from 'react';

export const CaptionToggleContext = React.createContext<{
  isCaptionON: boolean;
  setIsCaptionON: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  isCaptionON: false,
  setIsCaptionON: () => {},
});

const CaptionToggleProvider = ({children}) => {
  const [isCaptionON, setIsCaptionON] = React.useState<boolean>(false);
  return (
    <CaptionToggleContext.Provider value={{isCaptionON, setIsCaptionON}}>
      {children}
    </CaptionToggleContext.Provider>
  );
};

const useCaptionToggle = createHook(CaptionToggleContext);

export {CaptionToggleProvider, useCaptionToggle};
