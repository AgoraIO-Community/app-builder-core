import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import PrimaryButton from '../../atoms/PrimaryButton';
import ThemeConfig from '../../theme';
import StorageContext from '../../components/StorageContext';
import {useMeetingInfo} from '../../components/meeting-info/useMeetingInfo';
import useTokenAuth from '../../auth/useTokenAuth';
import Spacer from '../../atoms/Spacer';
import events, {EventPersistLevel} from '../../rtm-events-api';
import {useCaption} from './useCaption';
import {SidePanelType, useSidePanel} from 'customization-api';

const startStopSTT = async (
  isCaptionON: boolean,
  token: string,
  roomId: string,
  method: string,
) => {
  const response = await fetch(`${$config.BACKEND_ENDPOINT}/v1/stt/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': 'ACoac4ccff5c1ea40d29a97fb5b5bd63d78',
      'X-Project-ID': $config.PROJECT_ID, // to be fetched from config
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

const CaptionButton = () => {
  const {store, setStore} = React.useContext(StorageContext);
  const {isCaptionON, setIsCaptionON} = useCaption();
  const [isSTTActive, setIsSTTActive] = React.useState(false); // TODO: need to load initial value from query api
  //local state for isactive
  const {
    data: {roomId, isHost},
  } = useMeetingInfo();

  const {setSidePanel, sidePanel} = useSidePanel();

  const handleClick = async (method) => {
    setIsCaptionON((prev) => !prev);
    if (method === 'stop') return; // not closing the stt service as it will stop for whole channel

    try {
      if (!(method === 'start' && isSTTActive === true)) {
        const res = await startStopSTT(
          isCaptionON,
          store?.token || '',
          roomId.host ? roomId.host : '',
          method,
        );
        console.log('response after start/stop stt', res);
      }

      events.send(
        'handleCaption',
        JSON.stringify({active: !isCaptionON}),
        EventPersistLevel.LEVEL2,
      );
      setIsSTTActive(!isCaptionON);
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    events.on('handleCaption', (data) => {
      const payload = JSON.parse(data?.payload);
      //setIsCaptionON(payload.active);
      setIsSTTActive(payload.active);
    });
  }, []);
  const isPanelActive = sidePanel === SidePanelType.Transcript;

  const handleTranscriptClick = () => {
    isPanelActive
      ? setSidePanel(SidePanelType.None)
      : setSidePanel(SidePanelType.Transcript);
  };

  return (
    <View style={{flexDirection: 'row', width: 100}}>
      <PrimaryButton
        containerStyle={{
          width: '100%',
          minWidth: 50,
          height: 48,
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderRadius: ThemeConfig.BorderRadius.medium,
        }}
        text={`Start CC`}
        disabled={isCaptionON}
        textStyle={styles.btnText}
        onPress={() => handleClick('start')}
      />
      <Spacer size={10} horizontal />
      <PrimaryButton
        containerStyle={{
          minWidth: 50,
          height: 48,
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderRadius: ThemeConfig.BorderRadius.medium,
        }}
        text={`Stop CC`}
        disabled={!isCaptionON}
        textStyle={styles.btnText}
        onPress={() => handleClick('stop')}
      />
      <Spacer size={10} horizontal />
      <PrimaryButton
        containerStyle={{
          width: '100%',
          minWidth: 80,
          height: 48,
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderRadius: ThemeConfig.BorderRadius.medium,
        }}
        text={isPanelActive ? 'Hide Transcript' : 'Show Transcript'}
        textStyle={styles.btnText}
        onPress={handleTranscriptClick}
      />
    </View>
  );
};

export default CaptionButton;

const styles = StyleSheet.create({
  btnContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
  },
});
