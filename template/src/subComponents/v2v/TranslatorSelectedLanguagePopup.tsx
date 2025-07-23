import React, {useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
  TextInput,
} from 'react-native';
import Popup from '../../atoms/Popup';
import Spacer from '../../atoms/Spacer';
import TertiaryButton from '../../atoms/TertiaryButton';
import PrimaryButton from '../../atoms/PrimaryButton';
import ThemeConfig from '../../theme';
import {
  LanguageType,
  rimeLangData,
  elevenLabsLangData,
  TTSType,
  RimeModelType,
  ElevenLabsModelType,
  rimeVoices,
  elevenLabsVoices,
  ttsOptions,
  rimeModelOptions,
  elevenLabsModelOptions,
  getRimeVoicesByModel,
  getElevenLabsVoicesByModel,
  getValidElevenLabsTargets,
  getValidElevenLabsSources,
} from './utils';
import Toggle from '../../atoms/Toggle';
import Dropdown from '../../atoms/Dropdown';
import ImageIcon from '../../atoms/ImageIcon';
import Slider from '../../atoms/Slider';

interface TranslatorSelectedLanguagePopupProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  sourceLang: LanguageType;
  setSourceLang: (lang: LanguageType) => void;
  targetLang: LanguageType;
  setTargetLang: (lang: LanguageType) => void;
  onConfirm: () => void;
  onCancel: () => void;
  voices: {name: string; description: string; value: string}[];
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  // New props for TTS functionality
  selectedTTS: TTSType;
  setSelectedTTS: (tts: TTSType) => void;
  rimeSourceLang: LanguageType;
  setRimeSourceLang: (lang: LanguageType) => void;
  rimeTargetLang: LanguageType;
  setRimeTargetLang: (lang: LanguageType) => void;
  rimeSelectedVoice: string;
  setRimeSelectedVoice: (voice: string) => void;
  rimeSelectedModel: RimeModelType;
  setRimeSelectedModel: (model: RimeModelType) => void;
  elevenLabsSourceLang: LanguageType;
  setElevenLabsSourceLang: (lang: LanguageType) => void;
  elevenLabsTargetLang: LanguageType;
  setElevenLabsTargetLang: (lang: LanguageType) => void;
  elevenLabsSelectedVoice: string;
  setElevenLabsSelectedVoice: (voice: string) => void;
  elevenLabsSelectedModel: ElevenLabsModelType;
  setElevenLabsSelectedModel: (model: ElevenLabsModelType) => void;
  maxNonFinalTokensDurationMs: number;
  setMaxNonFinalTokensDurationMs: (value: number) => void;
  rtcSleepTimeMs: number;
  setRtcSleepTimeMs: (value: number) => void;
}

const windowWidth = Dimensions.get('window').width;

const TranslatorSelectedLanguagePopup: React.FC<
  TranslatorSelectedLanguagePopupProps
