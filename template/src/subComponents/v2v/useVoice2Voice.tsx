import {createHook} from 'customization-implementation';
import React from 'react';
import {
  LanguageType,
  rimeVoices,
  V2V_URL,
  TTSType,
  RimeModelType,
  ElevenLabsModelType,
  STTModelType,
  elevenLabsVoices,
} from './utils';
import getUniqueID from '../../utils/getUniqueID';
import {logger, LogSource} from '../../logger/AppBuilderLogger';
import Toast from '../../../react-native-toast-message';
import {useEffect} from 'react';

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

  // for V2V API error message
  v2vAPIError: string | null;
  setV2vAPIError: React.Dispatch<React.SetStateAction<string | null>>;

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

  activeSpeakerRef: React.MutableRefObject<string>;
  prevSpeakerRef: React.MutableRefObject<string>;
  translations: {
    uid: string;
    srcText: string;
    tgtText: string;
    srcNonFinal?: string;
    tgtNonFinal?: string;
    time: number;
    sourceLang: string;
    targetLang: string;
  }[];
  setTranslations: React.Dispatch<
    React.SetStateAction<
      {
        uid: string;
        srcText: string;
        tgtText: string;
        srcNonFinal?: string;
        tgtNonFinal?: string;
        time: number;
        sourceLang: string;
        targetLang: string;
      }[]
    >
  >;
  statsList: any[];
  setStatsList: React.Dispatch<React.SetStateAction<any[]>>;
  selectedVoice: string;
  setSelectedVoice: React.Dispatch<React.SetStateAction<string>>;
  selectedTTS: TTSType;
  setSelectedTTS: React.Dispatch<React.SetStateAction<TTSType>>;
  providerConfigs: any;
  setProviderConfigs: React.Dispatch<React.SetStateAction<any>>;
  isV2VStatsModalOpen: boolean;
  setIsV2VStatsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  maxNonFinalTokensDurationMs: number;
  setMaxNonFinalTokensDurationMs: React.Dispatch<React.SetStateAction<number>>;
  rtcSleepTimeMs: number;
  setRtcSleepTimeMs: React.Dispatch<React.SetStateAction<number>>;
  useRestTTS: boolean;
  setUseRestTTS: React.Dispatch<React.SetStateAction<boolean>>;
  selectedSTTModel: STTModelType;
  setSelectedSTTModel: React.Dispatch<React.SetStateAction<STTModelType>>;
}>({
  isV2VON: false,
  setIsV2VON: () => {},
  isV2VError: false,
  setIsV2VError: () => {},
  v2vAPIError: null,
  setV2vAPIError: () => {},
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
  activeSpeakerRef: {current: ''},
  prevSpeakerRef: {current: ''},
  translations: [],
  setTranslations: () => {},
  statsList: [],
  setStatsList: () => {},
  selectedVoice: rimeVoices[0]?.value || '',
  setSelectedVoice: () => {},
  selectedTTS: 'rime',
  setSelectedTTS: () => {},
  providerConfigs: {
    rime: {
      sourceLang: 'en',
      targetLang: 'es',
      voice: rimeVoices[0]?.value || '',
      model: 'mistv2',
    },
    eleven_labs: {
      sourceLang: 'en',
      targetLang: 'hi',
      voice: 'TRnaQb7q41oL7sV0w6Bu', // Simran - Gen Z, Hindi (Female)
      model: 'eleven_multilingual_v2',
    },
  },
  setProviderConfigs: () => {},
  isV2VStatsModalOpen: false,
  setIsV2VStatsModalOpen: () => {},
  maxNonFinalTokensDurationMs: 700,
  setMaxNonFinalTokensDurationMs: () => {},
  rtcSleepTimeMs: 40,
  setRtcSleepTimeMs: () => {},
  useRestTTS: false,
  setUseRestTTS: () => {},
  selectedSTTModel: 'stt-rt-preview-v2',
  setSelectedSTTModel: () => {},
});

interface V2VProviderProps {
  callActive: boolean;
  children: React.ReactNode;
}

