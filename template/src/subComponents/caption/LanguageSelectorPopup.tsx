import React, {SetStateAction, useContext} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Spacer from '../../atoms/Spacer';
import Popup from '../../atoms/Popup';
import TertiaryButton from '../../atoms/TertiaryButton';
import PrimaryButton from '../../atoms/PrimaryButton';
import ThemeConfig from '../../theme';
import {useIsDesktop} from '../../utils/common';
import {useCaption} from './useCaption';
import DropdownMulti from '../../atoms/DropDownMulti';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';

export type LanguageType =
  | 'en-US'
  | 'hi-IN'
  | 'zh-CN'
  | 'zh-HK'
  | 'fr-FR'
  | 'de-DE'
  | 'ko-KR'
  | 'en-IN'
  | 'ar'
  | 'ja-JP'
  | 'pt-PT'
  | 'es-ES'
  | 'it-IT'
  | 'id-ID'
  | '';

interface LanguageData {
  label: string;
  value: LanguageType;
}

const langData: LanguageData[] = [
  {label: 'English (US)', value: 'en-US'},
  {label: 'English (India)', value: 'en-IN'},
  {label: 'Hindi', value: 'hi-IN'},
  {label: 'Chinese (Simplified)', value: 'zh-CN'},
  {label: 'Chinese (Traditional)', value: 'zh-HK'},
  {label: 'Arabic', value: 'ar'},
  {label: 'French', value: 'fr-FR'},
  {label: 'German', value: 'de-DE'},
  {label: 'Japanese', value: 'ja-JP'},
  {label: 'Korean', value: 'ko-KR'},
  {label: 'Portuguese', value: 'pt-PT'},
  {label: 'Spanish', value: 'es-ES'},
  {label: 'Italian', value: 'it-IT'},
  {label: 'Indonesian', value: 'id_ID'},
];

export function getLanguageLabel(
  languageCode: LanguageType[],
): string | undefined {
  const langLabels = languageCode.map((langCode) => {
    return langData.find((data) => data.value === langCode).label;
  });
  return langLabels ? langLabels.join(',') : undefined;
}

interface LanguageSelectorPopup {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<SetStateAction<boolean>>;
  onConfirm: (param: boolean) => void;
  isFirstTimePopupOpen?: boolean;
}

const LanguageSelectorPopup = (props: LanguageSelectorPopup) => {
  const {isFirstTimePopupOpen = false} = props;
  const [isOpen, setIsOpen] = React.useState(false);
  const isDesktop = useIsDesktop()('popup');
  const heading = isFirstTimePopupOpen
    ? 'Set Spoken Language'
    : 'Change Spoken Language';
  const subHeading = `What language(s) are being spoken by everyone in this meeting?`;
  const cancelBtnLabel = 'CANCEL';
  const ConfirmBtnLabel = 'CONFIRM';

  const {language, setLanguage} = useCaption();
  const prevLangChanged = React.useRef<boolean>(false);
  const [error, setError] = React.useState<boolean>(false);
  const [selectedValues, setSelectedValues] =
    React.useState<LanguageType[]>(language);
  const isNotValidated =
    isOpen && (selectedValues.length === 0 || selectedValues.length === 2);

  React.useEffect(() => setSelectedValues(language), [language]);
  return (
    <Popup
      modalVisible={props.modalVisible}
      setModalVisible={props.setModalVisible}
      showCloseIcon={false}
      contentContainerStyle={styles.contentContainer}>
      <Text style={styles.heading}>{heading}</Text>
      <Spacer size={8} />
      <Text style={styles.subHeading}>{subHeading}</Text>
      <Spacer size={32} />
      <View>
        <DropdownMulti
          label=""
          data={langData}
          enabled={true}
          selectedValues={selectedValues}
          setSelectedValues={setSelectedValues}
          defaultSelectedValues={language || ['en-US']}
          error={error}
          setError={setError}
          onSelect={(value) => {
            //  setError(false);
            prevLangChanged.current = true;
            setLanguage(value); //chnage on confirm
          }}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      </View>
      <Spacer size={8} />
      <Text style={[styles.subHeading, isNotValidated && styles.errorTxt]}>
        {selectedValues.length === 0
          ? 'Choose at least one language to proceed'
          : 'You can choose a maximum of two languages'}
      </Text>
      <Spacer size={32} />
      <View style={isDesktop ? styles.btnContainer : styles.btnContainerMobile}>
        <View style={isDesktop && {flex: 1}}>
          <TertiaryButton
            containerStyle={{
              width: '100%',
              height: 48,
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: ThemeConfig.BorderRadius.medium,
            }}
            text={cancelBtnLabel}
            textStyle={styles.btnText}
            onPress={() => props.setModalVisible(false)}
          />
        </View>
        <Spacer
          size={isDesktop ? 10 : 20}
          horizontal={isDesktop ? true : false}
        />
        <View style={isDesktop && {flex: 1}}>
          <PrimaryButton
            containerStyle={{
              minWidth: 'auto',
              width: '100%',
              borderRadius: ThemeConfig.BorderRadius.medium,
              height: 48,
              paddingVertical: 12,
              paddingHorizontal: 12,
            }}
            disabled={selectedValues.length === 0}
            text={ConfirmBtnLabel}
            textStyle={styles.btnText}
            onPress={() => {
              console.log(selectedValues);
              if (selectedValues.length === 0) {
                // setError(true);
                return;
              }
              // setLanguage(selectedValues);
              props.onConfirm(prevLangChanged.current);
              prevLangChanged.current = false;
            }}
          />
        </View>
      </View>
    </Popup>
  );
};

export default LanguageSelectorPopup;

const styles = StyleSheet.create({
  btnContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
  },
  btnContainerMobile: {
    flexDirection: 'column-reverse',
  },
  contentContainer: {
    padding: 24,
    maxWidth: 446,
  },
  heading: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 24,
    color: $config.FONT_COLOR,
  },
  subHeading: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 20,
    color: $config.FONT_COLOR + hexadecimalTransparency['70%'],
  },

  errorTxt: {
    color: $config.SEMANTIC_ERROR,
    fontWeight: '600',
  },
});