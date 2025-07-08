import {createHook} from 'customization-implementation';
import React from 'react';
import {LanguageType, rimeVoices, V2V_URL, TTSType} from './utils';
import getUniqueID from '../../utils/getUniqueID';

export type TranscriptItem = {
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

export const V2VContext = React.createContext<{
  // for caption btn state
  isV2VON: boolean;
  setIsV2VON: React.Dispatch<React.SetStateAction<boolean>>;

  // for error state
  isV2VError: boolean;
  setIsV2VError: React.Dispatch<React.SetStateAction<boolean>>;

  // to check if V2V is active in the call
  isV2VActive: boolean;
  setIsV2VActive: React.Dispatch<React.SetStateAction<boolean>>;

  // holds the language selection for V2V
  language: LanguageType[];
  setLanguage: React.Dispatch<React.SetStateAction<LanguageType[]>>;

  // source and target language for translation
  sourceLang: LanguageType;
  setSourceLang: React.Dispatch<React.SetStateAction<LanguageType>>;
  targetLang: LanguageType;
  setTargetLang: React.Dispatch<React.SetStateAction<LanguageType>>;

  // holds meeting transcript
  meetingTranscript: TranscriptItem[];
  setMeetingTranscript: React.Dispatch<React.SetStateAction<TranscriptItem[]>>;

  // holds status of V2V language change process
  isLangChangeInProgress: boolean;
  setIsLangChangeInProgress: React.Dispatch<React.SetStateAction<boolean>>;

  // holds status of StreamMessageCallback listener added (caption/transcript)
  isV2VListenerAdded: boolean;
  setIsV2VListenerAdded: React.Dispatch<React.SetStateAction<boolean>>;

  isSonioxV2VListenerAdded: boolean;
  setIsSonioxV2VListenerAdded: React.Dispatch<React.SetStateAction<boolean>>;

  activeSpeakerRef: React.MutableRefObject<string>;
  prevSpeakerRef: React.MutableRefObject<string>;
  translations: Object;
  setTranslations: React.Dispatch<React.SetStateAction<Object>>;
  selectedVoice: string;
  setSelectedVoice: React.Dispatch<React.SetStateAction<string>>;
  selectedTTS: TTSType;
  setSelectedTTS: React.Dispatch<React.SetStateAction<TTSType>>;
}>({
  isV2VON: false,
  setIsV2VON: () => {},
  isV2VError: false,
  setIsV2VError: () => {},
  isV2VActive: false,
  setIsV2VActive: () => {},
  language: ['en'],
  setLanguage: () => {},
  sourceLang: 'en',
  setSourceLang: () => {},
  targetLang: 'es',
  setTargetLang: () => {},
  meetingTranscript: [],
  setMeetingTranscript: () => {},
  isLangChangeInProgress: false,
  setIsLangChangeInProgress: () => {},
  isV2VListenerAdded: false,
  setIsV2VListenerAdded: () => {},
  activeSpeakerRef: {current: ''},
  prevSpeakerRef: {current: ''},
  translations: {},
  setTranslations: () => {},
  isSonioxV2VListenerAdded: false,
  setIsSonioxV2VListenerAdded: () => {},
  selectedVoice: rimeVoices[0]?.value || '',
  setSelectedVoice: () => {},
  selectedTTS: 'rime',
  setSelectedTTS: () => {},
});

interface V2VProviderProps {
  callActive: boolean;
  children: React.ReactNode;
}

const V2VProvider: React.FC<V2VProviderProps> = ({callActive, children}) => {
  const [isV2VError, setIsV2VError] = React.useState<boolean>(false);
  const [isV2VON, setIsV2VON] = React.useState<boolean>(false);
  const [isV2VActive, setIsV2VActive] = React.useState<boolean>(false);
  const [language, setLanguage] = React.useState<[LanguageType]>(['']);
  const [sourceLang, setSourceLang] = React.useState<LanguageType>('en');
  const [targetLang, setTargetLang] = React.useState<LanguageType>('es');
  const [isLangChangeInProgress, setIsLangChangeInProgress] =
    React.useState<boolean>(false);
  const [meetingTranscript, setMeetingTranscript] = React.useState<
    TranscriptItem[]
  >([]);

  const [isV2VListenerAdded, setIsV2VListenerAdded] =
    React.useState<boolean>(false);
  const [isSonioxV2VListenerAdded, setIsSonioxV2VListenerAdded] =
    React.useState<boolean>(false);
  const [activeSpeakerUID, setActiveSpeakerUID] = React.useState<string>('');
  const [prevActiveSpeakerUID, setPrevActiveSpeakerUID] =
    React.useState<string>('');

  const activeSpeakerRef = React.useRef('');
  const prevSpeakerRef = React.useRef('');
  const [translations, setTranslations] = React.useState<
    {
      uid: string;
      text: string; // finalized text
      nonFinal?: string; // optional, shows live tokens
      time: number;
    }[]
  >([]);

  const [selectedVoice, setSelectedVoice] = React.useState<string>(
    rimeVoices[0]?.value || '',
  );
  const [selectedTTS, setSelectedTTS] = React.useState<TTSType>('rime');

  return (
    <V2VContext.Provider
      value={{
        isV2VON,
        setIsV2VON,
        isV2VError,
        setIsV2VError,
        isV2VActive,
        setIsV2VActive,
        language,
        setLanguage,
        sourceLang,
        setSourceLang,
        targetLang,
        setTargetLang,
        meetingTranscript,
        setMeetingTranscript,
        isLangChangeInProgress,
        setIsLangChangeInProgress,
        isV2VListenerAdded,
        setIsV2VListenerAdded,
        activeSpeakerRef,
        prevSpeakerRef,
        translations,
        setTranslations,
        isSonioxV2VListenerAdded,
        setIsSonioxV2VListenerAdded,
        selectedVoice,
        setSelectedVoice,
        selectedTTS,
        setSelectedTTS,
      }}>
      {children}
    </V2VContext.Provider>
  );
};

const useV2V = createHook(V2VContext);

const requestId = getUniqueID();

//disconnect V2V user from channel
export const disconnectV2VUser = (channel, userId) => {
  fetch(`${V2V_URL}/disconnect_channel`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Request-Id': requestId},
    body: JSON.stringify({
      channel_name: channel,
      user_id: userId.toString(),
    }),
  }).catch(err => {
    console.error('Error disconnecting V2V bot:', err);
  });
};

export {V2VProvider, useV2V};
