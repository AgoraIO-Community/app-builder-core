import React, {SetStateAction, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Spacer from '../../atoms/Spacer';
import Popup from '../../atoms/Popup';
import TertiaryButton from '../../atoms/TertiaryButton';
import PrimaryButton from '../../atoms/PrimaryButton';
import ThemeConfig from '../../theme';
import {useIsDesktop} from '../../utils/common';
import {useCaption} from './useCaption';
import Dropdown from '../../atoms/Dropdown';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import Loading from '../Loading';
import {LanguageType, langData} from './utils';
import {useString} from '../../utils/useString';
import {
  sttChangeLanguagePopupHeading,
  sttChangeLanguagePopupPrimaryBtnText,
  sttLanguageChangeInProgress,
} from '../../language/default-labels/videoCallScreenLabels';
import {cancelText} from '../../language/default-labels/commonLabels';

interface LanguageSelectorPopup {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<SetStateAction<boolean>>;
  onConfirm: (newLang: LanguageType) => void;
}

const LanguageSelectorPopup = (props: LanguageSelectorPopup) => {
  const isDesktop = useIsDesktop()('popup');
  const heading = useString<boolean>(sttChangeLanguagePopupHeading);
  const cancelBtnLabel = useString(cancelText)();
  const ConfirmBtnLabel = useString(sttChangeLanguagePopupPrimaryBtnText)();
  const languageChangeInProgress = useString(sttLanguageChangeInProgress)();

  const {globalSttState, isLangChangeInProgress} = useCaption();

  const [draftSpokenLanguage, setDraftSpokenLanguage] = useState<LanguageType>(
    globalSttState?.globalSpokenLanguage || 'en-US',
  );

  const hasSpokenLanguageChanged =
    draftSpokenLanguage !== globalSttState?.globalSpokenLanguage;

  const onConfirmPress = async () => {
    try {
      props?.onConfirm(draftSpokenLanguage);
    } catch (err) {
      console.error('[LANG_SELECTOR] Error confirming STT config:', err);
    }
  };

  return (
    <Popup
      modalVisible={props.modalVisible}
      setModalVisible={props.setModalVisible}
      showCloseIcon={true}
      contentContainerStyle={styles.contentContainer}
      title={heading(globalSttState?.globalSttEnabled ? false : true)}
      subtitle={
        globalSttState?.globalSttEnabled
          ? ''
          : 'Speech-to-text service will turn on for everyone in the call.'
      }>
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
          {/* Source Language */}
          <View>
            <Text style={styles.labelText}>Meeting Spoken language</Text>
            <Spacer size={8} />
            <Dropdown
              label="Select language"
              data={[...langData]}
              selectedValue={draftSpokenLanguage}
              onSelect={item => {
                if (item.value) {
                  setDraftSpokenLanguage(item.value as LanguageType);
                }
              }}
              enabled={true}
            />
            <Spacer size={8} />
            <Text style={styles.infoText}>
              {globalSttState?.globalSttEnabled
                ? 'Updates the spoken-language for everyone in the call.'
                : 'Sets the spoken-language for everyone in the call.'}
            </Text>
          </View>

          <Spacer size={20} />

          <View
            style={isDesktop ? styles.btnContainer : styles.btnContainerMobile}>
            <View style={isDesktop && {flex: 1}}>
              <TertiaryButton
                containerStyle={styles.button}
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
                containerStyle={styles.button}
                disabled={!hasSpokenLanguageChanged}
                text={ConfirmBtnLabel}
                textStyle={styles.btnText}
                onPress={onConfirmPress}
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
  btnContainerMobile: {
    flexDirection: 'column-reverse',
  },
  contentContainer: {
    padding: 24,
    maxWidth: 500,
    width: '100%',
  },
  button: {
    width: '100%',
    minWidth: 'auto',
    height: 48,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: ThemeConfig.BorderRadius.medium,
  },
  btnText: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
  },
  labelText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 20,
    color: $config.FONT_COLOR,
  },
  infoText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.tiny,
    lineHeight: 12,
    color: $config.SEMANTIC_NEUTRAL,
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
