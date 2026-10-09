import {View} from 'react-native';
import React from 'react';
import IconButton, {IconButtonProps} from '../../atoms/IconButton';
import {useCaption} from './useCaption';
import {useVideoCall} from '../../components/useVideoCall';
import {useString} from '../../utils/useString';
import {toolbarItemCaptionText} from '../../language/default-labels/videoCallScreenLabels';
import {useToolbarProps} from '../../atoms/ToolbarItem';
import {LanguageType} from './utils';

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
    disabled = false,
    isOnActionSheet = false,
    closeActionSheet,
  } = props;
  const {
    isCaptionON,
    setIsCaptionON,
    isSTTActive,
    sttDepsReady,
    confirmSpokenLanguageChange,
  } = useCaption();

  const {openSpokenLanguagePopup, closeSpokenLanguagePopup} = useVideoCall();
  const isDisabled = disabled || !sttDepsReady;

  // const isFirstTimePopupOpen = React.useRef(false);
  // const {start, restart, isAuthorizedSTTUser} = useSTTAPI();
  // const isDisabled = !isAuthorizedSTTUser();
  const captionLabel = useString<boolean>(toolbarItemCaptionText);
  const label = captionLabel(isCaptionON);
  const onPress = () => {
    // Hiding an already-visible caption is a local UI action and must not be
    // blocked by a failed or delayed STT API request.
    if (isCaptionON) {
      setIsCaptionON(false);
      closeActionSheet?.();
    } else if (!isSTTActive) {
      openSpokenLanguagePopup(onConfirm);
    } else {
      setIsCaptionON(true);
      closeActionSheet?.();
    }
    // if (isSTTActive) {
    //   // is lang popup has been shown once for any user in meeting
    //   setIsCaptionON(prev => !prev);
    //   closeActionSheet();
    // } else {
    //   // isFirstTimePopupOpen.current = true;
    //   setLanguagePopup(true);
    // }
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
      textColor: isDisabled ? $config.SEMANTIC_NEUTRAL : $config.FONT_COLOR,
      numberOfLines: 2,
    },
  };
  iconButtonProps.isOnActionSheet = isOnActionSheet;
  if (!isOnActionSheet) {
    iconButtonProps.toolTipMessage = label;
  }

  const onConfirm = async (newSpokenLang: LanguageType) => {
    try {
      closeActionSheet?.();
      closeSpokenLanguagePopup();
      setIsCaptionON(true);
      await confirmSpokenLanguageChange(newSpokenLang);
    } catch (error) {
      setIsCaptionON(false);
      console.log('error in starting stt', error);
      // State is NOT changed on error, user can retry
    }
  };

  return (
    <View>
      <IconButton {...iconButtonProps} />
    </View>
  );
};

export default CaptionIcon;
