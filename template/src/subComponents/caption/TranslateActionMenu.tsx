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
    confirmTargetLanguageChange,
    globalSttState,
    isLangChangeInProgress,
  } = useCaption();

  const sourceLang = globalSttState.globalSpokenLanguage;
  const globalTargets = globalSttState.globalTranslationTargets || [];
  const isGlobalTargetsFull = globalTargets.length >= 10;

  const actionMenuitems: ActionMenuItem[] = [];

  // Off option
  actionMenuitems.push({
    title: 'Off',
    endIcon: !selectedTranslationLanguage ? 'tick-fill' : undefined,
    iconColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    textColor: $config.FONT_COLOR,
    iconPosition: 'end',
    disabled: isLangChangeInProgress,
    titleStyle: {
      paddingLeft: 14,
    },
    onPress: () => {
      confirmTargetLanguageChange(null);
      setActionMenuVisible(false);
    },
  });

  // Move selected translation language to the top
  const sortedLangData = [...langData].sort((a, b) => {
    if (a.value === selectedTranslationLanguage) {
      return -1;
    }
    if (b.value === selectedTranslationLanguage) {
      return 1;
    }
    return 0;
  });

  sortedLangData.forEach(lang => {
    const selectedLang = lang.value === selectedTranslationLanguage;
    // If global is full or if its a source disable all langs
    const disabled = isGlobalTargetsFull || lang.value === sourceLang;
    actionMenuitems.push({
      title: lang.label,
      endIcon: selectedLang ? 'tick-fill' : undefined,
      iconPosition: 'end',
      iconColor: disabled
        ? $config.FONT_COLOR + hexadecimalTransparency['40%']
        : $config.PRIMARY_ACTION_BRAND_COLOR,
      textColor: disabled
        ? $config.FONT_COLOR + hexadecimalTransparency['40%']
        : $config.FONT_COLOR,
      disabled,
      titleStyle: {
        paddingLeft: 14,
      },
      onPress: async () => {
        if (disabled) {
          return;
        }
        confirmTargetLanguageChange(lang.value);
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
