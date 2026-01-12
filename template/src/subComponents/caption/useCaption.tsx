import {createHook} from 'customization-implementation';
import React, {useContext} from 'react';
import {LanguageType, getLanguageLabel} from './utils';
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
  sttSpokenLanguageToastHeading,
  sttSpokenLanguageToastSubHeading,
  sttSpokenLanguageToastSubHeadingDataInterface,
} from '../../language/default-labels/videoCallScreenLabels';
import chatContext from '../../components/ChatContext';
import {useRoomInfo} from '../../components/room-info/useRoomInfo';
import {useContent} from 'customization-api';

// Types
type GlobalSttState = {
  globalSttEnabled: boolean;
  globalSpokenLanguage: LanguageType;
  globalTranslationTargets: LanguageType[];
  initiatorName?: string;
};

type TargetChange = {
  prev: LanguageType | null;
  next: LanguageType | null;
  reason?: 'user' | 'spoken-language-changed' | 'auto-start';
};

type SttQueueItem = {
  state: GlobalSttState;
  isLocal: boolean;
  targetChange?: TargetChange;
};

export type LanguageTranslationConfig = {
  source: LanguageType[]; // ['en-US']
  targets: LanguageType[]; // ['zh-CN', 'ja-JP']
};

export type STTViewMode = 'original-and-translated' | 'translated';

type TranslationItem = {
  lang: string;
  text: string;
  isFinal: boolean;
};

export type TranscriptItem = {
  name: string;
  uid: string;
  time: number;
  text: string;
  translations?: TranslationItem[];
  // Stores which translation language was active when this transcript was created
  // This preserves historical context when users switch translation languages mid-meeting
  selectedTranslationLanguage?: LanguageType;
};

type CaptionObj = {
  [key: string]: {
    text: string;
    translations: TranslationItem[];
    lastUpdated: number;
  };
};

// helper
// (sorted) version of the target list.
const normalizeTargets = (arr: LanguageType[]) => [...(arr || [])].sort();

/**
 * This helpher compares the STT_GLOBAL_STATE
 * When a new user joins a call, they replay all previously persisted
 * STT_GLOBAL_STATE events sent by other participants, as STT_GLOBAL_STATE
 * is a session persistance event
 * Without this check, the joining user would:
 *   - run start/update api multiple times as it will read event
 *     from all users attributes
 */
const isSameState = (prev: GlobalSttState, next: GlobalSttState) => {
  return (
    prev.globalSttEnabled === next.globalSttEnabled &&
    prev.globalSpokenLanguage === next.globalSpokenLanguage &&
    JSON.stringify(normalizeTargets(prev.globalTranslationTargets)) ===
      JSON.stringify(normalizeTargets(next.globalTranslationTargets))
  );
};

