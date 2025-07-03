import React, {useEffect, useRef, useState} from 'react';
import TranslatorSelectedLanguagePopup from '../TranslatorSelectedLanguagePopup';
import {useV2VPalabra} from './usePalabraVoice2Voice';
import {sourceLangData, SourceLanguageType, TargetLanguageType} from './utils';
import {
  getLocalAudioTrack,
  PalabraClient,
  EVENT_REMOTE_TRACKS_UPDATE,
  EVENT_ERROR_RECEIVED,
} from '@palabra-ai/translator';

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
      // Instantiate PalabraClient
      const client = new PalabraClient({
        auth: {
          clientId: $config.PALABRA_CLIENT_ID,
          clientSecret: $config.PALABRA_CLIENT_SECRET, // <-- replace with real credentials
        },
        translateFrom: safeSourceLang,
        translateTo: safeTargetLang,
        handleOriginalTrack: getLocalAudioTrack,
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
    // Optionally reset language selection here if needed
  };

  // Stop and cleanup PalabraClient, called when user clicks 'Stop V2V Palabra'
  const stopPalabra = async () => {
    debugger;
    setShowPopup(false);
    setIsPalabraActive(false);
    setIsTranslating(false);
    setError(null);
    if (palabraClientRef.current) {
      try {
        await palabraClientRef.current.stopPlayback();
        await palabraClientRef.current.stopTranslation();
        await palabraClientRef.current.cleanup();
      } catch (err) {
        // ignore cleanup errors
      }
      palabraClientRef.current = null;
    }
  };

  return (
    <>
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
          langData={sourceLangData}
          sourceLabel="Languages Others Speak"
          targetLabel="Languages You Speak"
        />
      )}
      {/* Display error if any */}
      {error && <div style={{color: 'red', margin: 8}}>{error}</div>}
      {/* Animated ring while translating */}
      {isTranslating && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 24,
          }}>
          <div className="palabra-animated-ring" />
        </div>
      )}
      {/* Inline CSS for animated ring */}
      <style>{`
        .palabra-animated-ring {
          width: 48px;
          height: 48px;
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
