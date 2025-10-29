import React, {SetStateAction} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Spacer from '../../atoms/Spacer';
import Popup from '../../atoms/Popup';
import TertiaryButton from '../../atoms/TertiaryButton';
import PrimaryButton from '../../atoms/PrimaryButton';
import ThemeConfig from '../../theme';
import {useIsDesktop} from '../../utils/common';
import {LanguageTranslationConfig, useCaption} from './useCaption';
import Dropdown from '../../atoms/Dropdown';
import DropdownMulti from '../../atoms/DropDownMulti';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import Loading from '../Loading';
import {LanguageType, langData, hasConfigChanged} from './utils';
import {useString} from '../../utils/useString';
import {useLocalUid} from '../../../agora-rn-uikit';
// import {useRoomInfo} from '../../components/room-info/useRoomInfo';
import {
  sttChangeLanguagePopupHeading,
  sttChangeLanguagePopupPrimaryBtnText,
  sttLanguageChangeInProgress,
} from '../../language/default-labels/videoCallScreenLabels';
import {cancelText} from '../../language/default-labels/commonLabels';

interface LanguageSelectorPopup {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<SetStateAction<boolean>>;
  onConfirm: (inputTranslationConfig: LanguageTranslationConfig) => void;
}

const LanguageSelectorPopup = (props: LanguageSelectorPopup) => {
  const isDesktop = useIsDesktop()('popup');
  const heading = useString<boolean>(sttChangeLanguagePopupHeading);
  const cancelBtnLabel = useString(cancelText)();
  const ConfirmBtnLabel = useString(sttChangeLanguagePopupPrimaryBtnText)();
  const languageChangeInProgress = useString(sttLanguageChangeInProgress)();

  const {
    translationConfig,
    isLangChangeInProgress,
    isSTTActive,
    remoteSpokenLanguages,
  } = useCaption();
  const localUid = useLocalUid();
  console.log(
    '[STT_PER_USER_BOT] remoteSpokenLanguages',
    remoteSpokenLanguages,
  );

  // const {sttLanguage} = useRoomInfo();
  const [error, setError] = React.useState<boolean>(false);
  const [isTargetOpen, setIsTargetOpen] = React.useState(false);

  const [inputTranslationConfig, setInputTranslationConfig] =
    React.useState<LanguageTranslationConfig>({
      source: [],
      targets: [],
    });

  const isNotValidated =
    inputTranslationConfig?.source.length === 0 ||
    inputTranslationConfig?.targets.length === 0 ||
    inputTranslationConfig?.targets.length > 10;

  // Create source language options with "None" prepended
  const sourceLanguageOptions = React.useMemo(() => {
    // return [{label: 'None', value: 'none'}, ...langData];
    return [...langData];
  }, []);

  // All remote languages except for own user
  const suggestedRemoteTargetLangs = React.useMemo(() => {
    const remoteLangs = Object.entries(remoteSpokenLanguages)
      .filter(([uid, lang]) => uid !== String(localUid) && lang)
      .map(([, lang]) => lang);

    return Array.from(new Set(remoteLangs));
  }, [remoteSpokenLanguages, localUid]);

  // Initialize or update source/targets dynamically when modal opens
  React.useEffect(() => {
    if (!props.modalVisible) {
      return;
    }
    console.log(
      '[STT_PER_USER_BOT] language selecter popup opened',
      translationConfig,
    );

    const mergedTargets = Array.from(
      new Set([
        ...(translationConfig.targets || []),
        ...suggestedRemoteTargetLangs,
      ]),
    );

    setInputTranslationConfig({
      source: translationConfig.source,
      targets: mergedTargets,
    });

    console.log('[STT_PER_USER_BOT] mergedTargets —', mergedTargets);
    console.log(
      '[STT_PER_USER_BOT] all target langs —',
      suggestedRemoteTargetLangs,
    );
  }, [props.modalVisible, translationConfig, suggestedRemoteTargetLangs]);

  const onConfirmPress = async () => {
    if (isNotValidated) {
      return;
    }

    console.log('[LANG_SELECTOR] Confirm pressed:', {
      inputTranslationConfig,
    });

    try {
      props?.onConfirm(inputTranslationConfig);
      // props.setModalVisible(false);
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
      title={heading(isSTTActive ? false : true)}>
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
          {/* Target Languages */}
          <View>
            <Text style={styles.labelText}>Meeting Spoken languages</Text>
            <Spacer size={8} />
            <DropdownMulti
              selectedValues={inputTranslationConfig.targets}
              setSelectedValues={(val: LanguageType[]) =>
                setInputTranslationConfig(prev => ({
                  ...prev,
                  targets: val,
                }))
              }
              defaultSelectedValues={inputTranslationConfig.targets}
              error={error}
              setError={setError}
              isOpen={isTargetOpen}
              setIsOpen={setIsTargetOpen}
              maxAllowedSelection={10}
              protectedLanguages={Array.from(
                new Set([...suggestedRemoteTargetLangs]),
              )}
            />
            <Spacer size={2} />
            <Text style={styles.infoText}>
              Auto populated by spoken languages of other users once they join
              the room.
            </Text>
          </View>

          <Spacer size={20} />

          {/* Source Language */}
          <View>
            <Text style={styles.labelText}>Translate to</Text>
            <Spacer size={8} />
            <Dropdown
              label="Select language"
              data={sourceLanguageOptions}
              selectedValue={inputTranslationConfig.source[0] || ''}
              onSelect={item =>
                setInputTranslationConfig(prev => ({
                  ...prev,
                  source: [item.value as LanguageType],
                }))
              }
              enabled={true}
            />
            <Spacer size={2} />
            <Text style={styles.infoText}>
              Captions and transcript will appear in this language for you.
            </Text>
          </View>
          <Spacer size={8} />
          {/* <Text style={[styles.subHeading, isNotValidated && styles.errorTxt]}>
            {isNotValidated
              ? 'Please select both source and target languages'
              : 'You can select up to 10 target languages'}
          </Text> */}
          <Spacer size={32} />

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
                disabled={
                  isNotValidated ||
                  !hasConfigChanged(translationConfig, inputTranslationConfig)
                }
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
