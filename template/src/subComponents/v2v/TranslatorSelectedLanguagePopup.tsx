import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import Popup from '../../atoms/Popup';
import Spacer from '../../atoms/Spacer';
import TertiaryButton from '../../atoms/TertiaryButton';
import PrimaryButton from '../../atoms/PrimaryButton';
import ThemeConfig from '../../theme';
import {LanguageType, langData} from './utils';
import Toggle from '../../atoms/Toggle';

interface TranslatorSelectedLanguagePopupProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  isTranslation: boolean;
  setIsTranslation: (val: boolean) => void;
  sourceLang: LanguageType;
  setSourceLang: (lang: LanguageType) => void;
  targetLang: LanguageType;
  setTargetLang: (lang: LanguageType) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const windowWidth = Dimensions.get('window').width;

const SingleSelectDropdown: React.FC<{
  label: string;
  value: LanguageType;
  onChange: (lang: LanguageType) => void;
  options: {label: string; value: LanguageType}[];
  placeholder?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  otherDropdownOpen: boolean;
}> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  open,
  setOpen,
  otherDropdownOpen,
}) => {
  return (
    <View style={{marginBottom: 16}}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <View style={styles.singleDropdownContainer}>
        <TouchableOpacity
          style={styles.singleDropdown}
          activeOpacity={0.7}
          onPress={() => {
            if (!otherDropdownOpen) setOpen(!open);
          }}>
          <Text style={value ? styles.selectedText : styles.placeholderText}>
            {value ? options.find(o => o.value === value)?.label : placeholder}
          </Text>
          <Text style={styles.arrow}>▼</Text>
        </TouchableOpacity>
        <Modal
          transparent
          animationType="fade"
          visible={open}
          onRequestClose={() => setOpen(false)}>
          <Pressable
            style={styles.dropdownModalOverlay}
            onPress={() => setOpen(false)}>
            <View
              style={[
                styles.dropdownListModal,
                {width: Math.min(windowWidth * 0.8, 400)},
              ]}>
              {options.map(opt => (
                <Text
                  key={opt.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}>
                  {opt.label}
                </Text>
              ))}
            </View>
          </Pressable>
        </Modal>
      </View>
    </View>
  );
};

const TranslatorSelectedLanguagePopup: React.FC<
  TranslatorSelectedLanguagePopupProps
> = ({
  modalVisible,
  setModalVisible,
  isTranslation,
  setIsTranslation,
  sourceLang,
  setSourceLang,
  targetLang,
  setTargetLang,
  onConfirm,
  onCancel,
}) => {
  const [srcOpen, setSrcOpen] = React.useState(false);
  const [tgtOpen, setTgtOpen] = React.useState(false);

  const isLangSame =
    isTranslation && sourceLang && targetLang && sourceLang === targetLang;

  // Only one dropdown open at a time
  React.useEffect(() => {
    if (srcOpen && tgtOpen) setTgtOpen(false);
  }, [srcOpen]);
  React.useEffect(() => {
    if (tgtOpen && srcOpen) setSrcOpen(false);
  }, [tgtOpen]);

  return (
    <Popup
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      showCloseIcon={true}
      contentContainerStyle={styles.contentContainer}
      title={isTranslation ? 'Select Translation Languages' : 'Transcription'}
      subtitle={
        isTranslation
          ? 'Choose source and target language for translation.'
          : 'Transcription will use the default language.'
      }>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Transcription</Text>
        <Toggle
          isEnabled={isTranslation}
          toggleSwitch={setIsTranslation}
          customContainerStyle={{marginHorizontal: 12}}
        />
        <Text style={styles.toggleLabel}>Translation</Text>
      </View>
      {isTranslation && (
        <>
          <SingleSelectDropdown
            label="Source Language"
            value={sourceLang}
            onChange={setSourceLang}
            options={langData}
            placeholder="Select source language"
            open={srcOpen}
            setOpen={setSrcOpen}
            otherDropdownOpen={tgtOpen}
          />
          <SingleSelectDropdown
            label="Target Language"
            value={targetLang}
            onChange={setTargetLang}
            options={langData}
            placeholder="Select target language"
            open={tgtOpen}
            setOpen={setTgtOpen}
            otherDropdownOpen={srcOpen}
          />
          {isLangSame && (
            <Text style={styles.errorText}>
              Source and Target languages cannot be the same.
            </Text>
          )}
        </>
      )}
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
          disabled={isTranslation && (!sourceLang || !targetLang || isLangSame)}
          onPress={() => {
            setModalVisible(false);
            onConfirm();
          }}
        />
      </View>
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
});