> = ({
  modalVisible,
  setModalVisible,
  sourceLang,
  setSourceLang,
  targetLang,
  setTargetLang,
  onConfirm,
  onCancel,
  voices,
  selectedVoice,
  setSelectedVoice,
  selectedTTS,
  setSelectedTTS,
  rimeSourceLang,
  setRimeSourceLang,
  rimeTargetLang,
  setRimeTargetLang,
  rimeSelectedVoice,
  setRimeSelectedVoice,
  rimeSelectedModel,
  setRimeSelectedModel,
  elevenLabsSourceLang,
  setElevenLabsSourceLang,
  elevenLabsTargetLang,
  setElevenLabsTargetLang,
  elevenLabsSelectedVoice,
  setElevenLabsSelectedVoice,
  elevenLabsSelectedModel,
  setElevenLabsSelectedModel,
  maxNonFinalTokensDurationMs,
  setMaxNonFinalTokensDurationMs,
  rtcSleepTimeMs,
  setRtcSleepTimeMs,
}) => {
  const [srcOpen, setSrcOpen] = React.useState(false);
  const [tgtOpen, setTgtOpen] = React.useState(false);
  const [voiceOpen, setVoiceOpen] = React.useState(false);
  const [ttsOpen, setTtsOpen] = React.useState(false);
  const [rimeSrcOpen, setRimeSrcOpen] = React.useState(false);
  const [rimeTgtOpen, setRimeTgtOpen] = React.useState(false);
  const [rimeVoiceOpen, setRimeVoiceOpen] = React.useState(false);
  const [rimeModelOpen, setRimeModelOpen] = React.useState(false);
  const [elevenLabsSrcOpen, setElevenLabsSrcOpen] = React.useState(false);
  const [elevenLabsTgtOpen, setElevenLabsTgtOpen] = React.useState(false);
  const [elevenLabsVoiceOpen, setElevenLabsVoiceOpen] = React.useState(false);
  const [elevenLabsModelOpen, setElevenLabsModelOpen] = React.useState(false);
  const [rtcSleepTimeError, setRtcSleepTimeError] = React.useState<
    string | null
  >(null);

  // Only one dropdown open at a time
  React.useEffect(() => {
    if (srcOpen && tgtOpen) setTgtOpen(false);
    if (srcOpen && voiceOpen) setVoiceOpen(false);
    if (srcOpen && ttsOpen) setTtsOpen(false);
  }, [srcOpen]);
  React.useEffect(() => {
    if (tgtOpen && srcOpen) setSrcOpen(false);
    if (tgtOpen && voiceOpen) setVoiceOpen(false);
    if (tgtOpen && ttsOpen) setTtsOpen(false);
  }, [tgtOpen]);
  React.useEffect(() => {
    if (voiceOpen && srcOpen) setSrcOpen(false);
    if (voiceOpen && tgtOpen) setTgtOpen(false);
    if (voiceOpen && ttsOpen) setTtsOpen(false);
  }, [voiceOpen]);
  React.useEffect(() => {
    if (ttsOpen && srcOpen) setSrcOpen(false);
    if (ttsOpen && tgtOpen) setTgtOpen(false);
    if (ttsOpen && voiceOpen) setVoiceOpen(false);
  }, [ttsOpen]);

  // Rime dropdowns
  React.useEffect(() => {
    if (rimeSrcOpen && rimeTgtOpen) setRimeTgtOpen(false);
    if (rimeSrcOpen && rimeVoiceOpen) setRimeVoiceOpen(false);
    if (rimeSrcOpen && rimeModelOpen) setRimeModelOpen(false);
  }, [rimeSrcOpen]);
  React.useEffect(() => {
    if (rimeTgtOpen && rimeSrcOpen) setRimeSrcOpen(false);
    if (rimeTgtOpen && rimeVoiceOpen) setRimeVoiceOpen(false);
    if (rimeTgtOpen && rimeModelOpen) setRimeModelOpen(false);
  }, [rimeTgtOpen]);
  React.useEffect(() => {
    if (rimeVoiceOpen && rimeSrcOpen) setRimeSrcOpen(false);
    if (rimeVoiceOpen && rimeTgtOpen) setRimeTgtOpen(false);
    if (rimeVoiceOpen && rimeModelOpen) setRimeModelOpen(false);
  }, [rimeVoiceOpen]);
  React.useEffect(() => {
    if (rimeModelOpen && rimeSrcOpen) setRimeSrcOpen(false);
    if (rimeModelOpen && rimeTgtOpen) setRimeTgtOpen(false);
    if (rimeModelOpen && rimeVoiceOpen) setRimeVoiceOpen(false);
  }, [rimeModelOpen]);

  // ElevenLabs dropdowns
  React.useEffect(() => {
    if (elevenLabsSrcOpen && elevenLabsTgtOpen) setElevenLabsTgtOpen(false);
    if (elevenLabsSrcOpen && elevenLabsVoiceOpen) setElevenLabsVoiceOpen(false);
    if (elevenLabsSrcOpen && elevenLabsModelOpen) setElevenLabsModelOpen(false);
  }, [elevenLabsSrcOpen]);
  React.useEffect(() => {
    if (elevenLabsTgtOpen && elevenLabsSrcOpen) setElevenLabsSrcOpen(false);
    if (elevenLabsTgtOpen && elevenLabsVoiceOpen) setElevenLabsVoiceOpen(false);
    if (elevenLabsTgtOpen && elevenLabsModelOpen) setElevenLabsModelOpen(false);
  }, [elevenLabsTgtOpen]);
  React.useEffect(() => {
    if (elevenLabsVoiceOpen && elevenLabsSrcOpen) setElevenLabsSrcOpen(false);
    if (elevenLabsVoiceOpen && elevenLabsTgtOpen) setElevenLabsTgtOpen(false);
    if (elevenLabsVoiceOpen && elevenLabsModelOpen) setElevenLabsModelOpen(false);
  }, [elevenLabsVoiceOpen]);
  React.useEffect(() => {
    if (elevenLabsModelOpen && elevenLabsSrcOpen) setElevenLabsSrcOpen(false);
    if (elevenLabsModelOpen && elevenLabsTgtOpen) setElevenLabsTgtOpen(false);
    if (elevenLabsModelOpen && elevenLabsVoiceOpen) setElevenLabsVoiceOpen(false);
  }, [elevenLabsModelOpen]);

  // --- UX improvement: show all languages, disable invalid pairs, and sort enabled first ---
  // For ElevenLabs
  const allLangs = elevenLabsLangData;
  let sourceOptions, targetOptions;
  if (!elevenLabsTargetLang) {
    // No target selected: all sources enabled
    sourceOptions = allLangs.map(lang => ({...lang, disabled: false}));
  } else {
    const validSources = getValidElevenLabsSources(
      elevenLabsTargetLang,
      allLangs,
    );
    sourceOptions = allLangs.map(lang => ({
      ...lang,
      disabled: !validSources.some(l => l.value === lang.value),
    }));
  }
  if (!elevenLabsSourceLang) {
    // No source selected: all targets enabled
    targetOptions = allLangs.map(lang => ({...lang, disabled: false}));
  } else {
    const validTargets = getValidElevenLabsTargets(
      elevenLabsSourceLang,
      allLangs,
    );
    targetOptions = allLangs.map(lang => ({
      ...lang,
      disabled: !validTargets.some(l => l.value === lang.value),
    }));
  }

  // Sort: enabled first (alphabetically), then disabled (alphabetically)
  const enabledSourceOptions = sourceOptions
    .filter(opt => !opt.disabled)
    .sort((a, b) => a.label.localeCompare(b.label));
  const disabledSourceOptions = sourceOptions
    .filter(opt => opt.disabled)
    .sort((a, b) => a.label.localeCompare(b.label));
  const finalSourceOptions =
    disabledSourceOptions.length > 0
      ? [...enabledSourceOptions, ...disabledSourceOptions]
      : enabledSourceOptions;

  const enabledTargetOptions = targetOptions
    .filter(opt => !opt.disabled)
    .sort((a, b) => a.label.localeCompare(b.label));
  const disabledTargetOptions = targetOptions
    .filter(opt => opt.disabled)
    .sort((a, b) => a.label.localeCompare(b.label));
  const finalTargetOptions =
    disabledTargetOptions.length > 0
      ? [...enabledTargetOptions, ...disabledTargetOptions]
      : enabledTargetOptions;

  // For Rime (if you want similar logic, add here)

  // Reset voice selection when model changes
  React.useEffect(() => {
    if (rimeSelectedModel && rimeSelectedVoice) {
      const availableVoices = getRimeVoicesByModel(rimeSelectedModel);
      const isVoiceAvailable = availableVoices.some(v => v.value === rimeSelectedVoice);
      if (!isVoiceAvailable) {
        setRimeSelectedVoice('');
      }
    }
  }, [rimeSelectedModel, rimeSelectedVoice, setRimeSelectedVoice]);

  React.useEffect(() => {
    if (elevenLabsSelectedModel && elevenLabsSelectedVoice) {
      const availableVoices = getElevenLabsVoicesByModel(elevenLabsSelectedModel);
      const isVoiceAvailable = availableVoices.some(v => v.value === elevenLabsSelectedVoice);
      if (!isVoiceAvailable) {
        setElevenLabsSelectedVoice('');
      }
    }
  }, [elevenLabsSelectedModel, elevenLabsSelectedVoice, setElevenLabsSelectedVoice]);

  const isFormValid = () => {
    if (selectedTTS === 'rime') {
      return rimeSourceLang && rimeTargetLang && rimeSelectedVoice && rimeSelectedModel;
    } else if (selectedTTS === 'eleven_labs') {
      return (
        elevenLabsSourceLang && elevenLabsTargetLang && elevenLabsSelectedVoice && elevenLabsSelectedModel
      );
    }
    return false;
  };

  return (
    <Popup
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      showCloseIcon={true}
      contentContainerStyle={styles.contentContainer}
      title={'Select Translation Languages'}
      subtitle={
        'Choose TTS provider and configure source and target language for translation.'
      }
      onCancel={onCancel}>
      <>
        <View style={{marginBottom: 16}}>
          {/* <View style={{marginBottom: 8}}>
            <View style={styles.inlineInputContainer}>
              <Text style={styles.inlineInputLabel}>RTC Sleep Time (ms)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={rtcSleepTimeMs.toString()}
                onChangeText={text => {
                  const val = parseInt(text, 10);
                  if (isNaN(val)) {
                    setRtcSleepTimeMs(10);
                    setRtcSleepTimeError('Enter a number between 10 and 300');
                  } else if (val < 10 || val > 300) {
                    setRtcSleepTimeMs(val);
                    setRtcSleepTimeError('Value must be between 10 and 300');
                  } else {
                    setRtcSleepTimeMs(val);
                    setRtcSleepTimeError(null);
                  }
                }}
                maxLength={3}
              />
            </View>
            <View style={{minHeight: 18}}>
              {rtcSleepTimeError && (
                <Text style={styles.inlineErrorText}>{rtcSleepTimeError}</Text>
              )}
            </View>
            <Text style={{marginLeft: 6, color: '#888', fontSize: 12}}>
              Controls the sleep interval for RTC loop (10-300 ms)
            </Text>
          </View> */}
          <Slider
            label="Max Non-Final Tokens Duration (ms)"
            value={maxNonFinalTokensDurationMs}
            onValueChange={setMaxNonFinalTokensDurationMs}
            minimumValue={360}
            maximumValue={6000}
            step={40}
            showValue={true}
            unit="ms"
            containerStyle={{marginBottom: 8}}
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 4,
            }}>
            <Text style={{marginLeft: 6, color: '#888', fontSize: 12}}>
              Maximum delay between a spoken word and its finalization
            </Text>
            <Text
              style={{
                marginLeft: 6,
                color: '#1a73e8',
                fontSize: 12,
                textDecorationLine: 'underline',
              }}
              onPress={() => {
                window.open &&
                  window.open(
                    'https://soniox.com/docs/speech-to-text/core-concepts/real-time-latency#description',
                    '_blank',
                  );
              }}>
              [Docs]
            </Text>
          </View>
        </View>
        <View style={{marginBottom: 16}}>
          <Text style={styles.dropdownLabel}>TTS Provider</Text>
          <Dropdown
            label={''}
            data={ttsOptions}
            selectedValue={selectedTTS}
            onSelect={({value}) => setSelectedTTS(value as TTSType)}
            enabled={true}
          />
        </View>

        {selectedTTS === 'rime' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Rime TTS Configuration</Text>
            </View>
            <View style={{marginBottom: 16}}>
              <Text style={styles.dropdownLabel}>Model</Text>
              <Dropdown
                label={rimeSelectedModel ? '' : 'Select model...'}
                data={rimeModelOptions}
                selectedValue={rimeSelectedModel}
                onSelect={({value}) => setRimeSelectedModel(value as RimeModelType)}
                enabled={true}
              />
            </View>
            <View style={{marginBottom: 16}}>
              <Text style={styles.dropdownLabel}>Target Language</Text>
              <Dropdown
                label={rimeTargetLang ? '' : 'Select target language...'}
                data={rimeLangData}
                selectedValue={rimeTargetLang}
                onSelect={({value}) => setRimeTargetLang(value as LanguageType)}
                enabled={true}
              />
            </View>
            <View style={{marginBottom: 16}}>
              <Text style={styles.dropdownLabel}>Source Language</Text>
              <Dropdown
                label={
                  rimeTargetLang
                    ? rimeSourceLang
                      ? ''
                      : 'Select source language...'
                    : 'Select target language first...'
                }
                data={rimeLangData}
                selectedValue={rimeSourceLang}
                onSelect={({value}) => setRimeSourceLang(value as LanguageType)}
                enabled={!!rimeTargetLang}
              />
            </View>
            <View style={{marginBottom: 16}}>
              <Text style={styles.dropdownLabel}>Voice</Text>
              <Dropdown
                label={
                  rimeSelectedModel
                    ? rimeSelectedVoice
                      ? ''
                      : 'Select voice...'
                    : 'Select model first...'
                }
                data={
                  rimeSelectedModel
                    ? getRimeVoicesByModel(rimeSelectedModel).map(v => ({
                        label: v.name,
                        value: v.value,
                      }))
                    : []
                }
                selectedValue={rimeSelectedVoice}
                onSelect={({value}) => setRimeSelectedVoice(value)}
                enabled={!!rimeSelectedModel}
              />
            </View>
          </>
        )}

        {selectedTTS === 'eleven_labs' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                ElevenLabs TTS Configuration
              </Text>

              <Text
                style={{
                  color: '#888',
                  fontSize: 12,
                }}>
                Use the reset icon to quickly clear the selected language and
                unlock all language pairs.
              </Text>
            </View>
            <View style={{marginBottom: 16}}>
              <Text style={styles.dropdownLabel}>Model</Text>
              <Dropdown
                label={elevenLabsSelectedModel ? '' : 'Select model...'}
                data={elevenLabsModelOptions}
                selectedValue={elevenLabsSelectedModel}
                onSelect={({value}) => setElevenLabsSelectedModel(value as ElevenLabsModelType)}
                enabled={false}
              />
            </View>
            <View style={{marginBottom: 16}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 4,
                }}>
                <Text style={styles.dropdownLabel}>Target Language</Text>
                <TouchableOpacity
                  onPress={() => setElevenLabsTargetLang('')}
                  style={{marginLeft: 8}}>
                  <ImageIcon
                    name="undo"
                    iconSize={16}
                    tintColor={'#888'}
                    iconContainerStyle={{width: 25, height: 25, padding: 5}}
                  />
                </TouchableOpacity>
              </View>
              <Dropdown
                label={elevenLabsTargetLang ? '' : 'Select target language...'}
                data={finalTargetOptions}
                selectedValue={elevenLabsTargetLang}
                onSelect={({value}) =>
                  setElevenLabsTargetLang(value as LanguageType)
                }
                enabled={true}
              />
            </View>
            <View style={{marginBottom: 16}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 4,
                }}>
                <Text style={styles.dropdownLabel}>Source Language</Text>
                <TouchableOpacity
                  onPress={() => setElevenLabsSourceLang('')}
                  style={{marginLeft: 8}}>
                  <ImageIcon
                    name="undo"
                    iconSize={16}
                    tintColor={'#888'}
                    iconContainerStyle={{width: 25, height: 25, padding: 5}}
                  />
                </TouchableOpacity>
              </View>
              <Dropdown
                label={
                  elevenLabsTargetLang
                    ? elevenLabsSourceLang
                      ? ''
                      : 'Select source language...'
                    : 'Select target language first...'
                }
                data={finalSourceOptions}
                selectedValue={elevenLabsSourceLang}
                onSelect={({value}) =>
                  setElevenLabsSourceLang(value as LanguageType)
                }
                enabled={!!elevenLabsTargetLang}
              />
            </View>
            <View style={{marginBottom: 16}}>
              <Text style={styles.dropdownLabel}>Voice</Text>
              <Dropdown
                label={
                  elevenLabsSelectedModel
                    ? elevenLabsSelectedVoice
                      ? ''
                      : 'Select voice...'
                    : 'Select model first...'
                }
                data={
                  elevenLabsSelectedModel
                    ? getElevenLabsVoicesByModel(elevenLabsSelectedModel).map(v => ({
                        label: v.name,
                        value: v.value,
                      }))
                    : []
                }
                selectedValue={elevenLabsSelectedVoice}
                onSelect={({value}) => setElevenLabsSelectedVoice(value)}
                enabled={!!elevenLabsSelectedModel}
              />
            </View>
          </>
        )}
      </>
      {selectedTTS && (
        <>
          <Text
            style={{
              color: '#888',
              fontSize: 12,
              marginTop: 8,
              marginBottom: 8,
              textAlign: 'center',
            }}></Text>
          <Spacer size={24} />
          <View style={styles.btnContainer}>
            <TertiaryButton
              containerStyle={styles.btn}
              text={'Cancel'}
              textStyle={styles.btnText}
              onPress={() => {
                onCancel();
                setModalVisible(false);
              }}
            />
            <Spacer size={10} horizontal={true} />
            <PrimaryButton
              containerStyle={styles.btn}
              text={'Confirm'}
              textStyle={styles.btnText}
              disabled={!isFormValid()}
              onPress={() => {
                setModalVisible(false);
                onConfirm();
              }}
            />
          </View>
        </>
      )}
    </Popup>
  );
};

