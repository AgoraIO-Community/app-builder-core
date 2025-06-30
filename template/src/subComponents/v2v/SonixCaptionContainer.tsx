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
import {useV2V} from './useVoice2Voice';
import Loading from '../Loading';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import TranslatorSelectedLanguagePopup from './TranslatorSelectedLanguagePopup';
import {LanguageType} from './utils';

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
  const {RtcEngineUnsafe} = useRtc();
  const {defaultContent, activeUids} = useContent();
  const localUid = useLocalUid();
  const {
    translations,
    setTranslations,
    isSonioxV2VListenerAdded,
    setIsSonioxV2VListenerAdded,
    isV2VActive,
    setIsV2VActive,
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
    setIsV2VON,
  } = useV2V();
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
  const [showTranslatorPopup, setShowTranslatorPopup] = useState(true);
  const [isTranslation, setIsTranslation] = useState(false);

  useEffect(() => {
    if (RtcEngineUnsafe && RtcEngineUnsafe.setV2VActive) {
      RtcEngineUnsafe.setV2VActive(isV2VActive);
    }
  }, [isV2VActive, RtcEngineUnsafe]);

  useEffect(() => {
    return () => {
      if (RtcEngineUnsafe && RtcEngineUnsafe.setV2VActive) {
        RtcEngineUnsafe.setV2VActive(false);
      }
    };
  }, [RtcEngineUnsafe]);

  useEffect(() => {
    const mergedFeed = [
      ...translations.map(entry => ({...entry})),
      ...Object.values(activeCaptionsRef.current).map(entry => ({...entry})),
    ];
    setDisplayFeed(mergedFeed);
  }, [translations]);

  useEffect(() => {
    if (isTranslation) {
      setSourceLang(prev => prev || 'en');
      setTargetLang(prev => prev || 'es');
    } else {
      setSourceLang(null);
      setTargetLang(null);
    }
  }, [isTranslation, setSourceLang, setTargetLang]);

  const sonixCaptionCallback = useCallback(
    (botID, payload) => {
      setIsSonioxV2VListenerAdded(true);

      const queueCallback = () => {
        try {
          const jsonString = new TextDecoder().decode(payload);
          const data = JSON.parse(jsonString);
          console.log('Bot ID', botID, '*STT*-Soniox-Decoded', data);

          const finalText = data.final?.trim() || '';
          const nonFinalText = data.non_final?.trim() || '';
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
    [setTranslations, setIsSonioxV2VListenerAdded],
  );

  useEffect(() => {
    if (showTranslatorPopup) {
      return;
    }

    const createBot = async () => {
      try {
        engine.selfSonioxBotID = ''; //engine.selfSonioxBotID = '0'; //Number('9' + localUid.toString().slice(1));
        let body: any = {
          channel_name: channel,
          user_id: localUid.toString(),
        };
        if (sourceLang && targetLang) {
          body.language_hints = [sourceLang];
          body.source_lang = [targetLang === 'en' ? '*' : sourceLang]; // soniox issue to trsnalte to english it src needsto be marked as *
          body.target_lang = targetLang;
        }
        const response = await fetch(
          'https://demo.rteappbuilder.com/create_bot',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          },
        );
        const data = await response.json();
        console.log('Bot created:', data);
        setIsV2VActive(true);
      } catch (error) {
        console.error('Error creating bot:', error);
      }
    };

    const addStreamListener = () => {
      if (!isSonioxV2VListenerAdded) {
        RtcEngineUnsafe.addListener(
          'onSonioxStreamMessage',
          sonixCaptionCallback,
        );
      }
    };
    addStreamListener();
    createBot();
  }, [
    showTranslatorPopup,
    isSonioxV2VListenerAdded,
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
    return (
      <TranslatorSelectedLanguagePopup
        modalVisible={showTranslatorPopup}
        setModalVisible={setShowTranslatorPopup}
        isTranslation={isTranslation}
        setIsTranslation={setIsTranslation}
        sourceLang={sourceLang}
        setSourceLang={setSourceLang}
        targetLang={targetLang}
        setTargetLang={setTargetLang}
        onConfirm={() => setShowTranslatorPopup(false)}
        onCancel={() => setIsV2VON(false)}
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
