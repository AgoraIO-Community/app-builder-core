import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {SidePanelType, useSidePanel} from 'customization-api';
import IconButton, {IconButtonProps} from '../../atoms/IconButton';
import StorageContext from '../../components/StorageContext';
import {useCaption} from './useCaption';
import {useMeetingInfo} from '../../components/meeting-info/useMeetingInfo';
import events, {EventPersistLevel} from '../../rtm-events-api';
import Toast from '../../../react-native-toast-message';
import LanguageSelectorPopup from './LanguageSelectorPopup';
import {getLanguageLabel} from './utils';
import useSTTAPI from './useSTTAPI';
import {EventNames} from '../../rtm-events';
import ImageIcon from '../../atoms/ImageIcon';
import {isWebInternal} from '../../utils/common';
import useGetName from '../../utils/useGetName';

interface CaptionIconProps {
  plainIconHoverEffect?: boolean;
  showToolTip?: boolean;
  showLabel?: boolean;
  disabled?: boolean;
  isOnActionSheet?: boolean;
  isMobileView?: boolean;
}

const CaptionIcon = (props: CaptionIconProps) => {
  const {
    showToolTip = false,
    showLabel = $config.ICON_TEXT,
    disabled = false,
    isOnActionSheet = false,
    isMobileView = false,
  } = props;
  const {
    isCaptionON,
    setIsCaptionON,
    isSTTActive,
    setIsSTTActive,
    language,
    setLanguage,
  } = useCaption();
  const {store} = React.useContext(StorageContext);
  const {
    data: {roomId, isHost},
  } = useMeetingInfo();
  const [isLanguagePopupOpen, setLanguagePopup] =
    React.useState<boolean>(false);

  const isFirstTimePopupOpen = React.useRef(false);
  const {start, restart} = useSTTAPI();
  const username = useGetName();

  const ToastIcon = ({color}) => (
    <View style={{marginRight: 12, alignSelf: 'center', width: 24, height: 24}}>
      <ImageIcon iconType="plain" tintColor={color} name={'lang-select'} />
    </View>
  );

  React.useEffect(() => {
    // for native events are set in VideoCallMobileView as this action is action sheet
    if (isWebInternal()) {
      events.on(EventNames.STT_ACTIVE, (data) => {
        const payload = JSON.parse(data?.payload);
        setIsSTTActive(payload.active);
      });

      events.on(EventNames.STT_LANGUAGE, (data) => {
        const payload = JSON.parse(data?.payload);
        const msg = `${
          payload.username
        } changed the spoken language to ${getLanguageLabel(
          payload.language,
        )} `;

        Toast.show({
          type: 'info',
          leadingIcon: <ToastIcon color={$config.SECONDARY_ACTION_COLOR} />,
          text1: msg,
          visibilityTime: 3000,
        });
        // syncing local set language
        payload && setLanguage(payload.language);
      });
    }
  }, []);

  const label = isCaptionON ? 'Hide Caption' : 'Show Caption';
  const iconButtonProps: IconButtonProps = {
    onPress: () => {
      if (isSTTActive) {
        // is lang popup has been shown once for any user in meeting
        setIsCaptionON((prev) => !prev);
      } else {
        isFirstTimePopupOpen.current = true;
        setLanguagePopup(true);
      }
    },
    iconProps: {
      name: 'captions',
      iconBackgroundColor: isCaptionON
        ? $config.PRIMARY_ACTION_BRAND_COLOR
        : '',
      tintColor: isCaptionON
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
    setLanguage(() => language);
    isFirstTimePopupOpen.current = false;
    const method = isCaptionON ? 'stop' : 'start';
    if (method === 'stop') return; // not closing the stt service as it will stop for whole channel
    if (method === 'start' && isSTTActive === true) return; // not triggering the start service if STT Service already started by anyone else in the channel
    setIsCaptionON((prev) => !prev);
    try {
      const res = await start();
      if (res?.message.includes('STARTED')) {
        // channel is already started now restart
        await restart();
      }
      // inform about the language set for stt
      events.send(
        EventNames.STT_LANGUAGE,
        JSON.stringify({username, language}),
        EventPersistLevel.LEVEL3,
      );
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