export const CaptionContext = React.createContext<{
  // for caption btn state
  isCaptionON: boolean;
  setIsCaptionON: React.Dispatch<React.SetStateAction<boolean>>;

  // for error state
  isSTTError: boolean;
  setIsSTTError: React.Dispatch<React.SetStateAction<boolean>>;

  // to check if stt is active in the call :derived from globalSttState
  isSTTActive: boolean;

  // flag to check if STT dependencies are ready (all required data loaded)
  // Used to disable caption/transcript buttons until system is fully initialized
  sttDepsReady: boolean;

  // holds the language selection for stt (deprecated - use sttForm instead)
  // language: LanguageType[];
  // setLanguage: React.Dispatch<React.SetStateAction<LanguageType[]>>;

  globalSttState: GlobalSttState;
  confirmSpokenLanguageChange: (newLang: LanguageType) => Promise<void>;
  confirmTargetLanguageChange: (newTargetLang: LanguageType) => Promise<void>;

  captionViewMode: STTViewMode;
  setCaptionViewMode: React.Dispatch<React.SetStateAction<STTViewMode>>;

  transcriptViewMode: STTViewMode;
  setTranscriptViewMode: React.Dispatch<React.SetStateAction<STTViewMode>>;

  // holds meeting transcript
  meetingTranscript: TranscriptItem[];
  setMeetingTranscript: React.Dispatch<React.SetStateAction<TranscriptItem[]>>;

  // holds status of stt language change process
  isLangChangeInProgress: boolean;
  setIsLangChangeInProgress: React.Dispatch<React.SetStateAction<boolean>>;

  // holds live captions
  captionObj: CaptionObj;
  setCaptionObj: React.Dispatch<React.SetStateAction<CaptionObj>>;

  // holds status of StreamMessageCallback listener added (caption/transcript)
  isSTTListenerAdded: boolean;
  setIsSTTListenerAdded: React.Dispatch<React.SetStateAction<boolean>>;

  activeSpeakerRef: React.MutableRefObject<string>;
  prevSpeakerRef: React.MutableRefObject<string>;

  selectedTranslationLanguage: LanguageType;
  // Ref for translation language - prevents stale closures in callbacks
  selectedTranslationLanguageRef: React.MutableRefObject<LanguageType | null>;
  // Stores spoken languages of all remote users (userUid -> spoken language)
  // Used to auto-populate target languages for new users
  remoteSpokenLanguages: Record<string, LanguageType>;
  setRemoteSpokenLanguages: React.Dispatch<
    React.SetStateAction<Record<string, LanguageType>>
  >;

  startSTTBotSession: (
    newConfig: LanguageTranslationConfig,
  ) => Promise<STTAPIResponse>;
  updateSTTBotSession: (
    newConfig: LanguageTranslationConfig,
    isLocal: boolean,
    targetChange?: TargetChange,
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
  sttDepsReady: false,
  // language: ['en-US'],
  // setLanguage: () => {},
  captionViewMode: 'translated',
  setCaptionViewMode: () => {},
  transcriptViewMode: 'translated',
  setTranscriptViewMode: () => {},
  meetingTranscript: [],
  setMeetingTranscript: () => {},
  isLangChangeInProgress: false,
  setIsLangChangeInProgress: () => {},
  captionObj: {},
  setCaptionObj: () => {},
  isSTTListenerAdded: false,
  setIsSTTListenerAdded: () => {},
  activeSpeakerRef: {current: ''},
  prevSpeakerRef: {current: ''},
  selectedTranslationLanguage: '',
  selectedTranslationLanguageRef: {current: null},
  remoteSpokenLanguages: {},
  setRemoteSpokenLanguages: () => {},
  startSTTBotSession: async () => ({success: false}),
  updateSTTBotSession: async () => ({success: false}),
  stopSTTBotSession: async () => {},
  getBotOwnerUid: (botUid: string | number) => botUid,
  globalSttState: {
    globalSttEnabled: false,
    globalSpokenLanguage: '',
    globalTranslationTargets: [],
    initiatorName: '',
  },
  confirmSpokenLanguageChange: async () => {},
  confirmTargetLanguageChange: async () => {},
});

interface CaptionProviderProps {
  callActive: boolean;
  children: React.ReactNode;
}

