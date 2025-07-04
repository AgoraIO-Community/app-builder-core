import React, {useEffect, useRef, useState, useCallback} from 'react';
import TranslatorSelectedLanguagePopup from '../TranslatorSelectedLanguagePopup';
import {useV2VPalabra} from './usePalabraVoice2Voice';
import {
  sourceLangData,
  targetLangData,
  SourceLanguageType,
  TargetLanguageType,
} from './utils';
import {
  PalabraClient,
  EVENT_REMOTE_TRACKS_UPDATE,
  EVENT_ERROR_RECEIVED,
  EVENT_START_TRANSLATION,
  EVENT_STOP_TRANSLATION,
  EVENT_PARTIAL_TRANSCRIPTION_RECEIVED,
  EVENT_TRANSCRIPTION_RECEIVED,
  EVENT_TRANSLATION_RECEIVED,
  EVENT_PARTIAL_TRANSLATED_TRANSCRIPTION_RECEIVED,
  getLocalAudioTrack,
} from '@palabra-ai/translator';
import {useRtc, useLocalUid, useContent} from 'customization-api';
import ThemeConfig from '../../../theme';
import {PalabraTranslationEntry} from './usePalabraVoice2Voice';
import {ScrollView, View, StyleSheet} from 'react-native';

const CAPTION_CONTAINER_HEIGHT = 144;

