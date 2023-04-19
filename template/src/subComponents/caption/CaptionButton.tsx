import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import PrimaryButton from '../../atoms/PrimaryButton';
import ThemeConfig from '../../theme';
import StorageContext from '../../components/StorageContext';
import {useMeetingInfo} from '../../components/meeting-info/useMeetingInfo';
import useTokenAuth from '../../auth/useTokenAuth';
import Spacer from '../../atoms/Spacer';
import events, {EventPersistLevel} from '../../rtm-events-api';

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
  const [isCaptionON, setIsCaptionON] = React.useState<boolean>(false);
  const {store, setStore} = React.useContext(StorageContext);
  const {
    data: {roomId, isHost},
  } = useMeetingInfo();

  const handleClick = async (method) => {
    try {
      const res = await startStopSTT(
        isCaptionON,
        store?.token || '',
        roomId.host ? roomId.host : '',
        method,
      );
      console.log('response after start/stop stt', res);

      setIsCaptionON((prev) => !prev);
      events.send(
        'handleCaption',
        JSON.stringify({active: !isCaptionON}),
        EventPersistLevel.LEVEL2,
      );
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    events.on('handleCaption', (data) => {
      const payload = JSON.parse(data?.payload);
      setIsCaptionON(payload.active);
    });
  }, []);

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
