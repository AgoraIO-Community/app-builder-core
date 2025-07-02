import React, {useState} from 'react';
import TranslatorSelectedLanguagePopup from '../TranslatorSelectedLanguagePopup';
import {useV2VPalabra} from './usePalabraVoice2Voice';
import {getPalabraSupportedLanguages} from './utils';

const PalabraContainer = () => {
  const {
    isPalabraActive,
    setIsPalabraActive,
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
  } = useV2VPalabra();
  const [showPopup, setShowPopup] = useState(true);

  const handleConfirm = () => {
    setShowPopup(false);
    // TODO: Integrate Palabra SDK start logic here
  };

  const handleCancel = () => {
    setShowPopup(false);
    setIsPalabraActive(false);
    // TODO: Integrate Palabra SDK stop logic here if needed
  };

  return (
    <>
      {showPopup && (
        <TranslatorSelectedLanguagePopup
          modalVisible={showPopup}
          setModalVisible={setShowPopup}
          sourceLang={sourceLang}
          setSourceLang={setSourceLang}
          targetLang={targetLang}
          setTargetLang={setTargetLang}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
      {/* TODO: Add Palabra translation display here */}
    </>
  );
};

export default PalabraContainer;