const PalabraContainer = () => {
  const {
    isPalabraActive,
    setIsPalabraActive,
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
    isPalabraON,
    setIsPalabraON,
    translatedText,
    setTranslatedText,
  } = useV2VPalabra();
  const [showPopup, setShowPopup] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const palabraClientRef = useRef<any>(null);
  const {RtcEngineUnsafe} = useRtc();
  const localUid = useLocalUid();
  const {defaultContent} = useContent();
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef(null); // for ScrollView

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPalabra();
    };
  }, []);

  const handleSetShowPopup = (visible: boolean) => {
    setShowPopup(visible);
    if (!visible) {
      setIsPalabraON(false);
    }
  };

  const handleConfirm = async () => {
    setShowPopup(false);
    setError(null);
    setTranslatedText([]); // Clear previous feed
    try {
      // Cleanup previous client if any
      if (palabraClientRef.current) {
        await palabraClientRef.current.cleanup();
        palabraClientRef.current = null;
      }
      // Use a valid fallback for source and target
      const safeSourceLang: SourceLanguageType =
        (sourceLang as SourceLanguageType) || 'en';
      const safeTargetLang: TargetLanguageType =
        (targetLang as TargetLanguageType) || 'en-us';
      // Get the first available remote audio track (excluding localUid)
      const remoteAudioTracks = Array.from(
        (RtcEngineUnsafe as any).remoteStreams.entries(),
      )
        .filter(([uid, stream]) => uid !== localUid && stream.audio)
        .map(([uid, stream]) => ({uid, audio: stream.audio}));

      //   if (remoteAudioTracks.length === 0) {
      //     setError('No remote user audio available to translate.');
      //     setIsTranslating(false);
      //     setIsPalabraActive(false);
      //     return;
      //   }
      //  const selectedRemote = remoteAudioTracks[0];
      const selectedRemote = (RtcEngineUnsafe as any).localStream; //todo: only for local tetsing remove
      // Instantiate PalabraClient
      const client = new PalabraClient({
        auth: {
          clientId: $config.PALABRA_CLIENT_ID,
          clientSecret: $config.PALABRA_CLIENT_SECRET,
        },
        translateFrom: safeSourceLang,
        translateTo: safeTargetLang,
        handleOriginalTrack: () => selectedRemote.audio.mediaStreamTrack,
        //getLocalAudioTrack : for Local user
      });

      client.on(EVENT_START_TRANSLATION, (...args) => {
        setIsTranslating(true);
        selectedRemote.audio.stop();
      });
      client.on(EVENT_STOP_TRANSLATION, (...args) => {
        setIsTranslating(false);
        selectedRemote.audio.play();
      });
      client.on(EVENT_PARTIAL_TRANSCRIPTION_RECEIVED, (...args) => {
        console.log('EVENT_PARTIAL_TRANSCRIPTION_RECEIVED', args);
      });
      client.on(EVENT_TRANSCRIPTION_RECEIVED, (...args) => {
        console.log('EVENT_TRANSCRIPTION_RECEIVED', args);
      });
      client.on(EVENT_TRANSLATION_RECEIVED, (...args) => {
        const event = args[0];
        let uid = selectedRemote?.uid || 'remote';
        let now = Date.now();
        let segment = event?.transcription?.segments?.[0];
        let text = segment?.text || event?.transcription?.text || '';
        let time = segment?.start_timestamp
          ? new Date(segment.start_timestamp).getTime()
          : now;
        setTranslatedText(prev => {
          const last = prev.length > 0 ? prev[prev.length - 1] : null;
          if (last && last.uid === uid && time - last.time < 60000) {
            return [
              ...prev.slice(0, -1),
              {...last, text: `${last.text} ${text}`.trim(), time},
            ];
          } else {
            return [...prev, {uid, text, time}];
          }
        });
        console.log('EVENT_TRANSLATION_RECEIVED', event);
      });
      client.on(EVENT_PARTIAL_TRANSLATED_TRANSCRIPTION_RECEIVED, (...args) => {
        console.log('EVENT_PARTIAL_TRANSLATED_TRANSCRIPTION_RECEIVED', args);
      });
      // Listen for errors
      client.on(EVENT_ERROR_RECEIVED, (err: any) => {
        setError(
          'Translation error: ' +
            (err &&
              (typeof err.message === 'string'
                ? err.message
                : JSON.stringify(err) || 'Unknown error')),
        );
      });
      await client.startTranslation();
      await client.startPlayback();
      palabraClientRef.current = client;
      setIsPalabraActive(true);
    } catch (err: any) {
      setError(
        'Failed to start translation: ' +
          (err?.message || err?.toString() || 'Unknown error'),
      );
      setIsTranslating(false);
      setIsPalabraActive(false);
    }
  };

  const handleCancel = () => {
    setShowPopup(false);
  };

  // Stop and cleanup PalabraClient,
  const stopPalabra = async () => {
    setShowPopup(false);
    setIsPalabraActive(false);
    setIsTranslating(false);
    setError(null);
    if (palabraClientRef.current) {
      try {
        await palabraClientRef.current.stopPlayback();
        await palabraClientRef.current.stopTranslation();
        await palabraClientRef.current.cleanup();
      } catch (err) {}
      palabraClientRef.current = null;
    }
  };

  // Format time as 10:30 am
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Helper to get user name from uid
  const getUserName = (uid: string) => defaultContent[uid]?.name || 'User';

  // Scroll/auto-scroll logic
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20;
    setAutoScroll(isAtBottom);
  }, []);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollToEnd({animated: true});
    }
  }, [translatedText, autoScroll]);

  // Scroll-to-end button handler
  const scrollToEnd = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({animated: true});
      setAutoScroll(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress bar row at top */}
      <View style={styles.progressBarRow}>
        {isTranslating && (
          <View style={styles.progressBarBox}>
            <span style={{color: '#fff', fontSize: 12, marginBottom: 2}}>
              Translating to {targetLang}...
            </span>
            <View style={styles.progressBarBg}>
              <View style={styles.progressBarFill} />
            </View>
          </View>
        )}
      </View>
      {/* Scrollable translation feed, full width, with padding to avoid overlap */}
      <View style={styles.scrollAreaWrapper}>
        <ScrollView
          ref={scrollRef}
          onScroll={handleScroll}
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          scrollEventThrottle={16}
          onContentSizeChange={() => {
            if (autoScroll && scrollRef.current) {
              scrollRef.current.scrollToEnd({animated: true});
            }
          }}>
          {translatedText.length === 0 ? (
            <View style={{alignItems: 'center', marginTop: 32}}>
              <span style={{color: '#aaa', fontSize: 16}}>
                No translations yet.
              </span>
            </View>
          ) : (
            translatedText.map((entry, idx) => (
              <View key={idx} style={styles.translationLine}>
                <span style={styles.userName}>
                  {getUserName(entry.uid)}{' '}
                  <span style={styles.time}>({formatTime(entry.time)})</span>:
                </span>
                <span style={styles.translationText}>{entry.text}</span>
              </View>
            ))
          )}
        </ScrollView>
        {/* Scroll-to-end button */}
        {!autoScroll && translatedText.length > 0 && (
          <View style={styles.scrollToEndBtnWrapper}>
            <button onClick={scrollToEnd} style={styles.scrollToEndBtn}>
              Scroll to latest
            </button>
          </View>
        )}
      </View>
      {showPopup && (
        <TranslatorSelectedLanguagePopup
          modalVisible={showPopup}
          setModalVisible={handleSetShowPopup}
          sourceLang={sourceLang}
          setSourceLang={setSourceLang}
          targetLang={targetLang}
          setTargetLang={setTargetLang}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          sourceLangData={sourceLangData}
          targetLangData={targetLangData}
          sourceLabel="Languages Others Speak"
          targetLabel="Languages You Speak"
          allowSameLangSelection={false}
        />
      )}
      {/* Display error if any */}
      {error && <span style={{color: 'red', margin: 8}}>{error}</span>}
      {/* Inline CSS for progress bar animation (web only) */}
      <style>{`
        @keyframes palabra-progress-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .palabra-animated-ring { display: none; }
      `}</style>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '95%',
    marginTop: 32,
    marginHorizontal: 'auto',
    backgroundColor: 'rgba(30,30,30,0.92)',
    borderRadius: 12,
    // boxShadow and fontFamily are web only, so ignore for native
    minHeight: CAPTION_CONTAINER_HEIGHT,
    maxHeight: CAPTION_CONTAINER_HEIGHT,
    height: CAPTION_CONTAINER_HEIGHT,
    padding: 0,
    overflow: 'visible',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  progressBarRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    minHeight: 28,
    height: 28,
    paddingTop: 8,
    paddingRight: 24,
    paddingLeft: 24,
  },
  progressBarBox: {
    width: 160,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'column',
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 5,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#007bff', // fallback for native
    // For web, the animation and gradient will apply
  },
  scrollAreaWrapper: {
    flex: 1,
    position: 'relative',
  },
  scrollArea: {
    flex: 1,
    minHeight: CAPTION_CONTAINER_HEIGHT - 28,
    maxHeight: CAPTION_CONTAINER_HEIGHT - 28,
    width: '100%',
  },
  scrollContent: {
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexGrow: 1,
  },
  translationLine: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  userName: {
    color: '#ff9800',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
  time: {
    color: '#bbb',
    fontWeight: '400',
    fontSize: 14,
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
  translationText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 2,
    flex: 1,
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
  scrollToEndBtnWrapper: {
    position: 'absolute',
    right: 24,
    bottom: 16,
    zIndex: 20,
  },
  scrollToEndBtn: {
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 18,
    fontWeight: '600',
    fontSize: 14,
    // cursor and boxShadow are web only
  },
});

export default PalabraContainer;