export default TranslatorSelectedLanguagePopup;

const styles = StyleSheet.create({
  contentContainer: {
    padding: 24,
    maxWidth: 446,
    width: '100%',
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  btn: {
    flex: 1,
    minWidth: 140,
    maxWidth: 180,
    height: 48,
    borderRadius: ThemeConfig.BorderRadius.medium,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal: 0,
  },
  btnText: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  toggleLabel: {
    fontSize: 16,
    marginHorizontal: 4,
    color: $config.FONT_COLOR,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    marginTop: 8,
    color: $config.FONT_COLOR,
  },
  singleDropdownContainer: {
    position: 'relative',
  },
  singleDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#181818',
    minHeight: 44,
    justifyContent: 'space-between',
  },
  selectedText: {
    color: $config.FONT_COLOR,
    fontSize: 16,
    flex: 1,
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
    flex: 1,
  },
  arrow: {
    color: '#888',
    fontSize: 16,
    marginLeft: 8,
  },
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownListModal: {
    backgroundColor: '#222',
    borderRadius: 8,
    zIndex: 100,
    borderWidth: 1,
    borderColor: '#444',
    maxHeight: 240,
    overflow: 'scroll',
    paddingVertical: 4,
    width: '100%',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#FD5842',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  inlineErrorText: {
    color: '#FD5842',
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '500',
  },
  inlineInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inlineInputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: $config.FONT_COLOR,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: $config.FONT_COLOR,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#181818',
    color: '#fff',
    fontSize: 14,
    width: 120,
  },
});
