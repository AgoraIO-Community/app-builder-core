import React, {SetStateAction} from 'react';
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
import Loading from '../Loading';
import {LanguageType} from './utils';
import {useString} from '../../utils/useString';
import {useRoomInfo} from '../../components/room-info/useRoomInfo';
import {
  sttChangeLanguagePopupDropdownError,
  sttChangeLanguagePopupDropdownInfo,
  sttChangeLanguagePopupHeading,
  sttChangeLanguagePopupPrimaryBtnText,
  sttChangeLanguagePopupSubHeading,
  sttLanguageChangeInProgress,
} from '../../language/default-labels/videoCallScreenLabels';
import {cancelText} from '../../language/default-labels/commonLabels';

interface LanguageSelectorPopup {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<SetStateAction<boolean>>;
  onConfirm: (param: boolean, lang: LanguageType[], userOwnLang?: LanguageType[]) => void;
  isFirstTimePopupOpen?: boolean;
}

const LanguageSelectorPopup = (props: LanguageSelectorPopup) => {
  const {isFirstTimePopupOpen = false} = props;
  const [isOpen, setIsOpen] = React.useState(false);
  const isDesktop = useIsDesktop()('popup');
  const heading = useString<boolean>(sttChangeLanguagePopupHeading);
  const subHeading = useString(sttChangeLanguagePopupSubHeading)();
  const cancelBtnLabel = useString(cancelText)();
  const ConfirmBtnLabel = useString(sttChangeLanguagePopupPrimaryBtnText)();
  const ddError = useString(sttChangeLanguagePopupDropdownError)();
  const ddInfo = useString(sttChangeLanguagePopupDropdownInfo)();
  const languageChangeInProgress = useString(sttLanguageChangeInProgress)();
  const {language, isLangChangeInProgress, isSTTActive} = useCaption();
  
  const {sttLanguage} = useRoomInfo();

  // Get protected languages from accumulated remoteLang
  const protectedLanguages = React.useMemo(() => {
    return sttLanguage?.remoteLang || [];
  }, [sttLanguage?.remoteLang]);

  const [error, setError] = React.useState<boolean>(false);
  const [selectedValues, setSelectedValues] =
    React.useState<LanguageType[]>(language);
  const isNotValidated =
    isOpen && (selectedValues.length === 0 || selectedValues.length === 4);

  // Initialize selectedValues with current languages plus protected languages
  React.useEffect(() => {
    console.log('LanguagePopup Debug - language:', language);
    console.log('LanguagePopup Debug - protectedLanguages:', protectedLanguages);
    const combinedLanguages = [...language, ...protectedLanguages];
    // Remove duplicates
    const uniqueLanguages = Array.from(new Set(combinedLanguages));
    console.log('LanguagePopup Debug - uniqueLanguages:', uniqueLanguages);
    setSelectedValues(uniqueLanguages);
  }, [language, protectedLanguages]);


  return (
    <Popup
      modalVisible={props.modalVisible}
      setModalVisible={props.setModalVisible}
      showCloseIcon={true}
      contentContainerStyle={styles.contentContainer}
      title={heading(isFirstTimePopupOpen)}
      subtitle={subHeading}>
      {isLangChangeInProgress ? (
        <View style={styles.changeInProgress}>
          <Loading
            text={languageChangeInProgress}
            background="transparent"
            indicatorColor={$config.FONT_COLOR + hexadecimalTransparency['70%']}
            textColor={$config.FONT_COLOR + hexadecimalTransparency['70%']}
          />
        </View>
      ) : (
        <>
          <View>
            <DropdownMulti
              selectedValues={selectedValues}
              setSelectedValues={setSelectedValues}
              defaultSelectedValues={
                language.indexOf('') === -1 ? language : ['en-US']
              }
              error={error}
              setError={setError}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              maxAllowedSelection={4}
              protectedLanguages={protectedLanguages}
            />
          </View>
          <Spacer size={8} />
          <Text style={[styles.subHeading, isNotValidated && styles.errorTxt]}>
            {selectedValues.length === 0 ? ddError : ddInfo}
          </Text>
          <Spacer size={32} />
          <View
            style={isDesktop ? styles.btnContainer : styles.btnContainerMobile}>
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
                disabled={selectedValues.length === 0 }
                text={ConfirmBtnLabel}
                textStyle={styles.btnText}
                onPress={() => {
                  console.log(selectedValues);
                  console.log(language);

                  if (selectedValues.length === 0) {
                    return;
                  }
                  
                  // Get user's own languages (not protected)
                  const userOwnLanguages = selectedValues.filter(lang => !protectedLanguages.includes(lang));
                  
                  // Compare current languages with new selection (ignoring order)
                  const currentLangs = language.slice().sort().join(',');
                  const newLangs = selectedValues.slice().sort().join(',');
                  const isLangChanged = currentLangs !== newLangs || !isSTTActive;
                  
                  // Pass all selected languages for STT API, and user's own for RTM
                  props.onConfirm(isLangChanged, selectedValues, userOwnLanguages);
                }}
              />
            </View>
          </View>
        </>
      )}
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
    maxWidth: 500,
    width: '100%',
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
    color: $config.SEMANTIC_WARNING,
    fontWeight: '600',
  },
  changeInProgress: {
    width: '100%',
    height: 162,
    alignSelf: 'center',
  },
});
