import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import IconButton, {IconButtonProps} from '../../atoms/IconButton';
import StorageContext from '../../components/StorageContext';
import {useCaption} from './useCaption';
import {useMeetingInfo} from '../../components/meeting-info/useMeetingInfo';
import events, {EventPersistLevel} from '../../rtm-events-api';
import LanguageSelectorPopup from './LanguageSelectorPopup';
import useSTTAPI from './useSTTAPI';
import {EventNames} from '../../rtm-events';
import useGetName from '../../utils/useGetName';

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
  const {
    showToolTip = false,
    showLabel = $config.ICON_TEXT,
    disabled = false,
    isOnActionSheet = false,
    isMobileView = false,
    closeActionSheet,
  } = props;
  const {
    isCaptionON,
    setIsCaptionON,
    isSTTActive,
    setIsSTTActive,
    language: prevLang,
    setLanguage,
  } = useCaption();
  const {store} = React.useContext(StorageContext);
  const {
    data: {roomId, isHost},
  } = useMeetingInfo();
  const [isLanguagePopupOpen, setLanguagePopup] =
    React.useState<boolean>(false);

  const isFirstTimePopupOpen = React.useRef(false);
  const {start, restart, isAuthorizedSTTUser} = useSTTAPI();
  const username = useGetName();
  const isDisabled = !isAuthorizedSTTUser();
  const label = isCaptionON ? 'Hide Caption' : 'Show Caption';
  const iconButtonProps: IconButtonProps = {
    onPress: () => {
      if (isSTTActive) {
        // is lang popup has been shown once for any user in meeting
        setIsCaptionON(prev => !prev);
        closeActionSheet();
      } else {
        isFirstTimePopupOpen.current = true;
        setLanguagePopup(true);
      }
    },
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
      text: showLabel ? label : '',
      textColor: $config.FONT_COLOR,
    },
  };
  iconButtonProps.isOnActionSheet = isOnActionSheet;
  if (!isOnActionSheet) {
    iconButtonProps.toolTipMessage = label;
  }

  const onConfirm = async (langChanged, language) => {
    setLanguagePopup(false);
    closeActionSheet();
    isFirstTimePopupOpen.current = false;
    const method = isCaptionON ? 'stop' : 'start';
    if (method === 'stop') return; // not closing the stt service as it will stop for whole channel
    if (method === 'start' && isSTTActive === true) return; // not triggering the start service if STT Service already started by anyone else in the channel
    setIsCaptionON(prev => !prev);
    try {
      const res = await start(language);
      if (res?.message.includes('STARTED')) {
        // channel is already started now restart
        await restart(language);
      }
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
        isFirstTimePopupOpen={isFirstTimePopupOpen.current}
      />
    </View>
  );
};

export default CaptionIcon;

const styles = StyleSheet.create({});
