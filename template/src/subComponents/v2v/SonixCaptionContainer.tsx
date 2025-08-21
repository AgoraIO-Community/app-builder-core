// @ts-nocheck
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useRef, useState, useCallback} from 'react';
import ThemeConfig from '../../theme';
import {CAPTION_CONTAINER_HEIGHT} from '../../components/CommonStyles';
import {
  useRtc,
  useContent,
  useLocalUid,
  useCaption,
  useRoomInfo,
} from 'customization-api';
import PQueue from 'p-queue';
import {useV2V, disconnectV2VUser} from './useVoice2Voice';
import {V2V_URL} from './utils';
import Loading from '../Loading';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import TranslatorSelectedLanguagePopup from './TranslatorSelectedLanguagePopup';
import {
  LanguageType,
  rimeVoices,
  TTSType,
  RimeModelType,
  ElevenLabsModelType,
  STTModelType,
  ttsOptions,
  elevenLabsVoices,
  elevenLabsLangData,
  rimeLangData,
} from './utils';
import getUniqueID from '../../utils/getUniqueID';
import LocalEventEmitter, {
  LocalEventsEnum,
} from '../../rtm-events-api/LocalEvents';
import {logger, LogSource} from '../../logger/AppBuilderLogger';

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

type TranslatioinEntry = {
  uid: string;
  text: string;
  nonFinal?: string;
  time: number;
};

function getLangLabel(lang, tts) {
  const arr = tts === 'rime' ? rimeLangData : elevenLabsLangData;
  return arr.find(l => l.value === lang)?.label || lang;
}

