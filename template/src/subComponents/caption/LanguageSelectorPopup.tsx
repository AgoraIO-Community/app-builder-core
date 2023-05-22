import React, {SetStateAction, useContext} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Spacer from '../../atoms/Spacer';
import Popup from '../../atoms/Popup';
import TertiaryButton from '../../atoms/TertiaryButton';
import PrimaryButton from '../../atoms/PrimaryButton';
import ThemeConfig from '../../theme';
import {useIsDesktop} from '../../utils/common';
import Dropdown from '../../atoms/Dropdown';
import {useCaption} from './useCaption';

export type LanguageType = 'en-US' | 'hi-IN' | 'zh-CN' | '';

interface LanguageData {
  label: string;
  value: LanguageType;
}

const langData: LanguageData[] = [
  {label: 'English', value: 'en-US'},
  {label: 'Hindi', value: 'hi-IN'},
  {label: 'Chinese', value: 'zh-CN'},
];

export function getLanguageLabel(languageCode: string): string | undefined {
  const language = langData.find((data) => data.value === languageCode);
  return language ? language.label : undefined;
}

interface LanguageSelectorPopup {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<SetStateAction<boolean>>;
  onConfirm: () => void;
}

const LanguageSelectorPopup = (props: LanguageSelectorPopup) => {
  const isDesktop = useIsDesktop()('popup');
  const heading = 'Change Language';
  const subHeading =
    'Captions and transcript will appear in this language for everyone in the meeting';
  const cancelBtnLabel = 'CANCEL';
  const ConfirmBtnLabel = 'CONFIRM';

  const {language, setLanguage} = useCaption();
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
      <Dropdown
        label=""
        icon="globe"
        data={langData}
        enabled={true}
        selectedValue={language || 'en-US'}
        onSelect={({label, value}) => {
          setLanguage(value);
          console.warn('selected lang', label);
        }}
      />
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
            text={ConfirmBtnLabel}
            textStyle={styles.btnText}
            onPress={props.onConfirm}
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
    maxWidth: 342,
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
    color: $config.FONT_COLOR,
  },
});
