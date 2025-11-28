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
} from '../../language/default-labels/videoCallScreenLabels';
import chatContext from '../../components/ChatContext';
import {useRoomInfo} from '../../components/room-info/useRoomInfo';

type GlobalSttState = {
  globalSttEnabled: boolean;
  globalSpokenLanguage: LanguageType;
  globalTranslationTargets: LanguageType[];
};

type TranslationItem = {
  lang: string;
  text: string;
  isFinal: boolean;
};

export type LanguageTranslationConfig = {
  source: LanguageType[]; // ['en-US']
  targets: LanguageType[]; // ['zh-CN', 'ja-JP']
};

export type CaptionViewMode = 'original-and-translated' | 'translated';

export type TranscriptItem = {
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

type STTSessionState = 'idle' | 'starting' | 'active' | 'updating' | 'stopping';

export const CaptionContext = React.createContext<{
  // for caption btn state
  isCaptionON: boolean;
  setIsCaptionON: React.Dispatch<React.SetStateAction<boolean>>;

  // for error state
  isSTTError: boolean;
  setIsSTTError: React.Dispatch<React.SetStateAction<boolean>>;

  // to check if stt is active in the call :derived from globalSttState
  isSTTActive: boolean;

  // holds the language selection for stt (deprecated - use sttForm instead)
  // language: LanguageType[];
  // setLanguage: React.Dispatch<React.SetStateAction<LanguageType[]>>;

  globalSttState: GlobalSttState;
  confirmSpokenLanguageChange: (newLang: LanguageType) => Promise<void>;
  confirmTargetLanguageChange: (newTargetLang: LanguageType) => Promise<void>;

  captionViewMode: CaptionViewMode;
  setCaptionViewMode: React.Dispatch<React.SetStateAction<CaptionViewMode>>;

  transcriptViewMode: CaptionViewMode;
  setTranscriptViewMode: React.Dispatch<React.SetStateAction<CaptionViewMode>>;

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

  selectedTranslationLanguage: LanguageType;
  setSelectedTranslationLanguage: React.Dispatch<
    React.SetStateAction<LanguageType>
  >;
  // Ref for translation language - prevents stale closures in callbacks
  selectedTranslationLanguageRef: React.MutableRefObject<LanguageType>;
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
  startSTTBotSession: async () => ({success: false}),
  updateSTTBotSession: async () => ({success: false}),
  stopSTTBotSession: async () => {},
  getBotOwnerUid: (botUid: string | number) => botUid,
  globalSttState: {
    globalSttEnabled: false,
    globalSpokenLanguage: '',
    globalTranslationTargets: [],
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
    data: {roomId},
  } = useRoomInfo();

  const [isSTTError, setIsSTTError] = React.useState<boolean>(false);
  const [isCaptionON, setIsCaptionON] = React.useState<boolean>(false);
  // const [language, setLanguage] = React.useState<[LanguageType]>(['']);

  const [captionViewMode, setCaptionViewMode] =
    React.useState<CaptionViewMode>('translated');

  const [transcriptViewMode, setTranscriptViewMode] =
    React.useState<CaptionViewMode>('translated');

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
    React.useState<LanguageType>(null);
  const [remoteSpokenLanguages, setRemoteSpokenLanguages] = React.useState<
    Record<string, LanguageType>
  >({});

  // STT session state machine
  const [sttSessionState, setSttSessionState] =
    React.useState<STTSessionState>('idle');

  // Active/prev speaker tracking (exposed as refs)
  const activeSpeakerRef = React.useRef('');
  const prevSpeakerRef = React.useRef('');

  // Global STT shared state
  const [globalSttState, setGlobalSttState] = React.useState<GlobalSttState>({
    globalSttEnabled: false,
    globalSpokenLanguage: '',
    globalTranslationTargets: [],
  });

  const isSTTActive = globalSttState.globalSttEnabled;

  // Keep refs in sync with state
  const selectedTranslationLanguageRef = React.useRef('');
  React.useEffect(() => {
    selectedTranslationLanguageRef.current = selectedTranslationLanguage;
  }, [selectedTranslationLanguage]);

  const globalSttStateRef = React.useRef(globalSttState);
  React.useEffect(() => {
    globalSttStateRef.current = globalSttState;
  }, [globalSttState]);

  // STT API methods
  const {start, stop, update} = useSTTAPI();

  const localUid = useLocalUid();
  const username = useGetName();
  const {hasUserJoinedRTM} = useContext(chatContext);

  // Bot UID for this user
  const [localBotUid, setLocalBotUid] = React.useState<number | null>(null);

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

  // Queue of incoming global STT events received before stt is ready
  const pendingGlobalSttEventsRef = React.useRef<GlobalSttState[]>([]);

  // Generate bot UID once deps are ready enough
  React.useEffect(() => {
    if (!localUid || !username || !hasUserJoinedRTM) {
      return;
    } // wait for room info to be ready
    const uid = generateBotUidForUser(localUid);
    setLocalBotUid(uid);
  }, [localUid, username, hasUserJoinedRTM]);

  const startSTTBotSession = async (
    newConfig: LanguageTranslationConfig,
  ): Promise<STTAPIResponse> => {
    if (!sttDepsReady) {
      console.warn('[STT] startSTTBotSession called before STT deps ready', {
        localUid,
        localBotUid,
        hasUserJoinedRTM,
        callActive,
      });
      return {
        success: false,
        error: {message: 'STT not ready (missing UID/botUid/RTM/call)'},
      };
    }

    try {
      setIsLangChangeInProgress(true);
      setSttSessionState('starting');

      const result = await start(localBotUid, newConfig);
      console.log('[STT] start result: ', result);

      if (result.success || result.error?.code === 610) {
        // Success or already started
        setIsSTTError(false);
        setSttSessionState('active');

        const previousSource = globalSttStateRef?.current.globalSpokenLanguage;
        const isFirstStart = !isSTTActive;

        const actionText = isFirstStart
          ? `has set the spoken language to "${getLanguageLabel(
              newConfig.source,
            )}"`
          : `changed the spoken language from "${getLanguageLabel([
              globalSttStateRef?.current.globalSpokenLanguage,
            ])}" to "${getLanguageLabel(newConfig.source)}"`;

        setMeetingTranscript(prev => [
          ...prev,
          {
            name: 'langUpdate',
            time: new Date().getTime(),
            uid: `langUpdate-${localUid}`,
            text: actionText,
          } as any,
        ]);

        logger.log(
          LogSource.NetworkRest,
          'stt',
          'STT started successfully',
          result.data,
        );
      } else {
        setIsSTTError(true);
        setSttSessionState('idle');
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
        });
      }
      setIsLangChangeInProgress(false);
      return result;
    } catch (error: any) {
      setIsLangChangeInProgress(false);
      setIsSTTError(true);
      setSttSessionState('idle');
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
    if (!sttDepsReady) {
      console.warn('[STT] updateSTTBotSession called before STT deps ready', {
        localUid,
        localBotUid,
        hasUserJoinedRTM,
        callActive,
      });
      return {
        success: false,
        error: {message: 'STT not ready (missing UID/botUid/RTM/call)'},
      };
    }

    try {
      setIsLangChangeInProgress(true);
      setSttSessionState('updating');

      const result = await update(localBotUid, newConfig);

      if (result.success) {
        setIsSTTError(false);
        setSttSessionState('active');

        // Add transcript entry for language change
        // Determine what actually changed
        const spokenLanguageChanged =
          globalSttStateRef.current.globalSpokenLanguage !==
          newConfig.source[0];
        const oldTargetsSorted = (
          globalSttStateRef.current?.globalTranslationTargets || []
        )
          .sort()
          .map(lang => getLanguageLabel([lang]))
          .join(', ');
        const newTargetsSorted = (newConfig.targets || [])
          .sort()
          .map(lang => getLanguageLabel([lang]))
          .join(', ');
        const targetsChanged = oldTargetsSorted !== newTargetsSorted;

        const oldTargetsLength =
          globalSttStateRef.current?.globalTranslationTargets?.length || 0;
        const newTargetsLength = newConfig.targets?.length || 0;
        const targetsWereDisabled =
          oldTargetsLength > 0 && newTargetsLength === 0;
        const targetsWereEnabled =
          oldTargetsLength === 0 && newTargetsLength > 0;

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
          actionText = `changed spoken language from "${getLanguageLabel([
            globalSttStateRef.current?.globalSpokenLanguage,
          ])}" to "${getLanguageLabel(newConfig.source)}" and ${targetMessage}`;
        } else if (spokenLanguageChanged) {
          // Only spoken language changed
          actionText = `changed the spoken language from "${getLanguageLabel(
            globalSttStateRef.current?.globalTranslationTargets,
          )}" to "${getLanguageLabel(newConfig.source)}"`;
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
            } as any,
          ]);
        }

        logger.log(
          LogSource.NetworkRest,
          'stt',
          'STT updated successfully',
          result.data,
        );
      } else {
        setIsSTTError(true);
        setSttSessionState('active'); // logically still active but failed update
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
    } catch (error: any) {
      setIsLangChangeInProgress(false);
      setIsSTTError(true);
      setSttSessionState('active');
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

  const stopSTTBotSession = React.useCallback(async () => {
    console.log('[STT] stopSTTBotSession called');

    if (!localBotUid) {
      console.warn('[STT] Missing botUid for stop');
      return;
    }

    try {
      setSttSessionState('stopping');
      const result = await stop(localBotUid);

      if (result.success) {
        // Set STT inactive locally
        // Clear user's source language when stopping
        // setIsCaptionON(false);
        setIsSTTError(false);
        setSttSessionState('idle');

        logger.log(
          LogSource.NetworkRest,
          'stt',
          'STT stopped successfully',
          result.data,
        );
      } else {
        setIsSTTError(true);
        setSttSessionState('active'); // still active logically
        logger.error(
          LogSource.NetworkRest,
          'stt',
          'Failed to stop STT',
          result.error,
        );
      }
    } catch (error) {
      setIsSTTError(true);
      setSttSessionState('active');
      logger.error(
        LogSource.NetworkRest,
        'stt',
        'Error in stopSTTBotSession',
        error,
      );
      throw error;
    }
  }, [stop, localBotUid]);

  // Helper: convert user UID -> bot UID
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

  // --- STT session helpers (state machine-ish) ---
  // --- GLOBAL STT FLOW ---
  const confirmSpokenLanguageChange = async (newSpokenLang: LanguageType) => {
    const isFirstStart = !globalSttState.globalSttEnabled;
    console.log(
      '[STT] confirmSpokenLanguageChange isFirstStart: ',
      isFirstStart,
    );

    const updatedState: GlobalSttState = {
      globalSttEnabled: true,
      globalSpokenLanguage: newSpokenLang,
      globalTranslationTargets: globalSttState.globalTranslationTargets,
    };

    // Locally start/update immediately (we don't want to wait for RTM roundtrip)
    if (!sttDepsReady) {
      console.warn(
        '[STT] confirmSpokenLanguageChange called before STT deps ready',
        {localUid, localBotUid, hasUserJoinedRTM, callActive},
      );

      return;
    }

    try {
      if (isFirstStart) {
        await startSTTBotSession({
          source: [updatedState.globalSpokenLanguage],
          targets: [],
        });
      } else {
        await updateSTTBotSession({
          source: [updatedState.globalSpokenLanguage],
          targets: updatedState.globalTranslationTargets,
        });
      }
      // 2. Update state
      setGlobalSttState(updatedState);
      // 3. Broadcast
      events.send(
        EventNames.STT_GLOBAL_STATE,
        JSON.stringify(updatedState),
        PersistanceLevel.Session,
      );
      console.log('[STT] sent STT_GLOBAL_STATE: ', updatedState);
    } catch (error) {
      console.log('setting confirmSpokenLanguageChange error: ', error);
    }
  };

  const confirmTargetLanguageChange = async (newTargetLang: LanguageType) => {
    if (!globalSttStateRef.current.globalSttEnabled) {
      console.log('cannot update target as stt has not started yet');
    }
    console.log('[STT] confirmTargetLanguageChange: ', newTargetLang);
    const prevTargets = globalSttStateRef.current.globalTranslationTargets;
    const newTargets = Array.from(new Set([...prevTargets, newTargetLang]));

    const updatedState: GlobalSttState = {
      globalSttEnabled: globalSttStateRef.current.globalSttEnabled,
      globalSpokenLanguage: globalSttStateRef.current.globalSpokenLanguage,
      globalTranslationTargets: newTargets,
    };

    // Locally start/update immediately (we don't want to wait for RTM roundtrip)
    if (!sttDepsReady) {
      console.warn(
        '[STT] confirmSpokenLanguageChange called before STT deps ready',
        {localUid, localBotUid, hasUserJoinedRTM, callActive},
      );

      return;
    }

    try {
      await updateSTTBotSession({
        source: [updatedState.globalSpokenLanguage],
        targets: updatedState.globalTranslationTargets,
      });

      // 2. Update state
      setGlobalSttState(updatedState);
      // 3. Broadcast
      events.send(
        EventNames.STT_GLOBAL_STATE,
        JSON.stringify(updatedState),
        PersistanceLevel.Session,
      );
      console.log('[STT] sent STT_GLOBAL_STATE: ', updatedState);
    } catch (error) {
      console.log('setting confirmSpokenLanguageChange error: ', error);
    }
  };

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

      const prevState = globalSttStateRef.current;
      const wasEnabledBefore = prevState.globalSttEnabled;
      const isEnabledNow = newState.globalSttEnabled;

      // If not ready yet, queue this event
      if (!sttDepsReady) {
        console.log(
          '[STT] Not ready for STT, queueing STT_GLOBAL_STATE event',
          newState,
        );
        pendingGlobalSttEventsRef.current.push(newState);
        return;
      }

      try {
        if (!wasEnabledBefore && isEnabledNow) {
          console.log('[STT] Remote global STT -> starting session', newState);
          await startSTTBotSession({
            source: [newState.globalSpokenLanguage],
            targets: newState.globalTranslationTargets,
          });
        } else if (wasEnabledBefore && isEnabledNow) {
          console.log('[STT] Remote global STT -> updating session', newState);
          await updateSTTBotSession({
            source: [newState.globalSpokenLanguage],
            targets: newState.globalTranslationTargets,
          });
        } else if (wasEnabledBefore && !isEnabledNow) {
          console.log('[STT] Remote global STT -> stopping session', newState);
          await stopSTTBotSession();
        }
        setGlobalSttState(newState);
        globalSttStateRef.current = newState;
      } catch (error) {
        logger.error(
          LogSource.Internals,
          'STT',
          'Error handling STT_GLOBAL_STATE event',
          error,
        );
      }
    };

    events.on(EventNames.STT_GLOBAL_STATE, handleGlobalSTTChange);

    return () => {
      events.off(EventNames.STT_GLOBAL_STATE, handleGlobalSTTChange);
    };
  }, [sttDepsReady]);

  // Flush queued STT_GLOBAL_STATE events once deps become ready
  React.useEffect(() => {
    if (!sttDepsReady) {
      return;
    }
    if (!pendingGlobalSttEventsRef.current.length) {
      return;
    }

    console.log(
      '[STT] Flushing queued STT_GLOBAL_STATE events',
      pendingGlobalSttEventsRef.current,
    );

    (async () => {
      let prevState = globalSttStateRef.current;

      for (const newState of pendingGlobalSttEventsRef.current) {
        const wasEnabledBefore = prevState.globalSttEnabled;
        const isEnabledNow = newState.globalSttEnabled;

        try {
          if (!wasEnabledBefore && isEnabledNow) {
            await startSTTBotSession({
              source: [newState.globalSpokenLanguage],
              targets: newState.globalTranslationTargets,
            });
          } else if (wasEnabledBefore && isEnabledNow) {
            await updateSTTBotSession({
              source: [newState.globalSpokenLanguage],
              targets: newState.globalTranslationTargets,
            });
          } else if (wasEnabledBefore && !isEnabledNow) {
            await stopSTTBotSession();
          }
          setGlobalSttState(newState);
          globalSttStateRef.current = newState;
          prevState = newState;
        } catch (error) {
          logger.error(
            LogSource.Internals,
            'STT',
            'Error while flushing queued STT_GLOBAL_STATE events',
            error,
          );
        }
      }

      pendingGlobalSttEventsRef.current = [];
    })();
  }, [sttDepsReady]);

  return (
    <CaptionContext.Provider
      value={{
        isCaptionON,
        setIsCaptionON,
        isSTTError,
        setIsSTTError,
        isSTTActive,
        globalSttState,
        confirmSpokenLanguageChange,
        confirmTargetLanguageChange,
        translationConfig,
        captionViewMode,
        setCaptionViewMode,
        transcriptViewMode,
        setTranscriptViewMode,
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
