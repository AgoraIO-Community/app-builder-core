import {createHook} from 'customization-implementation';
import React from 'react';
import {LanguageType} from './utils';
import useSTTAPI, {STTAPIResponse} from './useSTTAPI';
import {useLocalUid} from '../../../agora-rn-uikit';
import {logger, LogSource} from '../../logger/AppBuilderLogger';
import events, {PersistanceLevel} from '../../rtm-events-api';
import {EventNames} from '../../rtm-events';
import useGetName from '../../utils/useGetName';

const generateBotUidForUser = (localUid: number): number => {
  return 900000000 + (localUid % 100000000);
};

type TranslationItem = {
  lang: string;
  text: string;
  isFinal: boolean;
};

export type LanguageTranslationConfig = {
  source: LanguageType[]; // 'en-US'
  targets: LanguageType[]; // ['zh-CN', 'ja-JP']
  autoPopulate?: boolean; // e.g. if auto-populated from others
};

type UserSTTBot = {
  botUid: string; // Unique per user
  ownerUid: string; // the user’s UID
  translationConfig: LanguageTranslationConfig;
  // isActive: boolean;
};

type CaptionViewMode = 'original-and-translated' | 'original';

export type TranscriptItem = {
  uid: string;
  time: number;
  text: string;
  translations?: TranslationItem[];
  // Stores which translation language was active when this transcript was created
  // This preserves historical context when users switch translation languages mid-meeting
  selectedTranslationLanguage?: string;
};

type CaptionObj = {
  [key: string]: {
    text: string;
    translations: TranslationItem[];
    lastUpdated: number;
  };
};

export const CaptionContext = React.createContext<{
  // for caption btn state
  isCaptionON: boolean;
  setIsCaptionON: React.Dispatch<React.SetStateAction<boolean>>;

  // for error state
  isSTTError: boolean;
  setIsSTTError: React.Dispatch<React.SetStateAction<boolean>>;

  // to check if stt is active in the call
  isSTTActive: boolean;
  setIsSTTActive: React.Dispatch<React.SetStateAction<boolean>>;

  // holds the language selection for stt (deprecated - use sttForm instead)
  // language: LanguageType[];
  // setLanguage: React.Dispatch<React.SetStateAction<LanguageType[]>>;

  translationConfig: LanguageTranslationConfig;
  setTranslationConfig: React.Dispatch<
    React.SetStateAction<LanguageTranslationConfig>
  >;

  viewMode: CaptionViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<CaptionViewMode>>;

  // Map of user → bot metadata
  userBotMap: Record<string, UserSTTBot>;
  setUserBotMap: React.Dispatch<
    React.SetStateAction<Record<string, UserSTTBot>>
  >;

  // holds meeting transcript
  meetingTranscript: TranscriptItem[];
  setMeetingTranscript: React.Dispatch<React.SetStateAction<TranscriptItem[]>>;

  // holds status of stt language change process
  isLangChangeInProgress: boolean;
  setIsLangChangeInProgress: React.Dispatch<React.SetStateAction<boolean>>;

  // holds status of translation language change process
  isTranslationChangeInProgress: boolean;
  setIsTranslationChangeInProgress: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  // holds live captions
  captionObj: CaptionObj;
  setCaptionObj: React.Dispatch<React.SetStateAction<CaptionObj>>;

  // holds status of StreamMessageCallback listener added (caption/transcript)
  isSTTListenerAdded: boolean;
  setIsSTTListenerAdded: React.Dispatch<React.SetStateAction<boolean>>;

  activeSpeakerRef: React.MutableRefObject<string>;
  prevSpeakerRef: React.MutableRefObject<string>;

  selectedTranslationLanguage: string;
  setSelectedTranslationLanguage: React.Dispatch<React.SetStateAction<string>>;
  // Ref for translation language - prevents stale closures in callbacks
  selectedTranslationLanguageRef: React.MutableRefObject<string>;

  // Stores spoken languages of all remote users (userUid -> spoken language)
  // Used to auto-populate target languages for new users
  remoteSpokenLanguages: Record<string, LanguageType>;
  setRemoteSpokenLanguages: React.Dispatch<
    React.SetStateAction<Record<string, LanguageType>>
  >;

  handleTranslateConfigChange: (
    inputTranslationConfig: LanguageTranslationConfig,
  ) => Promise<void>;
  startSTTBotSession: (
    newConfig: LanguageTranslationConfig,
  ) => Promise<STTAPIResponse>;
  updateSTTBotSession: (
    newConfig: LanguageTranslationConfig,
  ) => Promise<STTAPIResponse>;
  stopSTTBotSession: () => Promise<void>;

  // Helper function to get user UID from bot UID
  getBotOwnerUid: (botUid: string | number) => string | number;
  localBotUid: string | number;
}>({
  isCaptionON: false,
  setIsCaptionON: () => {},
  isSTTError: false,
  setIsSTTError: () => {},
  isSTTActive: false,
  setIsSTTActive: () => {},
  // language: ['en-US'],
  // setLanguage: () => {},
  translationConfig: {
    source: ['en-US'],
    targets: [],
  },
  setTranslationConfig: () => {},
  viewMode: 'original-and-translated',
  setViewMode: () => {},
  userBotMap: {},
  setUserBotMap: () => {},
  meetingTranscript: [],
  setMeetingTranscript: () => {},
  isLangChangeInProgress: false,
  setIsLangChangeInProgress: () => {},
  isTranslationChangeInProgress: false,
  setIsTranslationChangeInProgress: () => {},
  captionObj: {},
  setCaptionObj: () => {},
  isSTTListenerAdded: false,
  setIsSTTListenerAdded: () => {},
  activeSpeakerRef: {current: ''},
  prevSpeakerRef: {current: ''},
  selectedTranslationLanguage: '',
  setSelectedTranslationLanguage: () => {},
  selectedTranslationLanguageRef: {current: ''},
  remoteSpokenLanguages: {},
  setRemoteSpokenLanguages: () => {},
  handleTranslateConfigChange: async () => {},
  startSTTBotSession: async () => ({success: false}),
  updateSTTBotSession: async () => ({success: false}),
  stopSTTBotSession: async () => {},
  getBotOwnerUid: (botUid: string | number) => botUid,
  localBotUid: null,
});

