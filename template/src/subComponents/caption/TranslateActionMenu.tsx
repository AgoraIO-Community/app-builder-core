import {useWindowDimensions, View} from 'react-native';
import React from 'react';
import {useCaption} from './useCaption';
import {calculatePosition} from '../../utils/common';
import ActionMenu, {ActionMenuItem} from '../../../src/atoms/ActionMenu';
import {langData} from './utils';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';

export interface TranslateActionMenuProps {
  actionMenuVisible: boolean;
  setActionMenuVisible: (actionMenuVisible: boolean) => void;
  btnRef: React.RefObject<View>;
}

export const TranslateActionMenu = (props: TranslateActionMenuProps) => {
  const {actionMenuVisible, setActionMenuVisible, btnRef} = props;
  const [modalPosition, setModalPosition] = React.useState({});
  const [isPosCalculated, setIsPosCalculated] = React.useState(false);
  const {width: globalWidth, height: globalHeight} = useWindowDimensions();
  const {
    selectedTranslationLanguage,
    setSelectedTranslationLanguage,
    globalSttState,
  } = useCaption();

  const sourceLang = globalSttState.globalSpokenLanguage;
  const globalTargets = globalSttState.globalTranslationTargets || [];
  const isGlobalTargetsFull = globalTargets.length >= 10;

  let availableLanguagesToTranslate = langData.filter(
    l => l.value !== sourceLang,
  );

  const actionMenuitems: ActionMenuItem[] = [];

  // Off option
  actionMenuitems.push({
    title: 'Off',
    icon: selectedTranslationLanguage === '' ? 'tick-fill' : undefined,
    iconColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    textColor: $config.FONT_COLOR,
    iconPosition: 'end',
    disabled: false,
    onPress: () => {
      setSelectedTranslationLanguage('');
      setActionMenuVisible(false);
    },
  });

  if (selectedTranslationLanguage) {
    const selectedLangObj = langData.find(
      l => l.value === selectedTranslationLanguage,
    );

    if (selectedLangObj) {
      actionMenuitems.push({
        title: selectedLangObj.label,
        icon: 'tick-fill',
        iconColor: $config.PRIMARY_ACTION_BRAND_COLOR,
        textColor: $config.FONT_COLOR,
        iconPosition: 'end',
        disabled: false,
        onPress: () => {
          setActionMenuVisible(false);
        },
      });
    }
  }

  availableLanguagesToTranslate.forEach(lang => {
    if (lang.value === selectedTranslationLanguage) {
      return;
    } // skip selected (already added above)

    const alreadyInGlobal = globalTargets.includes(lang.value);

    // If global is full and language is NOT in globalTargets → DISABLE
    const disabled = isGlobalTargetsFull || alreadyInGlobal;

    actionMenuitems.push({
      title: lang.label,
      icon: undefined,
      iconPosition: 'end',
      iconColor: disabled
        ? $config.FONT_COLOR + hexadecimalTransparency['40%']
        : $config.PRIMARY_ACTION_BRAND_COLOR,
      textColor: disabled
        ? $config.FONT_COLOR + hexadecimalTransparency['40%']
        : $config.FONT_COLOR,
      disabled,
      onPress: async () => {
        if (disabled) {
          return;
        }
        // CASE 1: If already global → simply select
        if (alreadyInGlobal) {
          console.log('supriya-stt already in global');
          setSelectedTranslationLanguage(lang.value);
          setActionMenuVisible(false);
          return;
        }
        console.log('supriya-stt not in global new target');
        // CASE 2: Need to ADD new global target
        // (only allowed if globalTargets < 10)
        const newTargets = [...globalTargets, lang.value];
        console.log('supriya-stt newTargets: ', newTargets);

        setSelectedTranslationLanguage(lang.value);
        setActionMenuVisible(false);
      },
    });
  });

  React.useEffect(() => {
    if (actionMenuVisible) {
      btnRef?.current?.measure(
        (
          _fx: number,
          _fy: number,
          localWidth: number,
          localHeight: number,
          px: number,
          py: number,
        ) => {
          const data = calculatePosition({
            px,
            py,
            localWidth,
            localHeight,
            globalHeight,
            globalWidth,
          });
          setModalPosition(data);
          setIsPosCalculated(true);
        },
      );
    }
  }, [actionMenuVisible]);

  return (
    <ActionMenu
      from={'translation'}
      actionMenuVisible={actionMenuVisible && isPosCalculated}
      setActionMenuVisible={setActionMenuVisible}
      modalPosition={modalPosition}
      items={actionMenuitems}
      containerStyle={{
        maxHeight: Math.min(440, globalHeight * 0.6),
        width: 220,
      }}
    />
  );
};
