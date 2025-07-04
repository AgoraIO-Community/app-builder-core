import React, {createContext, useContext, useState, ReactNode} from 'react';
import {SourceLanguageType, TargetLanguageType} from './utils';
import {createHook} from 'customization-implementation';

interface PalabraTranslationEntry {
  uid: string;
  text: string;
  time: number;
}

interface PalabraContextType {
  isPalabraON: boolean;
  setIsPalabraON: React.Dispatch<React.SetStateAction<boolean>>;
  isPalabraActive: boolean;
  setIsPalabraActive: (active: boolean) => void;
  sourceLang: SourceLanguageType;
  setSourceLang: (lang: SourceLanguageType) => void;
  targetLang: TargetLanguageType;
  setTargetLang: (lang: TargetLanguageType) => void;
  translatedText: PalabraTranslationEntry[];
  setTranslatedText: React.Dispatch<
    React.SetStateAction<PalabraTranslationEntry[]>
  >;
}

const PalabraContext = createContext<PalabraContextType | undefined>(undefined);

const PalabraProvider = ({children}: {children: ReactNode}) => {
  const [isPalabraActive, setIsPalabraActive] = useState(false);
  const [sourceLang, setSourceLang] = useState<SourceLanguageType>('en');
  const [targetLang, setTargetLang] = useState<TargetLanguageType>('hi');
  const [isPalabraON, setIsPalabraON] = useState(false);
  const [translatedText, setTranslatedText] = useState<
    PalabraTranslationEntry[]
  >([]);

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
        translatedText,
        setTranslatedText,
      }}>
      {children}
    </PalabraContext.Provider>
  );
};

const useV2VPalabra = createHook(PalabraContext);

export type {PalabraTranslationEntry};
export {PalabraProvider, useV2VPalabra};