const SonixCaptionContainer = () => {
  // All hooks must be at the top before any logic
  const [showTranslatorPopup, setShowTranslatorPopup] = useState(true);
  const {RtcEngineUnsafe} = useRtc();
  const {defaultContent, activeUids} = useContent();
  const localUid = useLocalUid();
  // Use providerConfigs and setProviderConfigs from context
  const {
    translations,
    setTranslations,
    isV2VActive,
    setIsV2VActive,
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
    setIsV2VON,
    selectedVoice,
    setSelectedVoice,
    selectedTTS,
    setSelectedTTS,
    providerConfigs,
    setProviderConfigs,
    statsList,
    setStatsList,
    maxNonFinalTokensDurationMs,
    setMaxNonFinalTokensDurationMs,
    rtcSleepTimeMs,
    setRtcSleepTimeMs,
    useRestTTS,
    setUseRestTTS,
    selectedSTTModel,
    setSelectedSTTModel,
  } = useV2V();

  // Handler to update providerConfigs and context
  const handleProviderConfigChange = (provider, field, value) => {
    setProviderConfigs(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value,
      },
    }));
    if (selectedTTS === provider) {
      if (field === 'sourceLang') setSourceLang(value);
      if (field === 'targetLang') setTargetLang(value);
      if (field === 'voice') setSelectedVoice(value);
    }
  };

  const handleSetSelectedTTS = tts => {
    setSelectedTTS(tts);
    const config = providerConfigs[tts] || {};
    setSourceLang(config.sourceLang);
    setTargetLang(config.targetLang);
    setSelectedVoice(config.voice);
  };

  const scrollRef = React.useRef<ScrollView>(null);
  const queueRef = React.useRef(new PQueue({concurrency: 1}));
  const [autoScroll, setAutoScroll] = useState(true);
  const [progressUid, setProgressUid] = useState<string | null>(null);
  const [pendingTTSUid, setPendingTTSUid] = useState<string | null>(null);

  // in-progress captions per speaker and language pair
  const activeCaptionsRef = useRef<
    Record<
      string,
      {
        uid: string;
        srcText: string;
        tgtText: string;
        srcNonFinal?: string;
        tgtNonFinal?: string;
        time: number;
        sourceLang: string;
        targetLang: string;
      }
    >
  >({});

  // Helper to get the composite key for active captions
  function getActiveCaptionKey(uid, sourceLang, targetLang) {
    return `${uid}__${sourceLang}__${targetLang}`;
  }
  const {
    data: {channel},
  } = useRoomInfo();

  const engine = RtcEngineUnsafe;
  // No need for displayFeed or mergedFeed, use translations from context directly

  useEffect(() => {
    return () => {
      // On unmount, disconnect user from V2V
      disconnectV2VUser(channel, localUid);
      RtcEngineUnsafe.setV2VActive(false);
    };
  }, [channel, localUid]);

  useEffect(() => {
    // setSourceLang('en');
    // setTargetLang('es');
    setIsV2VActive(false);
  }, []);

  useEffect(() => {
    if (showTranslatorPopup) {
      // Clear out filters by default when popup is shown
      setProviderConfigs(prev => ({
        ...prev,
        rime: {
          ...prev.rime,
          sourceLang: '',
          targetLang: '',
        },
        eleven_labs: {
          ...prev.eleven_labs,
          sourceLang: '',
          targetLang: '',
        },
      }));
    }
  }, [showTranslatorPopup, setProviderConfigs]);

  const sonixCaptionCallback = useCallback(
    (botID, payload) => {
      const queueCallback = () => {
        try {
          const srcLangugae = providerConfigs[selectedTTS].sourceLang;
          const jsonString = new TextDecoder().decode(payload);
          const data = JSON.parse(jsonString);
          console.log('Bot ID', botID, '*v2v*-stream-decoded', data);

          // Loader logic for NOTIFY events
          if (data.type === 'NOTIFY' && data.payload) {
            const event = data.payload.event;
            const uid = data.payload.uid;
            if (event === 'BEGIN_TTS') {
              setPendingTTSUid(null);
            }
          }

          // Progress bar logic for NOTIFY events
          if (data.type === 'NOTIFY' && data.payload) {
            const event = data.payload.event;
            const uid = data.payload.uid;
            if (event === 'FIRST_TTS') {
              // setProgressUid(uid);
            }
          }
          if (data.type === 'TEXT' && data.payload) {
            const textData = data.payload;
            const uid = textData.user_id;
            const srcLang = textData.src_lang?.[0] || 'en';
          }

          // Progress bar logic for STATS event
          if (data.type === 'STATS' && data.payload) {
            //  setProgressUid(null);
            // Remove totalTokenTime and sttTokenTime from statsList
            setStatsList(prev => [
              ...prev,
              {
                ...data.payload,
                maxNonFinalTokensDurationMs,
                selectedTTS,
                ttsModel:
                  selectedTTS === 'rime'
                    ? providerConfigs.rime.model
                    : providerConfigs.eleven_labs.model,
                sttModel: selectedSTTModel,
                useRestTTS,
              },
            ]);
          }

          if (data.type !== 'TEXT') return;
          const textData = data.payload;

          // Safely extract both source and target language texts
          const srcObj = textData[sourceLang] || {};
          const tgtObj = textData[targetLang] || {};
          const srcText = srcObj.final_text || '';
          const srcNonFinal = srcObj.non_final_text || '';
          const tgtText = (tgtObj.final_text || '').replace(/<end>/g, '\n');
          const tgtNonFinal = tgtObj.non_final_text || '';
          const uid = textData.user_id;
          const key = getActiveCaptionKey(uid, sourceLang, targetLang);

          // Show loader on first non-final text
          if ((srcNonFinal || tgtNonFinal) && !pendingTTSUid) {
            setPendingTTSUid(uid);
          }

          // Only highlight when target language's final_text is present
          if (uid && tgtText) {
            const words = tgtText.split(/\s+/).length;
            const durationMs = Math.max(1500, words * 500); // 0.5s per word, min 1.5s

            LocalEventEmitter.emit(
              LocalEventsEnum.ACTIVE_SPEAKER,
              Number('9' + uid.toString().slice(1)),
            );
            setTimeout(() => {
              LocalEventEmitter.emit(LocalEventsEnum.ACTIVE_SPEAKER, undefined);
            }, durationMs);
          }

          if (!srcText && !srcNonFinal && !tgtText && !tgtNonFinal) return;

          let active = activeCaptionsRef.current[key] || {
            uid,
            srcText: '',
            srcNonFinal: '',
            tgtText: '',
            tgtNonFinal: '',
            time: Date.now(),
            sourceLang,
            targetLang,
          };

          // Update finalized text
          if (srcText || tgtText) {
            setTranslations(prev => {
              const last = prev[prev.length - 1];
              if (
                last &&
                last.uid === uid &&
                last.sourceLang === sourceLang &&
                last.targetLang === targetLang
              ) {
                // merge/accumulate
                const accumulatedSrcText = `${last.srcText || ''}${srcText}`;
                const accumulatedTgtText = `${last.tgtText || ''}${tgtText}`;
                return [
                  ...prev.slice(0, -1),
                  {
                    ...last,
                    srcText: accumulatedSrcText.replace(/([.?!])\s+/g, '$1\n'),
                    tgtText: accumulatedTgtText,
                    time: Date.now(),
                    sourceLang,
                    targetLang,
                  },
                ];
              } else {
                // push new
                return [
                  ...prev,
                  {
                    uid,
                    srcText: srcText.replace(/([.?!])\s+/g, '$1\n'),
                    tgtText: tgtText,
                    time: Date.now(),
                    sourceLang,
                    targetLang,
                  },
                ];
              }
            });
          }

          // Always update nonFinal
          active.srcNonFinal = srcNonFinal;
          active.tgtNonFinal = tgtNonFinal;
          active.time = Date.now();

          if (srcNonFinal || tgtNonFinal) {
            activeCaptionsRef.current[key] = active;
            setTranslations(prev => [...prev]);
          } else {
            delete activeCaptionsRef.current[key];
          }
        } catch (err) {
          console.error('Error parsing stream message:', err);
        }
      };

      queueRef.current.add(queueCallback);
    },
    [setTranslations, sourceLang, targetLang, selectedTTS, providerConfigs],
  );

  useEffect(() => {
    if (showTranslatorPopup) {
      return;
    }

    const eventName = 'onSonioxStreamMessage';
    // Always remove previous listener before adding a new one
    RtcEngineUnsafe.removeListener(eventName, sonixCaptionCallback);
    RtcEngineUnsafe.addListener(eventName, sonixCaptionCallback);

    const createBot = async () => {
      try {
        engine.selfSonioxBotID = ''; //Number('9' + localUid.toString().slice(1));
        let body: any = {
          channel_name: channel,
          user_id: localUid.toString(),
          language_hints: [sourceLang],
          tts_speaker: selectedVoice,
          tts_provider: selectedTTS,
          max_non_final_tokens_duration_ms: maxNonFinalTokensDurationMs,
          rtc_sleep_time_ms: rtcSleepTimeMs,
          soniox_model: selectedSTTModel,
        };

        // Add rime_model only when Rime TTS is selected:temp fix remove once be chanegs
        if (selectedTTS === 'rime') {
          body.rime_model = providerConfigs.rime.model;
        }

        // Logic for use_rest_tts parameter
        if (selectedTTS === 'eleven_labs') {
          body.use_rest_tts = useRestTTS;
          body.eleven_labs_model = providerConfigs.eleven_labs.model;
        } else if (
          selectedTTS === 'rime' &&
          providerConfigs.rime.model === 'arcana'
        ) {
          body.use_rest_tts = true; // Always true for Rime Arcana
        } else if (
          selectedTTS === 'rime' &&
          providerConfigs.rime.model === 'mistv2'
        ) {
          body.use_rest_tts = useRestTTS;
        }

        if (sourceLang !== targetLang) {
          body.source_lang = [targetLang === 'en' ? '*' : sourceLang];
          body.target_lang = targetLang;
        } else {
          body.source_lang = [sourceLang];
          body.target_lang = targetLang;
        }
        const requestId = getUniqueID();

        //Logs before making request
        logger.debug(
          LogSource.NetworkRest,
          'v2v',
          `Attempting to create V2V bot for user ${defaultContent[localUid].name} - ${localUid}`,
          {
            requestId,
            body,
          },
        );

        const response = await fetch(`${V2V_URL}/create_bot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-Id': requestId,
          },
          body: JSON.stringify(body),
        });

        // Logs all status (4xx , 5xx)
        if (!response.ok) {
          logger.debug(
            LogSource.NetworkRest,
            'v2v',
            `Failed to create V2V bot for user ${defaultContent[localUid].name} - ${localUid}`,
            {
              status: response.status,
              statusText: response.statusText,
              requestId,
              userId: localUid,
            },
          );
        }

        if (response.status === 200) {
          const data = await response.json();
          RtcEngineUnsafe.setV2VActive(true);
          setIsV2VActive(true);
          // Logs successful result
          logger.debug(
            LogSource.NetworkRest,
            'v2v',
            `Successfully created V2V bot for user ${defaultContent[localUid].name} - ${localUid}`,
            {
              responseData: data,
              requestId,
            },
          );
        }
      } catch (error) {
        console.error('Error creating bot:', error);
        logger.debug(
          LogSource.NetworkRest,
          'v2v',
          `Error Creating V2V Bot for user ${defaultContent[localUid].name} - ${localUid} `,
          {
            error,
            requestId,
          },
        );
      }
    };
    createBot();
    // Cleanup: remove the listener on unmount or when callback changes
    return () => {
      RtcEngineUnsafe.removeListener(eventName, sonixCaptionCallback);
    };
  }, [
    showTranslatorPopup,
    sonixCaptionCallback,
    engine,
    sourceLang,
    targetLang,
    channel,
    localUid,
    setIsV2VActive,
    RtcEngineUnsafe,
    maxNonFinalTokensDurationMs,
    rtcSleepTimeMs,
    useRestTTS,
    selectedSTTModel,
  ]);

  if (showTranslatorPopup) {
    const handleConfirm = () => {
      // Save the current popup selections to context
      const config =
        providerConfigs[selectedTTS] || providerConfigs['rime'] || {};
      setSourceLang(config.sourceLang);
      setTargetLang(config.targetLang);
      setSelectedVoice(config.voice);
      activeCaptionsRef.current = {}; // Clear in-progress captions when language pair changes
      setShowTranslatorPopup(false);
    };
    // Get current provider config for popup fields
    const currentConfig =
      providerConfigs[selectedTTS] || providerConfigs['rime'] || {};
    return (
      <TranslatorSelectedLanguagePopup
        modalVisible={showTranslatorPopup}
        setModalVisible={setShowTranslatorPopup}
        sourceLang={currentConfig.sourceLang}
        setSourceLang={val =>
          handleProviderConfigChange(selectedTTS, 'sourceLang', val)
        }
        targetLang={currentConfig.targetLang}
        setTargetLang={val =>
          handleProviderConfigChange(selectedTTS, 'targetLang', val)
        }
        onConfirm={handleConfirm}
        onCancel={() => setIsV2VON(false)}
        voices={selectedTTS === 'rime' ? rimeVoices : elevenLabsVoices}
        selectedVoice={currentConfig.voice}
        setSelectedVoice={val =>
          handleProviderConfigChange(selectedTTS, 'voice', val)
        }
        selectedTTS={selectedTTS}
        setSelectedTTS={handleSetSelectedTTS}
        // The following are not needed anymore, but kept for compatibility
        rimeSourceLang={providerConfigs.rime.sourceLang}
        setRimeSourceLang={val =>
          handleProviderConfigChange('rime', 'sourceLang', val)
        }
        rimeTargetLang={providerConfigs.rime.targetLang}
        setRimeTargetLang={val =>
          handleProviderConfigChange('rime', 'targetLang', val)
        }
        rimeSelectedVoice={providerConfigs.rime.voice}
        setRimeSelectedVoice={val =>
          handleProviderConfigChange('rime', 'voice', val)
        }
        rimeSelectedModel={providerConfigs.rime.model}
        setRimeSelectedModel={val =>
          handleProviderConfigChange('rime', 'model', val)
        }
        elevenLabsSourceLang={providerConfigs.eleven_labs.sourceLang}
        setElevenLabsSourceLang={val =>
          handleProviderConfigChange('eleven_labs', 'sourceLang', val)
        }
        elevenLabsTargetLang={providerConfigs.eleven_labs.targetLang}
        setElevenLabsTargetLang={val =>
          handleProviderConfigChange('eleven_labs', 'targetLang', val)
        }
        elevenLabsSelectedVoice={providerConfigs.eleven_labs.voice}
        setElevenLabsSelectedVoice={val =>
          handleProviderConfigChange('eleven_labs', 'voice', val)
        }
        elevenLabsSelectedModel={providerConfigs.eleven_labs.model}
        setElevenLabsSelectedModel={val =>
          handleProviderConfigChange('eleven_labs', 'model', val)
        }
        maxNonFinalTokensDurationMs={maxNonFinalTokensDurationMs}
        setMaxNonFinalTokensDurationMs={setMaxNonFinalTokensDurationMs}
        rtcSleepTimeMs={rtcSleepTimeMs}
        setRtcSleepTimeMs={setRtcSleepTimeMs}
        useRestTTS={useRestTTS}
        setUseRestTTS={setUseRestTTS}
        selectedSTTModel={selectedSTTModel}
        setSelectedSTTModel={setSelectedSTTModel}
      />
    );
  }

  const handleScroll = event => {
    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    setAutoScroll(isAtBottom);
  };

  return (
    <View style={styles.outerContainer}>
      {/* Loader spinner in top-right corner for pending TTS */}
      {pendingTTSUid && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="small" color="skyblue" />
          <Text style={styles.progressText}>
            Preparing translation (
            {defaultContent[pendingTTSUid]?.name || pendingTTSUid})
          </Text>
        </View>
      )}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.container}
        ref={scrollRef}
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={() => {
          if (autoScroll) {
            scrollRef.current?.scrollToEnd({animated: true});
          }
        }}>
        {/* Progress spinner in top-right corner */}
        {progressUid && (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="small" color="skyblue" />
            <Text style={styles.progressText}>
              Translating ({defaultContent[progressUid]?.name || progressUid})
            </Text>
          </View>
        )}
        {!isV2VActive ? (
          <Loading
            text={'Setting up Translation...'}
            background="transparent"
            indicatorColor={$config.FONT_COLOR + hexadecimalTransparency['70%']}
            textColor={$config.FONT_COLOR + hexadecimalTransparency['70%']}
          />
        ) : (
          <>
            {translations.map((entry, index, arr) => {
              // Only show nonFinal for the last line of this user and language pair
              const isLastForUserLangPair =
                arr.findLastIndex(
                  e =>
                    e.uid === entry.uid &&
                    e.sourceLang === entry.sourceLang &&
                    e.targetLang === entry.targetLang,
                ) === index;
              const key = getActiveCaptionKey(
                entry.uid,
                entry.sourceLang,
                entry.targetLang,
              );
              const liveSrc = isLastForUserLangPair
                ? activeCaptionsRef.current[key]?.srcNonFinal
                : null;
              const liveTgt = isLastForUserLangPair
                ? activeCaptionsRef.current[key]?.tgtNonFinal
                : null;
              return (
                <View
                  key={`caption-${index}`}
                  style={styles.captionLineContainer}>
                  <Text style={styles.uid}>
                    {defaultContent[entry.uid]?.name} ({formatTime(entry.time)}
                    ): {getLangLabel(entry.sourceLang, selectedTTS)} →{' '}
                    {getLangLabel(entry.targetLang, selectedTTS)}
                  </Text>
                  {entry.sourceLang === entry.targetLang ? (
                    entry.srcText && (
                      <View style={styles.singleLanguageContainer}>
                        <View style={styles.languageBadge}>
                          <Text style={styles.languageBadgeText}>
                            {getLangLabel(entry.sourceLang, selectedTTS)}
                          </Text>
                        </View>
                        <Text style={styles.content}>
                          {entry.srcText}
                          {liveSrc ? (
                            <Text style={styles.live}> {liveSrc}</Text>
                          ) : null}
                        </Text>
                      </View>
                    )
                  ) : (
                    <View style={styles.sideBySideContainer}>
                      {entry.srcText && (
                        <View style={styles.languageColumn}>
                          <View style={styles.languageBadge}>
                            <Text style={styles.languageBadgeText}>
                              {getLangLabel(entry.sourceLang, selectedTTS)}
                            </Text>
                          </View>
                          <Text style={styles.content}>
                            {entry.srcText}
                            {liveSrc ? (
                              <Text style={styles.live}> {liveSrc}</Text>
                            ) : null}
                          </Text>
                        </View>
                      )}
                      {entry.tgtText && (
                        <View style={styles.languageColumn}>
                          <View style={styles.languageBadge}>
                            <Text style={styles.languageBadgeText}>
                              {getLangLabel(entry.targetLang, selectedTTS)}
                            </Text>
                          </View>
                          <Text style={styles.content}>
                            {entry.tgtText}
                            {liveTgt ? (
                              <Text style={styles.live}> {liveTgt}</Text>
                            ) : null}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
            {Object.values(activeCaptionsRef.current)
              .filter(
                active =>
                  !translations.some(
                    t =>
                      t.uid === active.uid &&
                      t.sourceLang === active.sourceLang &&
                      t.targetLang === active.targetLang,
                  ) &&
                  (active.srcNonFinal || active.tgtNonFinal),
              )
              .map((entry, index) => (
                <View
                  key={`nonfinal-only-${index}`}
                  style={styles.captionLineContainer}>
                  <Text style={styles.uid}>
                    {defaultContent[entry.uid]?.name} ({formatTime(entry.time)}
                    ): {getLangLabel(entry.sourceLang, selectedTTS)} →{' '}
                    {getLangLabel(entry.targetLang, selectedTTS)}
                  </Text>
                  {entry.sourceLang === entry.targetLang ? (
                    entry.srcNonFinal && (
                      <View style={styles.singleLanguageContainer}>
                        <View style={styles.languageBadge}>
                          <Text style={styles.languageBadgeText}>
                            {getLangLabel(entry.sourceLang, selectedTTS)}
                          </Text>
                        </View>
                        <Text style={styles.live}>{entry.srcNonFinal}</Text>
                      </View>
                    )
                  ) : (
                    <View style={styles.sideBySideContainer}>
                      {entry.srcNonFinal && (
                        <View style={styles.languageColumn}>
                          <View style={styles.languageBadge}>
                            <Text style={styles.languageBadgeText}>
                              {getLangLabel(entry.sourceLang, selectedTTS)}
                            </Text>
                          </View>
                          <Text style={styles.live}>{entry.srcNonFinal}</Text>
                        </View>
                      )}
                      {entry.tgtNonFinal && (
                        <View style={styles.languageColumn}>
                          <View style={styles.languageBadge}>
                            <Text style={styles.languageBadgeText}>
                              {getLangLabel(entry.targetLang, selectedTTS)}
                            </Text>
                          </View>
                          <Text style={styles.live}>{entry.tgtNonFinal}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default SonixCaptionContainer;

const styles = StyleSheet.create({
  outerContainer: {
    position: 'relative',
    maxHeight: 250,
    height: 250,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderRadius: ThemeConfig.BorderRadius.small,
    marginTop: $config.ICON_TEXT ? 8 : 0,
    marginHorizontal: 32,
    overflow: 'hidden',
  },
  scrollContainer: {
    maxHeight: 250,
    height: 250,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderRadius: ThemeConfig.BorderRadius.small,
    marginTop: $config.ICON_TEXT ? 8 : 0,
    overflowY: 'scroll',
    marginHorizontal: 32,
  },
  container: {
    padding: 12,
    flexGrow: 1,
  },
  captionLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
    flexShrink: 1,
    lineHeight: 24,
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
  uid: {
    color: 'orange',
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
  content: {
    color: 'white',
    fontSize: 18,
    flexShrink: 1,
    lineHeight: 24,
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
  live: {
    color: 'skyblue',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
  progressContainer: {
    position: 'absolute',
    top: 8,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  progressText: {
    color: 'yellow',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
  sideBySideContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  languageColumn: {
    flex: 1,
    paddingHorizontal: 4,
  },
  captionLineContainer: {
    marginBottom: 8,
    flexShrink: 1,
  },
  singleLanguageContainer: {
    marginTop: 4,
  },
  languageBadge: {
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginVertical: 4,
    alignSelf: 'flex-start',
  },
  languageBadgeText: {
    color: $config.FONT_COLOR + hexadecimalTransparency['40%'],
    fontSize: 14,
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
});