const CaptionProvider: React.FC<CaptionProviderProps> = ({
  callActive,
  children,
}) => {
  const {
    data: {isHost, roomId},
  } = useRoomInfo();
  // Toast message
  const heading = useString<'Set' | 'Changed'>(sttSpokenLanguageToastHeading);
  const subheading = useString<sttSpokenLanguageToastSubHeadingDataInterface>(
    sttSpokenLanguageToastSubHeading,
  );

  const [isCaptionON, setIsCaptionON] = React.useState<boolean>(false);

  const [captionViewMode, setCaptionViewMode] =
    React.useState<STTViewMode>('translated');
  const [transcriptViewMode, setTranscriptViewMode] =
    React.useState<STTViewMode>('original-and-translated');

  const [isSTTError, setIsSTTError] = React.useState<boolean>(false);
  const [isLangChangeInProgress, setIsLangChangeInProgress] =
    React.useState<boolean>(false);

  const [captionObj, setCaptionObj] = React.useState<CaptionObj>({});
  const [meetingTranscript, setMeetingTranscript] = React.useState<
    TranscriptItem[]
  >([]);

  const [isSTTListenerAdded, setIsSTTListenerAdded] =
    React.useState<boolean>(false);
  const [activeSpeakerUID, setActiveSpeakerUID] = React.useState<string>('');
  const [prevActiveSpeakerUID, setPrevActiveSpeakerUID] =
    React.useState<string>('');
  const [remoteSpokenLanguages, setRemoteSpokenLanguages] = React.useState<
    Record<string, LanguageType>
  >({});

  // Default content
  const {defaultContent} = useContent();
  const defaultContentRef = React.useRef(defaultContent);
  React.useEffect(() => {
    defaultContentRef.current = defaultContent;
  }, [defaultContent]);

  // Active/prev speaker tracking (exposed as refs)
  const activeSpeakerRef = React.useRef('');
  const prevSpeakerRef = React.useRef('');

  // Global STT shared state
  const [globalSttState, setGlobalSttState] = React.useState<GlobalSttState>({
    globalSttEnabled: false,
    globalSpokenLanguage: '',
    globalTranslationTargets: [],
    initiatorName: '',
  });
  const globalSttStateRef = React.useRef(globalSttState);
  React.useEffect(() => {
    globalSttStateRef.current = globalSttState;
  }, [globalSttState]);

  // Queue for all stt operations
  const sttEventQueueRef = React.useRef<SttQueueItem[]>([]);
  const isProcessingSttEventRef = React.useRef(false);
  const hasFlushedSttQueueRef = React.useRef(false);

  // Selected Translated language
  const [selectedTranslationLanguage, setSelectedTranslationLanguage] =
    React.useState<LanguageType | null>(null);
  const selectedTranslationLanguageRef = React.useRef<LanguageType | null>(
    null,
  );
  React.useEffect(() => {
    selectedTranslationLanguageRef.current = selectedTranslationLanguage;
  }, [selectedTranslationLanguage]);

  const isSTTActive = globalSttState.globalSttEnabled;

  // STT API methods
  const {start, stop, update} = useSTTAPI();

  const localUid = useLocalUid();
  const username = useGetName();
  const {hasUserJoinedRTM} = useContext(chatContext);

  // Bot UID for this user
  const [localBotUid, setLocalBotUid] = React.useState<number | null>(null);
  const localBotUidRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    localBotUidRef.current = localBotUid;
  }, [localBotUid]);

  // Host flag
  const isHostRef = React.useRef(isHost);
  React.useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  // i18n labels for error toasts
  const startErrorLabel = useString(sttStartError)();
  const updateErrorLabel = useString(sttUpdateError)();

  // --- Derived readiness flag for STT ---
  const sttDepsReady =
    !!localUid &&
    !!localBotUid &&
    !!hasUserJoinedRTM &&
    !!callActive &&
    !!(roomId?.host || roomId?.attendee);

  const sttStartGuardRef = React.useRef(false);
  const sttAutoStartGuardRef = React.useRef(false);

  // STT dependencues
  const sttDepsReadyRef = React.useRef(false);
  React.useEffect(() => {
    sttDepsReadyRef.current = sttDepsReady;
  }, [sttDepsReady]);

  React.useEffect(() => {
    if (sttDepsReadyRef.current && !hasFlushedSttQueueRef.current) {
      hasFlushedSttQueueRef.current = true;

      let timeoutId;
      // Add delay if STT_AUTO_START is enabled,
      // The delay allows persisted STT_GLOBAL_STATE events to be processed first,
      // preventing second host from auto-starting when first host has already started STT
      if ($config.STT_AUTO_START) {
        timeoutId = setTimeout(() => {
          processSttEventQueue();
        }, 1000);
      } else {
        // No auto-start, process queue immediately
        processSttEventQueue();
      }

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }
    // When deps become ready → flush queue once
  }, [sttDepsReady]);

  // Helper: convert user UID -> bot UID
  const generateBotUidForUser = React.useCallback((userLocalUid: number) => {
    return 900000000 + (userLocalUid % 100000000);
  }, []);

  // Generate bot UID once deps are ready enough
  React.useEffect(() => {
    if (!localUid || !username || !hasUserJoinedRTM) {
      return;
    } // wait for room info to be ready
    const uid = generateBotUidForUser(localUid);
    setLocalBotUid(uid);
  }, [localUid, username, generateBotUidForUser, hasUserJoinedRTM]);

  const buildSttTranscriptForSourceChanged = (
    prevSpokenLang: LanguageType,
    newSpokenLang: LanguageType,
  ) => {
    const spokenLanguageChanged = prevSpokenLang !== newSpokenLang;
    if (!spokenLanguageChanged) {
      return null;
    }
    let message = '';
    // Spoken lang changed
    if (!prevSpokenLang) {
      // First time STT is enabled
      message = `Spoken language set to "${getLanguageLabel([newSpokenLang])}"`;
    } else {
      message = `Spoken language changed from "${getLanguageLabel([
        prevSpokenLang,
      ])}" to "${getLanguageLabel([newSpokenLang])}"`;
    }
    setMeetingTranscript(prev => [
      ...prev,
      {
        name: 'langUpdate',
        time: new Date().getTime(),
        uid: `langUpdate-${localUid}`,
        text: message,
      },
    ]);
  };

  const buildSttTranscriptForTargetChanged = (
    prevSelectedTargetLang: LanguageType | null,
    newSelectedTargetLang: LanguageType | null,
    reason?: TargetChange['reason'],
  ) => {
    const targetLanguageChanged =
      prevSelectedTargetLang !== newSelectedTargetLang;
    if (!targetLanguageChanged) {
      return null;
    }
    let message = '';

    if (reason === 'spoken-language-changed') {
      message = `Translation for "${getLanguageLabel([
        prevSelectedTargetLang,
      ])}" was turned off because the spoken language changed to ${getLanguageLabel(
        [prevSelectedTargetLang],
      )}`;
    }
    // Target lang changed
    // Case 1: User turned translation OFF
    else if (prevSelectedTargetLang && !newSelectedTargetLang) {
      message = 'Translation turned off';
    }
    // Case 2: User selected ANY new translation
    else {
      message = `Translation set to "${getLanguageLabel([
        newSelectedTargetLang,
      ])}"`;
    }
    setMeetingTranscript(prev => [
      ...prev,
      {
        name: 'translationUpdate',
        uid: `translationUpdate-${localUid}`,
        time: new Date().getTime(),
        text: message,
        selectedTranslationLanguage: newSelectedTargetLang,
      },
    ]);
  };

  const startSTTBotSession = async (
    newConfig: LanguageTranslationConfig,
  ): Promise<STTAPIResponse> => {
    try {
      setIsLangChangeInProgress(true);
      const result = await start(localBotUidRef.current, newConfig);
      console.log('[STT] start result: ', result);
      if (result.success || result.error?.code === 610) {
        // Success or already started
        setIsSTTError(false);
        logger.log(
          LogSource.NetworkRest,
          'stt',
          'STT started successfully',
          result.data,
        );
      } else {
        setIsSTTError(true);
        logger.error(
          LogSource.NetworkRest,
          'stt',
          'Failed to start STT',
          result.error,
        );
        Toast.show({
          leadingIconName: 'alert',
          type: 'error',
          text1: startErrorLabel,
          text2: result.error?.message || 'Unknown error occurred',
          visibilityTime: 4000,
          primaryBtn: null,
          secondaryBtn: null,
        });
      }
      setIsLangChangeInProgress(false);
      return result;
    } catch (error: any) {
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
        primaryBtn: null,
        secondaryBtn: null,
      });
      return {
        success: false,
        error: {message: error?.message || 'Unknown error'},
      };
    }
  };

  const updateSTTBotSession = async (
    newConfig: LanguageTranslationConfig,
    isLocal = false,
    targetChange?: TargetChange,
  ): Promise<STTAPIResponse> => {
    try {
      isLocal && setIsLangChangeInProgress(true);
      const result = await update(localBotUidRef.current, newConfig);
      if (result.success) {
        setIsSTTError(false);

        const oldSource = globalSttStateRef.current.globalSpokenLanguage;
        const newSource = newConfig.source[0];

        // Build transcript messages if source changed
        buildSttTranscriptForSourceChanged(oldSource, newSource);
        if (isLocal && targetChange) {
          buildSttTranscriptForTargetChanged(
            targetChange?.prev,
            targetChange?.next,
            targetChange?.reason,
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
          primaryBtn: null,
          secondaryBtn: null,
        });
      }
      setIsLangChangeInProgress(false);
      return result;
    } catch (error: any) {
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
        primaryBtn: null,
        secondaryBtn: null,
      });
      return {
        success: false,
        error: {message: error?.message || 'Unknown error'},
      };
    }
  };

  const stopSTTBotSession = React.useCallback(async () => {
    console.log('[STT] stopSTTBotSession called');

    if (!localBotUidRef.current) {
      console.warn('[STT] Missing botUid for stop');
      return;
    }

    try {
      const result = await stop(localBotUidRef.current);

      if (result.success) {
        // Set STT inactive locally
        // Clear user's source language when stopping
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
    }
  }, [stop]);

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

  // Spoken language handler
  const confirmSpokenLanguageChange = React.useCallback(
    async (newSpokenLang: LanguageType) => {
      try {
        const prevState = globalSttStateRef.current;
        const prevTargets = prevState.globalTranslationTargets || [];
        const prevSelectedTarget = selectedTranslationLanguageRef.current;

        // Remove spoken from targets
        const cleanedTargets = prevTargets.filter(t => t !== newSpokenLang);

        // Build update state
        const updatedState: GlobalSttState = {
          ...prevState,
          globalSttEnabled: true,
          globalSpokenLanguage: newSpokenLang,
          globalTranslationTargets: cleanedTargets,
          initiatorName: defaultContentRef?.current[localUid]?.name || username,
        };

        // Check if selected target still exists in target
        const isSelectedStillValid =
          prevSelectedTarget && cleanedTargets.includes(prevSelectedTarget);

        // Prepare the target change
        let targetChange: TargetChange;
        if (prevSelectedTarget) {
          if (isSelectedStillValid) {
            // target remains valid
            targetChange = {prev: prevSelectedTarget, next: prevSelectedTarget};
          } else {
            // target becomes invalid → must be turned OFF
            targetChange = {
              prev: prevSelectedTarget,
              next: null,
              reason: 'spoken-language-changed',
            };
          }
        }
        // Queue
        enqueueSttEvent(updatedState, true, targetChange);

        console.log(
          '[STT_GLOBAL] confirmSpokenLanguageChange sent STT_GLOBAL_STATE: ',
          updatedState,
        );
      } catch (error) {
        console.log('[STT_GLOBAL] confirmSpokenLanguageChange error: ', error);
      }
    },
    [localUid], // only real dependency
  );

  // Target language handler
  const confirmTargetLanguageChange = React.useCallback(
    async (newTargetLang: LanguageType) => {
      // 1. User selected "Off"
      const prevSelectedTargetLang = selectedTranslationLanguage;
      if (!newTargetLang) {
        buildSttTranscriptForTargetChanged(
          prevSelectedTargetLang,
          newTargetLang,
        );
        setSelectedTranslationLanguage(null);
        return;
      }
      // 2. User selected a translation language.
      // 3. Check if target is already included in global targets
      const alreadyInGlobal =
        globalSttStateRef.current.globalTranslationTargets.includes(
          newTargetLang,
        );
      if (alreadyInGlobal) {
        buildSttTranscriptForTargetChanged(
          prevSelectedTargetLang,
          newTargetLang,
        );
        setSelectedTranslationLanguage(newTargetLang);
        return;
      }
      // 4. Not in global targets, need to create updated state to pass to api
      const prevTargets = globalSttStateRef.current.globalTranslationTargets;
      const newTargets = Array.from(new Set([...prevTargets, newTargetLang]));

      const updatedState: GlobalSttState = {
        globalSttEnabled: globalSttStateRef.current.globalSttEnabled,
        globalSpokenLanguage: globalSttStateRef.current.globalSpokenLanguage,
        globalTranslationTargets: newTargets,
      };
      // 5. Queue event
      const prevTargetLang = selectedTranslationLanguageRef.current;
      enqueueSttEvent(updatedState, true, {
        prev: prevTargetLang,
        next: newTargetLang,
      });
    },
    [selectedTranslationLanguage], // only real state dependency
  );

  // Queues all local + remote stt events
  const enqueueSttEvent = React.useCallback(
    (state: GlobalSttState, isLocal: boolean, targetChange?: TargetChange) => {
      console.log(
        '[STT_GLOBAL] inside enqueueSttEvent - sttDepsReadyRef flag',
        sttDepsReadyRef.current,
      );
      sttEventQueueRef.current.push({
        state,
        isLocal,
        targetChange,
      });
      if (sttDepsReadyRef.current) {
        processSttEventQueue();
      }
    },
    [],
  );

  // Process stt events
  const processSttEventQueue = React.useCallback(async () => {
    // 1. Concurrent queue processing
    if (isProcessingSttEventRef.current) {
      return;
    }
    isProcessingSttEventRef.current = true;
    // 2. stt auto start check
    // If queue has events (e.g., Host A's persisted STT_GLOBAL_STATE when Host B joins),those events will be processed first, preventing duplicate auto-start
    if (
      $config.STT_AUTO_START &&
      sttDepsReadyRef.current &&
      !sttAutoStartGuardRef.current
    ) {
      if (
        isHostRef.current &&
        !globalSttStateRef.current.globalSttEnabled &&
        sttEventQueueRef.current.length === 0
      ) {
        console.log('[STT] AUTO_START  injecting auto start state');

        sttAutoStartGuardRef.current = true;

        const autoStartState: GlobalSttState = {
          globalSttEnabled: true,
          globalSpokenLanguage: 'en-US',
          globalTranslationTargets: [],
          initiatorName: defaultContentRef.current[localUid]?.name || username,
        };

        // adding auto start in the beginning of queue
        sttEventQueueRef.current.unshift({
          state: autoStartState,
          isLocal: true,
        });
      }
    }
    // 3. queue processing of all stt events
    while (sttEventQueueRef.current.length > 0) {
      const item = sttEventQueueRef.current.shift();
      if (!item) {
        break;
      }
      const {state: newState, isLocal, targetChange} = item;
      const prevState = globalSttStateRef.current;
      if (isSameState(prevState, newState)) {
        console.log('[STT] Skipped duplicate STT_GLOBAL_STATE');
        continue; // no call to processGlobalSttSingleEvent
      }
      const ok = await processGlobalSttSingleEvent(
        newState,
        isLocal,
        targetChange,
      );
      if (!ok) {
        console.warn('[STT] Skipping global state update because API failed.');
        continue;
      }
      // update global state AFTER processing
      setGlobalSttState(newState);
      globalSttStateRef.current = newState;
    }
    isProcessingSttEventRef.current = false;
  }, []);

  const processGlobalSttSingleEvent = React.useCallback(
    async (
      newState: GlobalSttState,
      isLocal: boolean,
      targetChange?: TargetChange,
    ) => {
      const prevState = globalSttStateRef.current;
      const wasEnabledBefore = prevState.globalSttEnabled;
      const isEnabledNow = newState.globalSttEnabled;

      const isStartOperation = !wasEnabledBefore && isEnabledNow;
      const isUpdateOperation = wasEnabledBefore && isEnabledNow;
      const isStopOperation = wasEnabledBefore && !isEnabledNow;
      try {
        if (isStartOperation) {
          console.log('[STT] Remote global STT -> starting session', newState);
          // Start guard starts
          if (sttStartGuardRef.current) {
            console.log('[STT] Start skipped (already started)');
            return;
          }
          sttStartGuardRef.current = true;
          // Start guard ends
          const result = await startSTTBotSession({
            source: [newState.globalSpokenLanguage],
            targets: newState.globalTranslationTargets,
          });
          if (!result.success) {
            return false;
          }
          buildSttTranscriptForSourceChanged(
            prevState.globalSpokenLanguage,
            newState.globalSpokenLanguage,
          );
          // Toast
          let spokenLangLabel =
            getLanguageLabel([newState?.globalSpokenLanguage]) || '';
          if (isLocal) {
            // I see this
            if (sttAutoStartGuardRef.current) {
              Toast.show({
                type: 'info',
                text1: heading('Set'),
                text2: `Live transcription are automatically enabled for this meeting in "${spokenLangLabel}"`,
                visibilityTime: 3000,
                primaryBtn: null,
                secondaryBtn: null,
              });
            } else {
              Toast.show({
                type: 'info',
                text1: heading('Set'),
                text2: subheading({
                  username: 'You',
                  action: 'Set',
                  newLanguage: spokenLangLabel,
                }),
                visibilityTime: 3000,
                primaryBtn: null,
                secondaryBtn: null,
              });
            }
          } else {
            // Remote users see this
            let subheadingObj: sttSpokenLanguageToastSubHeadingDataInterface = {
              username: newState?.initiatorName || 'Host',
              action: 'Set',
              newLanguage: getLanguageLabel([newState?.globalSpokenLanguage]),
            };
            Toast.show({
              type: 'info',
              text1: heading('Set'),
              text2: subheading(subheadingObj),
              visibilityTime: 3000,
              primaryBtn: null,
              secondaryBtn: null,
            });
          }

          if (isLocal) {
            events.send(
              EventNames.STT_GLOBAL_STATE,
              JSON.stringify(newState),
              PersistanceLevel.Session,
            );
          }
          return true;
        } else if (isUpdateOperation) {
          console.log('[STT] Global STT -> updating session', newState);
          const result = await updateSTTBotSession(
            {
              source: [newState.globalSpokenLanguage],
              targets: newState.globalTranslationTargets,
            },
            isLocal,
            targetChange ?? undefined,
          );
          if (!result.success) {
            return false;
          }
          if (
            prevState.globalSpokenLanguage !== newState.globalSpokenLanguage
          ) {
            let subheadingObj: sttSpokenLanguageToastSubHeadingDataInterface = {
              username: isLocal ? 'You' : newState.initiatorName || 'Host',
              action: 'Changed',
              newLanguage:
                getLanguageLabel([newState.globalSpokenLanguage]) || '',
              oldLanguage:
                getLanguageLabel([prevState.globalSpokenLanguage]) || '',
            };
            // text1: 'Spoken language updated',
            // text2: `Captions will now transcribe in ${getLanguageLabel(
            //     newConfig.source,
            // )}`,
            Toast.show({
              type: 'info',
              text1: heading('Changed'),
              text2: subheading(subheadingObj),
              // text2: `${subheading(
              //   subheadingObj,
              // )} \n Captions will now transcribe in ${
              //   getLanguageLabel(newConfig.source) || ''
              // }`,
              // text1: 'Spoken language updated',
              // text2: `Captions will now transcribe in ${getLanguageLabel(
              //   newConfig.source,
              // )}`,
              visibilityTime: 3000,
              primaryBtn: null,
              secondaryBtn: null,
            });
          }
          if (isLocal) {
            events.send(
              EventNames.STT_GLOBAL_STATE,
              JSON.stringify(newState),
              PersistanceLevel.Session,
            );
            setSelectedTranslationLanguage(targetChange?.next);
          } else {
            const currentSelectedTarget =
              selectedTranslationLanguageRef.current;
            if (
              currentSelectedTarget &&
              !newState.globalTranslationTargets.includes(currentSelectedTarget)
            ) {
              setSelectedTranslationLanguage(null);
            }
          }
          return true;
        } else if (isStopOperation) {
          console.log('[STT] Global STT -> stopping session', newState);
          await stopSTTBotSession();
          sttStartGuardRef.current = false;
          return true;
        }
        return true;
      } catch (error) {
        logger.error(
          LogSource.Internals,
          'STT',
          'Error handling STT_GLOBAL_STATE event',
          error,
        );
        return false;
      }
    },
    [],
  );

  // Handle GLOBAL STT events from others (simple "machine" + queue)
  React.useEffect(() => {
    const handleGlobalSTTChange = async (evt: any) => {
      const {payload} = evt || {};
      console.log('[STT] STT_GLOBAL_STATE event received: ', evt);
      let newState: GlobalSttState;
      try {
        newState = JSON.parse(payload);
      } catch (error) {
        logger.error(
          LogSource.Internals,
          'STT',
          'Failed to parse STT_GLOBAL_STATE event payload',
          error,
        );
        return;
      }
      enqueueSttEvent(newState, false);
    };

    events.on(EventNames.STT_GLOBAL_STATE, handleGlobalSTTChange);
    return () => events.off(EventNames.STT_GLOBAL_STATE, handleGlobalSTTChange);
  }, []);

  return (
    <CaptionContext.Provider
      value={{
        isCaptionON,
        setIsCaptionON,
        isSTTError,
        setIsSTTError,
        isSTTActive,
        sttDepsReady,
        globalSttState,
        confirmSpokenLanguageChange,
        confirmTargetLanguageChange,
        captionViewMode,
        setCaptionViewMode,
        transcriptViewMode,
        setTranscriptViewMode,
        meetingTranscript,
        setMeetingTranscript,
        isLangChangeInProgress,
        setIsLangChangeInProgress,
        captionObj,
        setCaptionObj,
        isSTTListenerAdded,
        setIsSTTListenerAdded,
        activeSpeakerRef,
        prevSpeakerRef,
        selectedTranslationLanguage,
        selectedTranslationLanguageRef,
        remoteSpokenLanguages,
        setRemoteSpokenLanguages,
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
