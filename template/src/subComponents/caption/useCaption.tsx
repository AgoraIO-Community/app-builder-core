import {createHook} from 'customization-implementation';
import React, {useContext} from 'react';
import {LanguageType, hasConfigChanged} from './utils';
import useSTTAPI, {STTAPIResponse} from './useSTTAPI';
import {useLocalUid} from '../../../agora-rn-uikit';
import {logger, LogSource} from '../../logger/AppBuilderLogger';
import events, {PersistanceLevel} from '../../rtm-events-api';
import {EventNames} from '../../rtm-events';
import useGetName from '../../utils/useGetName';
import Toast from '../../../react-native-toast-message';
import {useString} from '../../utils/useString';
import {
  sttStartError,
  sttUpdateError,
} from '../../language/default-labels/videoCallScreenLabels';
import chatContext from '../../components/ChatContext';

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

type CaptionViewMode = 'original-and-translated' | 'translated';

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
  // Ref for translation config - prevents stale closures in callbacks
  translationConfigRef: React.MutableRefObject<LanguageTranslationConfig>;

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
    source: [],
    targets: [],
  },
  setTranslationConfig: () => {},
  viewMode: 'translated',
  setViewMode: () => {},
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
  translationConfigRef: {current: {source: [], targets: []}},
  remoteSpokenLanguages: {},
  setRemoteSpokenLanguages: () => {},
  handleTranslateConfigChange: async () => {},
  startSTTBotSession: async () => ({success: false}),
  updateSTTBotSession: async () => ({success: false}),
  stopSTTBotSession: async () => {},
  getBotOwnerUid: (botUid: string | number) => botUid,
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
      source: [],
      targets: [],
    });

  const [viewMode, setViewMode] = React.useState<CaptionViewMode>('translated');

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
  const translationConfigRef = React.useRef<LanguageTranslationConfig>({
    source: [],
    targets: [],
  });

  // Sync ref with state for selectedTranslationLanguage
  React.useEffect(() => {
    selectedTranslationLanguageRef.current = selectedTranslationLanguage;
  }, [selectedTranslationLanguage]);

  // Sync ref with state for translationConfig
  React.useEffect(() => {
    translationConfigRef.current = translationConfig;
  }, [translationConfig]);

  // Import STT API methods
  const {start, stop, update} = useSTTAPI();

  const localUid = useLocalUid();
  const username = useGetName();
  const {hasUserJoinedRTM} = useContext(chatContext);

  const [localBotUid, setLocalBotUid] = React.useState<number | null>(null);

  // i18n labels for error toasts
  const startErrorLabel = useString(sttStartError)();
  const updateErrorLabel = useString(sttUpdateError)();

  React.useEffect(() => {
    if (!localUid || !username || !hasUserJoinedRTM) {
      return;
    } // wait for room info to be ready
    const uid = generateBotUidForUser(localUid);
    setLocalBotUid(uid);
  }, [localUid, username, hasUserJoinedRTM]);

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
        setIsSTTError(false);

        // Add transcript entry for language change
        // If STT was not active before, this is the first time setting the language
        const actionText = !isSTTActive
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
        // setIsCaptionON(false);
        setIsSTTError(true);
        logger.error(
          LogSource.NetworkRest,
          'stt',
          'Failed to start STT',
          result.error,
        );
        // Show error toast: text1 = translated label, text2 = API error
        Toast.show({
          leadingIconName: 'alert',
          type: 'error',
          text1: startErrorLabel,
          text2: result.error?.message || 'Unknown error occurred',
          visibilityTime: 4000,
        });
      }
      setIsLangChangeInProgress(false);
      return result;
    } catch (error) {
      setIsLangChangeInProgress(false);
      setIsSTTError(true);
      logger.error(LogSource.NetworkRest, 'stt', 'STT start error', error);
      // Show error toast: text1 = translated label, text2 = exception error
      Toast.show({
        leadingIconName: 'alert',
        type: 'error',
        text1: startErrorLabel,
        text2: error?.message || 'Unknown error occurred',
        visibilityTime: 4000,
      });
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
        setIsSTTError(false);

        // Add transcript entry for language change
        // Determine what actually changed
        const spokenLanguageChanged =
          translationConfig?.source[0] !== newConfig.source[0];
        const oldTargetsSorted = (translationConfig?.targets || [])
          .sort()
          .join(', ');
        const newTargetsSorted = (newConfig.targets || []).sort().join(', ');
        const targetsChanged = oldTargetsSorted !== newTargetsSorted;

        const oldTargetsLength = translationConfig?.targets?.length || 0;
        const newTargetsLength = newConfig.targets?.length || 0;
        const targetsWereDisabled =
          oldTargetsLength > 0 && newTargetsLength === 0;
        const targetsWereEnabled =
          oldTargetsLength === 0 && newTargetsLength > 0;

        // Build target message once
        let targetMessage = '';
        if (targetsChanged) {
          if (targetsWereDisabled) {
            targetMessage = 'stopped translations';
          } else if (targetsWereEnabled) {
            targetMessage = `enabled translations to "${newTargetsSorted}"`;
          } else {
            targetMessage = `changed target translation languages to "${newTargetsSorted}"`;
          }
        }

        // Build action text
        let actionText = '';
        if (spokenLanguageChanged && targetsChanged) {
          // Both spoken language and targets changed
          actionText = `changed spoken language from "${translationConfig?.source[0]}" to "${newConfig.source[0]}" and ${targetMessage}`;
        } else if (spokenLanguageChanged) {
          // Only spoken language changed
          actionText = `changed the spoken language from "${translationConfig?.source[0]}" to "${newConfig.source[0]}"`;
        } else if (targetsChanged) {
          // Only target languages changed
          actionText = targetMessage;
        }

        if (actionText) {
          setMeetingTranscript(prev => [
            ...prev,
            {
              name: 'langUpdate',
              uid: `langUpdate-${localUid}`,
              time: new Date().getTime(),
              text: actionText,
            },
          ]);
        }

        // Broadcast updated spoken language to all users (only if it changed)
        if (spokenLanguageChanged) {
          events.send(
            EventNames.STT_SPOKEN_LANGUAGE,
            JSON.stringify({
              userUid: localUid,
              spokenLanguage: newConfig.source[0],
              username: username,
            }),
            PersistanceLevel.Session,
          );
        }

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
        // Show error toast: text1 = translated label, text2 = API error
        Toast.show({
          leadingIconName: 'alert',
          type: 'error',
          text1: updateErrorLabel,
          text2: result.error?.message || 'Unknown error occurred',
          visibilityTime: 4000,
        });
      }
      setIsLangChangeInProgress(false);
      return result;
    } catch (error) {
      setIsLangChangeInProgress(false);
      setIsSTTError(true);
      logger.error(LogSource.NetworkRest, 'stt', 'STT update error', error);
      // Show error toast: text1 = translated label, text2 = exception error
      Toast.show({
        leadingIconName: 'alert',
        type: 'error',
        text1: updateErrorLabel,
        text2: error?.message || 'Unknown error occurred',
        visibilityTime: 4000,
      });
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

    console.log('[STT_HANDLE_CONFIRM]', {
      action,
      localBotUid,
      inputConfig: inputTranslateConfig,
      sanitizedConfig: newConfig,
    });

    try {
      switch (action) {
        case 'start':
          const startResult = await startSTTBotSession(newConfig);
          if (!startResult.success) {
            throw new Error(
              startResult.error?.message || 'Failed to start STT',
            );
          }
          break;

        case 'update':
          const updateResult = await updateSTTBotSession(newConfig);
          if (!updateResult.success) {
            throw new Error(
              updateResult.error?.message || 'Failed to update STT config',
            );
          }
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
      throw error;
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
          source: [],
          targets: [],
        });
        // setIsCaptionON(false);
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

  // Helper function to convert user UID to stt bot UID
  const generateBotUidForUser = (userLocalUid: number): number => {
    return 900000000 + (userLocalUid % 100000000);
  };

  // Helper function to convert bot UID to user UID
  // Bot UIDs are in format: 900000000 + userUid
  // This function reverse-maps botUid → userUid using mathematical calculation
  const getBotOwnerUid = React.useCallback(
    (botUid: string | number): string | number => {
      const botUidStr = String(botUid);

      // Check if this is a special UID (langUpdate, translationUpdate, etc.)
      if (botUidStr.indexOf('Update') !== -1) {
        return botUid;
      }

      // If it's a bot UID (starts with 900000000), extract the user UID
      const botUidNum = Number(botUid);
      if (!isNaN(botUidNum) && botUidNum >= 900000000) {
        return botUidNum - 900000000;
      }

      // Otherwise it's already a user UID, return as is
      return botUid;
    },
    [],
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
        translationConfigRef,
        remoteSpokenLanguages,
        setRemoteSpokenLanguages,
        handleTranslateConfigChange,
        startSTTBotSession,
        updateSTTBotSession,
        stopSTTBotSession,
        getBotOwnerUid,
      }}>
      {children}
    </CaptionContext.Provider>
  );
};

const useCaption = createHook(CaptionContext);

export {CaptionProvider, useCaption};
