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
  const scrollRef = useRef<HTMLDivElement>(null);

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
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [translatedText, autoScroll]);

  // Scroll-to-end button handler
  const scrollToEnd = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setAutoScroll(true);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        margin: '32px 32px 0 32px',
        background: 'rgba(30,30,30,0.92)',
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        fontFamily: ThemeConfig.FontFamily.sansPro,
        minHeight: CAPTION_CONTAINER_HEIGHT,
        maxHeight: CAPTION_CONTAINER_HEIGHT,
        height: CAPTION_CONTAINER_HEIGHT,
        padding: 0,
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}>
      {/* Progress bar row at top */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          minHeight: 28,
          height: 28,
          padding: '8px 24px 0 24px',
          boxSizing: 'border-box',
        }}>
        {isTranslating && (
          <div
            style={{
              width: 160,
              background: 'rgba(0,0,0,0.7)',
              borderRadius: 8,
              padding: '6px 12px 6px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
            <span style={{color: '#fff', fontSize: 12, marginBottom: 2}}>
              Translating to ${targetLang}...
            </span>
            <div
              style={{
                width: '100%',
                height: 5,
                background: '#333',
                borderRadius: 3,
                overflow: 'hidden',
              }}>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background:
                    'linear-gradient(90deg, #007bff 30%, #e0e0e0 100%)',
                  animation: 'palabra-progress-bar 1.2s linear infinite',
                }}
              />
            </div>
          </div>
        )}
      </div>
      {/* Scrollable translation feed, full width, with padding to avoid overlap */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          height: `calc(${CAPTION_CONTAINER_HEIGHT}px - 28px)`,
          maxHeight: `calc(${CAPTION_CONTAINER_HEIGHT}px - 28px)`,
          overflowY: 'auto',
          padding: '12px 24px 24px 24px',
          width: '100%',
          boxSizing: 'border-box',
        }}>
        {translatedText.length === 0 ? (
          <div
            style={{
              color: '#aaa',
              textAlign: 'center',
              fontSize: 16,
              marginTop: 32,
            }}>
            No translations yet.
          </div>
        ) : (
          translatedText.map((entry, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: 12,
                display: 'flex',
                alignItems: 'flex-start',
                width: '100%',
              }}>
              <span
                style={{
                  color: '#ff9800',
                  fontWeight: 600,
                  fontSize: 16,
                  marginRight: 8,
                }}>
                {getUserName(entry.uid)}{' '}
                <span style={{color: '#bbb', fontWeight: 400, fontSize: 14}}>
                  ({formatTime(entry.time)})
                </span>
                :
              </span>
              <span
                style={{
                  color: '#fff',
                  fontSize: 16,
                  marginLeft: 2,
                  wordBreak: 'break-word',
                  flex: 1,
                }}>
                {entry.text}
              </span>
            </div>
          ))
        )}
        {/* Scroll-to-end button */}
        {!autoScroll && translatedText.length > 0 && (
          <button
            onClick={scrollToEnd}
            style={{
              position: 'absolute',
              right: 24,
              bottom: 16,
              zIndex: 20,
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: 16,
              padding: '6px 18px',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}>
            Scroll to latest
          </button>
        )}
      </div>
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
      {error && <div style={{color: 'red', margin: 8}}>{error}</div>}
      {/* Inline CSS for progress bar animation */}
      <style>{`
        @keyframes palabra-progress-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .palabra-animated-ring { display: none; }
      `}</style>
    </div>
  );
};

export default PalabraContainer;
