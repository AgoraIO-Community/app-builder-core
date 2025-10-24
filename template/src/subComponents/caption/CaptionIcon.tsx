import {View} from 'react-native';
import React from 'react';
import IconButton, {IconButtonProps} from '../../atoms/IconButton';
import {LanguageTranslationConfig, useCaption} from './useCaption';
import LanguageSelectorPopup from './LanguageSelectorPopup';
import useSTTAPI from './useSTTAPI';
import {useString} from '../../utils/useString';
import {toolbarItemCaptionText} from '../../language/default-labels/videoCallScreenLabels';
import {useToolbarProps} from '../../atoms/ToolbarItem';

interface CaptionIconProps {
  plainIconHoverEffect?: boolean;
  showToolTip?: boolean;
  showLabel?: boolean;
  disabled?: boolean;
  isOnActionSheet?: boolean;
  isMobileView?: boolean;
  closeActionSheet?: () => void;
}

const CaptionIcon = (props: CaptionIconProps) => {
  const {label: labelCustom = null, onPress: onPressCustom = null} =
    useToolbarProps();
  const {
    showLabel = $config.ICON_TEXT,
    isOnActionSheet = false,
    closeActionSheet,
  } = props;
  const {
    isCaptionON,
    setIsCaptionON,
    isSTTActive,
    isSTTError,
    handleTranslateConfigChange,
  } = useCaption();

  const [isLanguagePopupOpen, setLanguagePopup] =
    React.useState<boolean>(false);

  const isFirstTimePopupOpen = React.useRef(false);
  // const {start, restart, isAuthorizedSTTUser} = useSTTAPI();
  const isDisabled = false;
  const captionLabel = useString<boolean>(toolbarItemCaptionText);
  const label = captionLabel(isCaptionON);
  const onPress = () => {
    if (isSTTError) {
      setIsCaptionON(prev => !prev);
      closeActionSheet();
      return;
    }
    if (isSTTActive) {
      // is lang popup has been shown once for any user in meeting
      setIsCaptionON(prev => !prev);
      closeActionSheet();
    } else {
      isFirstTimePopupOpen.current = true;
      setLanguagePopup(true);
    }
  };
  const iconButtonProps: IconButtonProps = {
    onPress: onPressCustom || onPress,
    disabled: isDisabled,
    iconProps: {
      name: isCaptionON ? 'captions-off' : 'captions',
      iconBackgroundColor: isCaptionON
        ? $config.PRIMARY_ACTION_BRAND_COLOR
        : '',
      tintColor: isDisabled
        ? $config.SEMANTIC_NEUTRAL
        : isCaptionON
        ? $config.PRIMARY_ACTION_TEXT_COLOR
        : $config.SECONDARY_ACTION_COLOR,
    },
    btnTextProps: {
      text: showLabel
        ? isOnActionSheet
          ? labelCustom || label?.replace(' ', '\n')
          : labelCustom || label
        : '',
      textColor: $config.FONT_COLOR,
      numberOfLines: 2,
    },
  };
  iconButtonProps.isOnActionSheet = isOnActionSheet;
  if (!isOnActionSheet) {
    iconButtonProps.toolTipMessage = label;
  }

  const onConfirm = async (inputTranslateConfig: LanguageTranslationConfig) => {
    setLanguagePopup(false);
    closeActionSheet();
    isFirstTimePopupOpen.current = false;
    // const method = isCaptionON ? 'stop' : 'start';
    // if (method === 'stop') {
    //   return;
    // } // not closing the stt service as it will stop for whole channel
    // if (method === 'start' && isSTTActive === true) {
    //   return;
    // } // not triggering the start service if STT Service already started by anyone else in the channel
    setIsCaptionON(prev => !prev);
    try {
      handleTranslateConfigChange(inputTranslateConfig);
    } catch (error) {
      console.log('eror in starting stt', error);
    }
  };

  return (
    <View>
      <IconButton {...iconButtonProps} />
      <LanguageSelectorPopup
        modalVisible={isLanguagePopupOpen}
        setModalVisible={setLanguagePopup}
        onConfirm={onConfirm}
      />
    </View>
  );
};

export default CaptionIcon;