interface CaptionProviderProps {
  callActive: boolean;
  children: React.ReactNode;
}

const CaptionProvider: React.FC<CaptionProviderProps> = ({
  callActive,
  children,
}) => {
  const [isSTTError, setIsSTTError] = React.useState<boolean>(false);
  const [isCaptionON, setIsCaptionON] = React.useState<boolean>(false);
  const [isSTTActive, setIsSTTActive] = React.useState<boolean>(false);
  // const [language, setLanguage] = React.useState<[LanguageType]>(['']);
  // console.log('[STT_PER_USER_BOT] supriya language: ', language);

  // STT Form state - contains agentId, source, and target languages
  const [translationConfig, setTranslationConfig] =
    React.useState<LanguageTranslationConfig>({
      source: ['en-US'],
      targets: [],
    });

  const [userBotMap, setUserBotMap] = React.useState<
    Record<string, UserSTTBot>
  >({});

  const [viewMode, setViewMode] = React.useState<CaptionViewMode>(
    'original-and-translated',
  );

  const [isLangChangeInProgress, setIsLangChangeInProgress] =
    React.useState<boolean>(false);
  const [isTranslationChangeInProgress, setIsTranslationChangeInProgress] =
    React.useState<boolean>(false);
  const [meetingTranscript, setMeetingTranscript] = React.useState<
    TranscriptItem[]
  >([]);
  const [captionObj, setCaptionObj] = React.useState<CaptionObj>({});
  console.log('[STT_PER_USER_BOT] captionObj: ', captionObj);
  const [isSTTListenerAdded, setIsSTTListenerAdded] =
    React.useState<boolean>(false);
  const [activeSpeakerUID, setActiveSpeakerUID] = React.useState<string>('');
  const [prevActiveSpeakerUID, setPrevActiveSpeakerUID] =
    React.useState<string>('');
  const [selectedTranslationLanguage, setSelectedTranslationLanguage] =
    React.useState<string>('');
  const [remoteSpokenLanguages, setRemoteSpokenLanguages] = React.useState<
    Record<string, LanguageType>
  >({});

  const activeSpeakerRef = React.useRef('');
  const prevSpeakerRef = React.useRef('');
  const selectedTranslationLanguageRef = React.useRef('');

  // Sync ref with state for selectedTranslationLanguage
  React.useEffect(() => {
    selectedTranslationLanguageRef.current = selectedTranslationLanguage;
  }, [selectedTranslationLanguage]);

  // Import STT API methods
  const {start, stop, update} = useSTTAPI();

  const localUid = useLocalUid();
  const username = useGetName();
  const [localBotUid, setLocalBotUid] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!localUid || !username) {
      return;
    } // wait for room info to be ready
    const uid = generateBotUidForUser(localUid);
    setLocalBotUid(uid);

    console.log(
      `[STT_BOT_INIT] Local user UID: ${localUid}, Generated bot UID: ${uid}`,
      '\n  → This bot will ONLY subscribe to local user audio (UID: ' +
        localUid +
        ')',
    );

    // Also set the initial entry in userBotMap (inactive by default)
    setUserBotMap(prev => ({
      ...prev,
      [localUid]: {
        botUid: uid,
        ownerUid: localUid,
      },
    }));

    // Broadcast bot UID mapping to all users in the call
    events.send(
      EventNames.STT_BOT_UID_MAPPING,
      JSON.stringify({
        userUid: localUid,
        botUid: uid,
        username: username,
      }),
      PersistanceLevel.Session,
    );
  }, [localUid, username]);

  // Listen for bot UID mappings from other users
  React.useEffect(() => {
    const handleBotUidMapping = (data: any) => {
      try {
        const payload = JSON.parse(data.payload);
        const {userUid, botUid, username} = payload;

        console.log(
          '[STT_PER_USER_BOT] Received bot mapping from user:',
          username,
          'userUid:',
          userUid,
          'botUid:',
          botUid,
        );

        // Update userBotMap with the received mapping
        setUserBotMap(prev => ({
          ...prev,
          [userUid]: {
            botUid: botUid,
            ownerUid: userUid,
          },
        }));
      } catch (error) {
        logger.error(
          LogSource.Internals,
          'STT',
          'Failed to parse STT_BOT_UID_MAPPING event',
          error,
        );
      }
    };

    events.on(EventNames.STT_BOT_UID_MAPPING, handleBotUidMapping);

    // Cleanup listener on unmount
    return () => {
      events.off(EventNames.STT_BOT_UID_MAPPING, handleBotUidMapping);
    };
  }, []);

  // Listen for spoken language updates from other users
  React.useEffect(() => {
    const handleSpokenLanguage = (data: any) => {
      try {
        const payload = JSON.parse(data.payload);
        const {userUid, spokenLanguage, username} = payload;

        console.log(
          '[STT_PER_USER_BOT] Received spoken language from user:',
          username,
          'userUid:',
          userUid,
          'spokenLanguage:',
          spokenLanguage,
        );

        // Update remoteSpokenLanguages with the user's spoken language
        setRemoteSpokenLanguages(prev => ({
          ...prev,
          [userUid]: spokenLanguage,
        }));
      } catch (error) {
        logger.error(
          LogSource.Internals,
          'STT',
          'Failed to parse STT_SPOKEN_LANGUAGE event',
          error,
        );
      }
    };

    events.on(EventNames.STT_SPOKEN_LANGUAGE, handleSpokenLanguage);

    // Cleanup listener on unmount
    return () => {
      events.off(EventNames.STT_SPOKEN_LANGUAGE, handleSpokenLanguage);
    };
  }, []);

  const hasConfigChanged = (
    prev: LanguageTranslationConfig,
    next: LanguageTranslationConfig,
  ) => {
    return (
      prev.source !== next.source ||
      prev.targets.sort().join(',') !== next.targets.sort().join(',')
    );
  };

  const startSTTBotSession = async (
    newConfig: LanguageTranslationConfig,
  ): Promise<STTAPIResponse> => {
    if (!localBotUid || !localUid) {
      console.warn('[STT] Missing localUid or botUid');
      return {
        success: false,
        error: {message: 'Missing localUid or botUid'},
      };
    }

    try {
      setIsLangChangeInProgress(true);
      const result = await start(localBotUid, newConfig);
      console.log('STT start result: ', result);

      if (result.success || result.error?.code === 610) {
        // Success or already started
        setIsSTTActive(true);
        setUserBotMap(prev => ({
          ...prev,
          [localUid]: {
            ...prev[localUid],
            translationConfig: newConfig,
          },
        }));
        setIsSTTError(false);

        // Add transcript entry for language change
        const actionText =
          translationConfig?.source.indexOf('') !== -1 ||
          translationConfig?.source.length === 0
            ? `has set the spoken language to "${newConfig.source[0]}"`
            : `changed the spoken language from "${translationConfig?.source[0]}" to "${newConfig.source[0]}"`;

        setTranslationConfig(newConfig);
        setMeetingTranscript(prev => [
          ...prev,
          {
            name: 'langUpdate',
            time: new Date().getTime(),
            uid: `langUpdate-${localUid}`,
            text: actionText,
          },
        ]);

        // Broadcast spoken language to all users
        events.send(
          EventNames.STT_SPOKEN_LANGUAGE,
          JSON.stringify({
            userUid: localUid,
            spokenLanguage: newConfig.source[0],
            username: username,
          }),
          PersistanceLevel.Session,
        );

        logger.log(
          LogSource.NetworkRest,
          'stt',
          'STT started successfully',
          result.data,
        );
      } else {
        setIsCaptionON(false);
        setIsSTTError(true);
        logger.error(
          LogSource.NetworkRest,
          'stt',
          'Failed to start STT',
          result.error,
        );
      }
      setIsLangChangeInProgress(false);
      return result;
    } catch (error) {
      setIsLangChangeInProgress(false);
      setIsSTTError(true);
      logger.error(LogSource.NetworkRest, 'stt', 'STT start error', error);
      return {
        success: false,
        error: {message: error?.message || 'Unknown error'},
      };
    }
  };

  const updateSTTBotSession = async (
    newConfig: LanguageTranslationConfig,
  ): Promise<STTAPIResponse> => {
    if (!localBotUid || !localUid) {
      console.warn('[STT] Missing localUid or botUid');
      return {
        success: false,
        error: {message: 'Missing localUid or botUid'},
      };
    }

    try {
      setIsLangChangeInProgress(true);
      const result = await update(localBotUid, newConfig);

      if (result.success) {
        setTranslationConfig(newConfig);
        setUserBotMap(prev => ({
          ...prev,
          [localUid]: {
            ...prev[localUid],
            translationConfig: newConfig,
          },
        }));
        setIsSTTError(false);

        // Broadcast updated spoken language to all users
        events.send(
          EventNames.STT_SPOKEN_LANGUAGE,
          JSON.stringify({
            userUid: localUid,
            spokenLanguage: newConfig.source[0],
            username: username,
          }),
          PersistanceLevel.Session,
        );

        logger.log(
          LogSource.NetworkRest,
          'stt',
          'STT updated successfully',
          result.data,
        );
      } else {
        setIsSTTError(true);
        logger.error(
          LogSource.NetworkRest,
          'stt',
          'Failed to update STT',
          result.error,
        );
      }
      setIsLangChangeInProgress(false);
      return result;
    } catch (error) {
      setIsLangChangeInProgress(false);
      setIsSTTError(true);
      logger.error(LogSource.NetworkRest, 'stt', 'STT update error', error);
      return {
        success: false,
        error: {message: error?.message || 'Unknown error'},
      };
    }
  };

  const handleTranslateConfigChange = async (
    inputTranslateConfig: LanguageTranslationConfig,
  ) => {
    if (!localBotUid || !localUid) {
      console.warn('[STT] Missing localUid or botUid');
      return;
    }

    const newConfig: LanguageTranslationConfig = {
      source: inputTranslateConfig?.source,
      targets: inputTranslateConfig?.targets,
    };

    let action: 'start' | 'update' = 'start';
    if (!isSTTActive) {
      action = 'start';
    } else if (hasConfigChanged(translationConfig, newConfig)) {
      action = 'update';
    }

    console.log('[STT_HANDLE_CONFIRM]', {action, localBotUid, newConfig});

    try {
      switch (action) {
        case 'start':
          await startSTTBotSession(newConfig);
          break;

        case 'update':
          await updateSTTBotSession(newConfig);
          break;

        default:
          console.warn('Unknown STT action');
      }
    } catch (error) {
      setIsSTTError(true);
      setIsLangChangeInProgress(false);
      logger.error(
        LogSource.NetworkRest,
        'stt',
        'Error in handleTranslateConfigChange',
        error,
      );
    }
  };

  const stopSTTBotSession = React.useCallback(async () => {
    console.log('[STT_PER_USER_BOT] stopCaption called');

    if (!localBotUid) {
      console.warn('[STT] Missing botUid');
      return;
    }

    try {
      const result = await stop(localBotUid);

      if (result.success) {
        // Set STT inactive locally
        setIsSTTActive(false);
        // Clear user's source language when stopping
        setTranslationConfig({
          source: ['en-US'],
          targets: [],
        });
        setIsCaptionON(false);
        setIsSTTError(false);

        logger.log(
          LogSource.NetworkRest,
          'stt',
          'STT stopped successfully',
          result.data,
        );
      } else {
        setIsSTTError(true);
        logger.error(
          LogSource.NetworkRest,
          'stt',
          'Failed to stop STT',
          result.error,
        );
      }
    } catch (error) {
      setIsSTTError(true);
      logger.error(
        LogSource.NetworkRest,
        'stt',
        'Error in stopSTTBotSession',
        error,
      );
      throw error;
    }
  }, [stop, localBotUid]);

  // Helper function to convert bot UID to user UID
  // Bot UIDs are in format: 900000000 + userUid
  // This function reverse-maps botUid → userUid using userBotMap
  const getBotOwnerUid = React.useCallback(
    (botUid: string | number): string | number => {
      const botUidStr = String(botUid);

      // Check if this is a special UID (langUpdate, translationUpdate, etc.)
      if (botUidStr.indexOf('Update') !== -1) {
        return botUid;
      }

      // Find the user that owns this bot
      for (const [userUid, botInfo] of Object.entries(userBotMap)) {
        if (String(botInfo.botUid) === botUidStr) {
          return userUid;
        }
      }

      // If not found in map, return the original (might be a regular user UID)
      return botUid;
    },
    [userBotMap],
  );

  return (
    <CaptionContext.Provider
      value={{
        isCaptionON,
        setIsCaptionON,
        isSTTError,
        setIsSTTError,
        isSTTActive,
        setIsSTTActive,
        translationConfig,
        setTranslationConfig,
        userBotMap,
        setUserBotMap,
        viewMode,
        setViewMode,
        meetingTranscript,
        setMeetingTranscript,
        isLangChangeInProgress,
        setIsLangChangeInProgress,
        isTranslationChangeInProgress,
        setIsTranslationChangeInProgress,
        captionObj,
        setCaptionObj,
        isSTTListenerAdded,
        setIsSTTListenerAdded,
        activeSpeakerRef,
        prevSpeakerRef,
        selectedTranslationLanguage,
        setSelectedTranslationLanguage,
        selectedTranslationLanguageRef,
        remoteSpokenLanguages,
        setRemoteSpokenLanguages,
        handleTranslateConfigChange,
        startSTTBotSession,
        updateSTTBotSession,
        stopSTTBotSession,
        getBotOwnerUid,
        localBotUid,
      }}>
      {children}
    </CaptionContext.Provider>
  );
};

const useCaption = createHook(CaptionContext);

export {CaptionProvider, useCaption};
