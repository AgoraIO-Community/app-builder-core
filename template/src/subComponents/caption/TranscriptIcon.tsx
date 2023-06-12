import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {SidePanelType, useSidePanel} from 'customization-api';
import IconButton, {IconButtonProps} from '../../atoms/IconButton';
import LanguageSelectorPopup from './LanguageSelectorPopup';
import {useCaption} from './useCaption';
import useSTTAPI from './useSTTAPI';

interface TranscriptIconProps {
  plainIconHoverEffect?: boolean;
  showToolTip?: boolean;
  showLabel?: boolean;
  disabled?: boolean;
  isOnActionSheet?: boolean;
  isMobileView?: boolean;
}

const TranscriptIcon = (props: TranscriptIconProps) => {
  const {setSidePanel, sidePanel} = useSidePanel();
  const {
    showToolTip = false,
    showLabel = $config.ICON_TEXT,
    disabled = false,
    isOnActionSheet = false,
    isMobileView = false,
  } = props;
  const {start} = useSTTAPI();

  const {isTranscriptON, setIsTranscriptON, isSTTActive} = useCaption();

  const [isLanguagePopupOpen, setLanguagePopup] =
    React.useState<boolean>(false);
  const isLangPopupOpenedOnce = React.useRef(false);

  //const isTranscriptON = sidePanel === SidePanelType.Transcript;
  const onPress = () => {
    if (isLangPopupOpenedOnce.current || isSTTActive) {
      setIsTranscriptON((prev) => !prev);
      !isTranscriptON
        ? setSidePanel(SidePanelType.Transcript)
        : setSidePanel(SidePanelType.None);
    } else {
      setLanguagePopup(true);
    }
  };

  const label = isTranscriptON ? 'Hide Transcript' : 'Show Transcript';
  const iconButtonProps: IconButtonProps = {
    onPress,
    iconProps: {
      name: 'stt',
      iconBackgroundColor: isTranscriptON
        ? $config.PRIMARY_ACTION_BRAND_COLOR
        : '',
      tintColor: isTranscriptON
        ? $config.PRIMARY_ACTION_TEXT_COLOR
        : $config.SECONDARY_ACTION_COLOR,
    },
    btnTextProps: {
      text: showLabel ? label : '',
      textColor: $config.FONT_COLOR,
    },
  };
  iconButtonProps.isOnActionSheet = isOnActionSheet;
  if (!isOnActionSheet) {
    iconButtonProps.toolTipMessage = label;
  }
  const toggleSTT = async (method: string) => {
    // handleSTT
    setIsTranscriptON((prev) => !prev);
    if (method === 'stop') return; // not closing the stt service as it will stop for whole channel
    if (method === 'start' && isSTTActive === true) return; // not triggering the start service if STT Service already started by anyone else in the channel
    start();
  };

  const onLanguageChange = () => {
    // lang would be set on confirm click
    toggleSTT('start');
    if (!isTranscriptON) {
      setSidePanel(SidePanelType.Transcript);
    } else {
      setSidePanel(SidePanelType.None);
    }

    setLanguagePopup(false);
    isLangPopupOpenedOnce.current = true;
  };

  return (
    <View>
      <IconButton {...iconButtonProps} />
      <LanguageSelectorPopup
        modalVisible={isLanguagePopupOpen}
        setModalVisible={setLanguagePopup}
        onConfirm={onLanguageChange}
      />
    </View>
  );
};

export default TranscriptIcon;

const styles = StyleSheet.create({});