const V2VProvider: React.FC<V2VProviderProps> = ({callActive, children}) => {
  const [isV2VError, setIsV2VError] = React.useState<boolean>(false);
  const [v2vAPIError, setV2vAPIError] = React.useState<string | null>(null);
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
  const [isV2VStatsModalOpen, setIsV2VStatsModalOpen] = React.useState(false);
  const [maxNonFinalTokensDurationMs, setMaxNonFinalTokensDurationMs] =
    React.useState<number>(700);
  const [rtcSleepTimeMs, setRtcSleepTimeMs] = React.useState<number>(10);
  const [useRestTTS, setUseRestTTS] = React.useState<boolean>(false);
  const [selectedSTTModel, setSelectedSTTModel] =
    React.useState<STTModelType>('stt-rt-preview-v2');

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
      srcText: string;
      tgtText: string;
      srcNonFinal?: string;
      tgtNonFinal?: string;
      time: number;
      sourceLang: string;
      targetLang: string;
    }[]
  >([]);
  const [statsList, setStatsList] = React.useState<any[]>([]);

  const [selectedVoice, setSelectedVoice] = React.useState<string>(
    rimeVoices[0]?.value || '',
  );
  const [selectedTTS, setSelectedTTS] = React.useState<TTSType>('rime');
  const [providerConfigs, setProviderConfigs] = React.useState({
    rime: {
      sourceLang: 'en',
      targetLang: 'es',
      voice: rimeVoices[0]?.value || '',
      model: 'mistv2' as RimeModelType,
    },
    eleven_labs: {
      sourceLang: 'en',
      targetLang: 'hi',
      voice: 'TRnaQb7q41oL7sV0w6Bu', // Simran - Gen Z, Hindi (Female)
      model: 'eleven_multilingual_v2' as ElevenLabsModelType,
    },
  });

  // Show toast when v2vAPIError is set
  useEffect(() => {
    if (v2vAPIError) {
      Toast.show({
        leadingIconName: 'alert',
        type: 'error',
        text1: 'V2V Start Failed',
        text2: v2vAPIError,
        visibilityTime: 5000,
        primaryBtn: null,
        secondaryBtn: null,
      });
      // Clear the error after showing toast
      setV2vAPIError(null);
    }
  }, [v2vAPIError, setV2vAPIError]);

  return (
    <V2VContext.Provider
      value={{
        isV2VON,
        setIsV2VON,
        isV2VError,
        setIsV2VError,
        v2vAPIError,
        setV2vAPIError,
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
        activeSpeakerRef,
        prevSpeakerRef,
        translations,
        setTranslations,
        selectedVoice,
        setSelectedVoice,
        selectedTTS,
        setSelectedTTS,
        providerConfigs,
        setProviderConfigs,
        statsList,
        setStatsList,
        isV2VStatsModalOpen,
        setIsV2VStatsModalOpen,
        maxNonFinalTokensDurationMs,
        setMaxNonFinalTokensDurationMs,
        rtcSleepTimeMs,
        setRtcSleepTimeMs,
        useRestTTS,
        setUseRestTTS,
        selectedSTTModel,
        setSelectedSTTModel,
      }}>
      {children}
    </V2VContext.Provider>
  );
};

const useV2V = createHook(V2VContext);

const requestId = getUniqueID();

//disconnect V2V user from channel
export const disconnectV2VUser = async (channel, userId) => {
  logger.debug(
    LogSource.NetworkRest,
    'v2v',
    `Attempting to disconnect V2V Bot for user - ${userId}`,
    {
      requestId,
    },
  );

  try {
    const response = await fetch(`${V2V_URL}/disconnect_channel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
      },
      body: JSON.stringify({
        channel_name: channel,
        user_id: userId.toString(),
      }),
    });

    if (!response.ok) {
      logger.debug(
        LogSource.NetworkRest,
        'v2v',
        `Error disconnecting V2V Bot for user - ${userId}`,
        {
          status: response.status,
          statusText: response.statusText,
        },
      );
      return;
    }

    // Log successful disconnect
    logger.debug(
      LogSource.NetworkRest,
      'v2v',
      `Successfully disconnected V2V Bot for user- ${userId}`,
      {
        requestId,
      },
    );
  } catch (error) {
    logger.debug(
      LogSource.NetworkRest,
      'v2v',
      `Failed disconnecting V2V Bot for user - ${userId}`,
      {
        error,
        requestId,
      },
    );
  }
};

export {V2VProvider, useV2V};
