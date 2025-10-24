import {StyleSheet, View} from 'react-native';
import React from 'react';
import {SidePanelType, useSidePanel} from 'customization-api';
import IconButton, {IconButtonProps} from '../../atoms/IconButton';
import LanguageSelectorPopup from './LanguageSelectorPopup';
import {LanguageTranslationConfig, useCaption} from './useCaption';
import useSTTAPI from './useSTTAPI';
import {useString} from '../../utils/useString';
import {toolbarItemTranscriptText} from '../../language/default-labels/videoCallScreenLabels';
import {useToolbarProps} from '../../atoms/ToolbarItem';

interface TranscriptIconProps {
  plainIconHoverEffect?: boolean;
  showToolTip?: boolean;
  showLabel?: boolean;
  disabled?: boolean;
  isOnActionSheet?: boolean;
  isMobileView?: boolean;
}

const TranscriptIcon = (props: TranscriptIconProps) => {
  const {label: labelCustom = null, onPress: onPressCustom = null} =
    useToolbarProps();
  const {setSidePanel, sidePanel} = useSidePanel();
  const {
    showToolTip = false,
    showLabel = $config.ICON_TEXT,
    disabled = false,
    isOnActionSheet = false,
    isMobileView = false,
  } = props;

  // const {start} = useSTTAPI();
  const {isSTTActive, isSTTError, handleTranslateConfigChange} = useCaption();
  const isDisabled = false;
  const [isLanguagePopupOpen, setLanguagePopup] =
    React.useState<boolean>(false);
  const isFirstTimePopupOpen = React.useRef(false);

  const isTranscriptON = sidePanel === SidePanelType.Transcript;
  const onPress = () => {
    if (isSTTError) {
      setSidePanel(
        isTranscriptON ? SidePanelType.None : SidePanelType.Transcript,
      );
      return;
    }
    if (isSTTActive) {
      setSidePanel(
        isTranscriptON ? SidePanelType.None : SidePanelType.Transcript,
      );
    } else {
      isFirstTimePopupOpen.current = true;
      setLanguagePopup(true);
    }
  };

  const label = useString<boolean>(toolbarItemTranscriptText);
  const iconButtonProps: IconButtonProps = {
    onPress: onPressCustom || onPress,
    iconProps: {
      name: 'transcript',
      iconBackgroundColor: isTranscriptON
        ? $config.PRIMARY_ACTION_BRAND_COLOR
        : '',
      tintColor: isDisabled
        ? $config.SEMANTIC_NEUTRAL
        : isTranscriptON
        ? $config.PRIMARY_ACTION_TEXT_COLOR
        : $config.SECONDARY_ACTION_COLOR,
    },
    disabled: isDisabled,
    btnTextProps: {
      text: showLabel
        ? isOnActionSheet
          ? labelCustom || label(isTranscriptON)?.replace(' ', '\n')
          : labelCustom || label(isTranscriptON)
        : '',
      textColor: $config.FONT_COLOR,
      numberOfLines: 2,
    },
  };
  iconButtonProps.isOnActionSheet = isOnActionSheet;
  if (!isOnActionSheet) {
    iconButtonProps.toolTipMessage = label(isTranscriptON);
  }

  const onConfirm = async (inputTranslateConfig: LanguageTranslationConfig) => {
    setLanguagePopup(false);

    if (!isTranscriptON) {
      setSidePanel(SidePanelType.Transcript);
    } else {
      setSidePanel(SidePanelType.None);
    }
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

export default TranscriptIcon;

const styles = StyleSheet.create({});
