import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {SidePanelType, useSidePanel} from 'customization-api';
import IconButton, {IconButtonProps} from '../../atoms/IconButton';
import StorageContext from '../../components/StorageContext';
import {useCaption} from './useCaption';
import {useMeetingInfo} from '../../components/meeting-info/useMeetingInfo';
import events, {EventPersistLevel} from '../../rtm-events-api';

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
): Promise<string> => {
  const response = await fetch(`${STT_API_URL}/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': 'ACoac4ccff5c1ea40d29a97fb5b5bd63d78',
      'X-Project-ID': $config.PROJECT_ID,
      authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({passphrase: roomId}),
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
  const {
    isCaptionON,
    setIsCaptionON,
    isSTTActive,
    setIsSTTActive,
    setTranscript,
  } = useCaption();
  const {store} = React.useContext(StorageContext);
  const {
    data: {roomId, isHost},
  } = useMeetingInfo();

  const toggleSTT = async (method: string) => {
    // handleSTT

    setIsCaptionON((prev) => !prev);

    if (method === 'stop') return; // not closing the stt service as it will stop for whole channel
    if (method === 'start' && isSTTActive === true) return; // not triggering the start service if STT Service already started by anyone else in the channel

    try {
      const res = await startStopSTT(
        store?.token || '',
        roomId.host ? roomId.host : '',
        method,
      );
      console.log('response after start/stop stt', res); //TODO: log username of who started stt
      // once STT is active in the channel , notify others so that they dont' trigger start again
      events.send(
        'handleCaption',
        JSON.stringify({active: true}),
        EventPersistLevel.LEVEL2,
      );
      setIsSTTActive(true);
    } catch (error) {
      console.log(error);
    }
  };

  const label = isCaptionON ? 'Hide Caption' : 'Show Caption';
  const iconButtonProps: IconButtonProps = {
    onPress: () => toggleSTT(isCaptionON ? 'stop' : 'start'),
    iconProps: {
      name: 'caption-mode',
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
    </View>
  );
};

export default CaptionIcon;

const styles = StyleSheet.create({});
