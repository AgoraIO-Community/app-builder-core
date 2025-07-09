// @ts-nocheck
import {StyleSheet, Text, View, ScrollView} from 'react-native';
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
  ttsOptions,
  elevenLabsVoices,
} from './utils';
import getUniqueID from '../../utils/getUniqueID';

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

  // in-progress captions per speaker now
  const activeCaptionsRef = useRef<Record<string, TranslatioinEntry>>({});
  const {
    data: {channel},
  } = useRoomInfo();

  const engine = RtcEngineUnsafe;
  const [displayFeed, setDisplayFeed] = useState<TranslatioinEntry[]>([]);

  useEffect(() => {
    return () => {
      // On unmount, disconnect user from V2V
      disconnectV2VUser(channel, localUid);
      RtcEngineUnsafe.setV2VActive(false);
    };
  }, [channel, localUid]);

  useEffect(() => {
    const mergedFeed = [
      ...translations.map(entry => ({...entry})),
      ...Object.values(activeCaptionsRef.current).map(entry => ({...entry})),
    ];
    setDisplayFeed(mergedFeed);
  }, [translations]);

  useEffect(() => {
    // setSourceLang('en');
    // setTargetLang('es');
    setIsV2VActive(false);
  }, []);

  const sonixCaptionCallback = useCallback(
    (botID, payload) => {
      const queueCallback = () => {
        try {
          const srcLangugae = providerConfigs[selectedTTS].sourceLang;
          const jsonString = new TextDecoder().decode(payload);
          const data = JSON.parse(jsonString);
          console.log('Bot ID', botID, '*STT*-Soniox-Decoded', data);

          const finalText = data[sourceLang].final_text?.trim() || '';
          const nonFinalText = data[sourceLang].non_final_text?.trim() || '';
          const uid = data.user_id;

          if (!finalText && !nonFinalText) return;

          let active = activeCaptionsRef.current[uid] || {
            uid,
            text: '',
            nonFinal: '',
            time: Date.now(),
          };

          if (finalText) {
            setTranslations(prev => {
              const last = prev[prev.length - 1];
              if (last && last.uid === uid) {
                const updated = {
                  ...last,
                  text: `${last.text} ${finalText}`.trim(),
                  time: Date.now(),
                };
                return [...prev.slice(0, -1), updated];
              } else {
                return [...prev, {uid, text: finalText, time: Date.now()}];
              }
            });
          }

          active.nonFinal = nonFinalText;
          active.time = Date.now();

          if (nonFinalText) {
            activeCaptionsRef.current[uid] = active;
            setTranslations(prev => [...prev]);
          } else {
            delete activeCaptionsRef.current[uid];
          }
        } catch (err) {
          console.error('Error parsing stream message:', err);
        }
      };

      queueRef.current.add(queueCallback);
    },
    [setTranslations, sourceLang],
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
        engine.selfSonioxBotID = Number('9' + localUid.toString().slice(1));
        let body: any = {
          channel_name: channel,
          user_id: localUid.toString(),
          language_hints: [sourceLang],
          tts_speaker: selectedVoice,
          tts_provider: selectedTTS,
        };

        if (sourceLang !== targetLang) {
          body.source_lang = [targetLang === 'en' ? '*' : sourceLang];
          body.target_lang = targetLang;
        } else {
          body.source_lang = [sourceLang];
          body.target_lang = targetLang;
        }
        const requestId = getUniqueID();

        const response = await fetch(`${V2V_URL}/create_bot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-Id': requestId,
          },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        console.log('Bot created:', data);
        RtcEngineUnsafe.setV2VActive(true);
        setIsV2VActive(true);
      } catch (error) {
        console.error('Error creating bot:', error);
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
  ]);

  if (showTranslatorPopup) {
    const handleConfirm = () => {
      // Save the current popup selections to context
      const config =
        providerConfigs[selectedTTS] || providerConfigs['rime'] || {};
      setSourceLang(config.sourceLang);
      setTargetLang(config.targetLang);
      setSelectedVoice(config.voice);
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
      {!isV2VActive ? (
        <Loading
          text={'Setting up Translation...'}
          background="transparent"
          indicatorColor={$config.FONT_COLOR + hexadecimalTransparency['70%']}
          textColor={$config.FONT_COLOR + hexadecimalTransparency['70%']}
        />
      ) : (
        <>
          {[...translations].map((entry, index) => {
            const live = activeCaptionsRef.current[entry.uid]?.nonFinal;
            return (
              <Text key={`caption-${index}`} style={styles.captionLine}>
                <Text style={styles.uid}>
                  {defaultContent[entry.uid]?.name} ({formatTime(entry.time)}) :
                </Text>
                <Text style={styles.content}> {entry.text}</Text>
                {live && <Text style={styles.live}> {live}</Text>}
              </Text>
            );
          })}
        </>
      )}
    </ScrollView>
  );
};

export default SonixCaptionContainer;

const styles = StyleSheet.create({
  scrollContainer: {
    maxHeight: CAPTION_CONTAINER_HEIGHT,
    height: CAPTION_CONTAINER_HEIGHT,
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
  },
  uid: {
    color: 'orange',
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 24,
  },
  content: {
    color: 'white',
    fontSize: 18,
    flexShrink: 1,
    lineHeight: 24,
  },
  live: {
    color: 'skyblue',
    fontSize: 18,
    lineHeight: 24,
  },
});
