import React, {createContext, useContext, useState, ReactNode} from 'react';
import {LanguageType} from '../utils';
import {createHook} from 'customization-implementation';

interface PalabraContextType {
  isPalabraON: boolean;
  setIsPalabraON: React.Dispatch<React.SetStateAction<boolean>>;
  isPalabraActive: boolean;
  setIsPalabraActive: (active: boolean) => void;
  sourceLang: LanguageType;
  setSourceLang: (lang: LanguageType) => void;
  targetLang: LanguageType;
  setTargetLang: (lang: LanguageType) => void;
}

const PalabraContext = createContext<PalabraContextType | undefined>(undefined);

const PalabraProvider = ({children}: {children: ReactNode}) => {
  const [isPalabraActive, setIsPalabraActive] = useState(false);
  const [sourceLang, setSourceLang] = useState<LanguageType>('en');
  const [targetLang, setTargetLang] = useState<LanguageType>('es');
  const [isPalabraON, setIsPalabraON] = useState(false);

  return (
    <PalabraContext.Provider
      value={{
        isPalabraON,
        setIsPalabraON,
        isPalabraActive,
        setIsPalabraActive,
        sourceLang,
        setSourceLang,
        targetLang,
        setTargetLang,
      }}>
      {children}
    </PalabraContext.Provider>
  );
};

const useV2VPalabra = createHook(PalabraContext);

export {PalabraProvider, useV2VPalabra};
