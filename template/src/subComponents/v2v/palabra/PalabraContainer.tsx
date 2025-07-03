import React, {useEffect, useRef, useState} from 'react';
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
  getLocalAudioTrack,
} from '@palabra-ai/translator';
import {useRtc, useLocalUid} from 'customization-api';
import ThemeConfig from '../../../theme';

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
  } = useV2VPalabra();
  const [showPopup, setShowPopup] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const palabraClientRef = useRef<any>(null);
  const {RtcEngineUnsafe} = useRtc();
  const localUid = useLocalUid();

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
    setIsTranslating(true);
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
      if (remoteAudioTracks.length === 0) {
        setError('No remote user audio available to translate.');
        setIsTranslating(false);
        setIsPalabraActive(false);
        return;
      }
      const selectedRemote = remoteAudioTracks[0];
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
        console.log('startTranslation', args);
        selectedRemote.audio.stop();
      });
      client.on(EVENT_STOP_TRANSLATION, (...args) => {
        console.log('stoppedTranslation', args);
        selectedRemote.audio.play();
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

  return (
    <>
      {/* Find the label for the selected target language */}
      {isTranslating &&
        (() => {
          const targetLangLabel =
            targetLangData.find(l => l.value === targetLang)?.label ||
            targetLang;
          return (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 24,
                fontFamily: ThemeConfig.FontFamily.sansPro,
              }}>
              <div style={{marginBottom: 8, color: '#fff', fontWeight: 500}}>
                Translating for you in {targetLangLabel}...
              </div>
              <div className="palabra-animated-ring" />
            </div>
          );
        })()}
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
      {/* Inline CSS for animated ring */}
      <style>{`
        .palabra-animated-ring {
          width: 28px;
          height: 28px;
          border: 6px solid #e0e0e0;
          border-top: 6px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default PalabraContainer;
