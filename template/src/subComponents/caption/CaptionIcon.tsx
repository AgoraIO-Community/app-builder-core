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
import useSTTAPI from './useSTTAPI';
import {EventNames} from '../../rtm-events';
import ImageIcon from '../../atoms/ImageIcon';

interface CaptionIconProps {
  plainIconHoverEffect?: boolean;
  showToolTip?: boolean;
  showLabel?: boolean;
  disabled?: boolean;
  isOnActionSheet?: boolean;
  isMobileView?: boolean;
}

const STT_API_URL = `${$config.BACKEND_ENDPOINT}/v1/stt`;

const startStopSTT = async (
  token: string,
  roomId: string,
  method: string,
  language: string,
): Promise<string> => {
  const response = await fetch(`${STT_API_URL}/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': 'ACoac4ccff5c1ea40d29a97fb5b5bd63d78',
      'X-Project-ID': $config.PROJECT_ID,
      authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({passphrase: roomId, lang: language}),
  });
  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
  const res = await response.text();
  return res;
};

const CaptionIcon = (props: CaptionIconProps) => {
  const {
    showToolTip = false,
    showLabel = $config.ICON_TEXT,
    disabled = false,
    isOnActionSheet = false,
    isMobileView = false,
  } = props;
  const {isCaptionON, setIsCaptionON, isSTTActive, setIsSTTActive, language} =
    useCaption();
  const {store} = React.useContext(StorageContext);
  const {
    data: {roomId, isHost},
  } = useMeetingInfo();
  const [isLanguagePopupOpen, setLanguagePopup] =
    React.useState<boolean>(false);

  const {sidePanel, setSidePanel} = useSidePanel();
  const isLangPopupOpenedOnce = React.useRef(false);
  const {start} = useSTTAPI();

  const ToastIcon = ({color}) => (
    <View style={{marginRight: 12, alignSelf: 'center', width: 24, height: 24}}>
      <ImageIcon iconType="plain" tintColor={color} name={'lang-select'} />
    </View>
  );

  React.useEffect(() => {
    events.on(EventNames.STT_ACTIVE, (data) => {
      const payload = JSON.parse(data?.payload);
      setIsSTTActive(payload.active);
    });

    events.on(EventNames.STT_LANGUAGE, (data) => {
      const payload = data?.payload || '';
      Toast.show({
        type: 'info',
        leadingIcon: <ToastIcon color={$config.SECONDARY_ACTION_COLOR} />,
        text1: payload,
        visibilityTime: 3000,
      });
    });
  }, []);

  const toggleSTT = async (method: string, language: string) => {
    // handleSTT

    setIsCaptionON((prev) => !prev);

    if (method === 'stop') return; // not closing the stt service as it will stop for whole channel
    if (method === 'start' && isSTTActive === true) return; // not triggering the start service if STT Service already started by anyone else in the channel

    // try {
    //   const res = await startStopSTT(
    //     store?.token || '',
    //     roomId.host ? roomId.host : '',
    //     method,
    //     language,
    //   );
    //   console.log('response after start/stop stt', res); //TODO: log username of who started stt
    //   // once STT is active in the channel , notify others so that they dont' trigger start again
    //   events.send(
    //     'handleCaption',
    //     JSON.stringify({active: true}),
    //     EventPersistLevel.LEVEL2,
    //   );
    //   setIsSTTActive(true);
    // } catch (error) {
    //   console.log(error);
    // }
    start();
  };

  const onLanguageChange = () => {
    // lang would be set on confirm click
    toggleSTT(isCaptionON ? 'stop' : 'start', language);
    setLanguagePopup(false);
    isLangPopupOpenedOnce.current = true;
  };

  const label = isCaptionON ? 'Hide Caption' : 'Show Caption';
  const iconButtonProps: IconButtonProps = {
    onPress: () => {
      if (isLangPopupOpenedOnce.current || isSTTActive) {
        // is lang popup has been shown once for any user in meeting
        sidePanel === SidePanelType.Transcript &&
          !isCaptionON &&
          setSidePanel(SidePanelType.None);
        toggleSTT(isCaptionON ? 'stop' : 'start', language);
      } else {
        setLanguagePopup(true);
      }
    },
    iconProps: {
      name: 'closed-caption',
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

export default CaptionIcon;

const styles = StyleSheet.create({});
