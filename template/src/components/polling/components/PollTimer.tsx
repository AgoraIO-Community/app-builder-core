import React, {useEffect} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {useCountdown} from '../hook/useCountdownTimer';
import ThemeConfig from '../../../theme';

interface Props {
  expiresAt: number;
  setFreezeForm?: React.Dispatch<React.SetStateAction<boolean>>;
}

const padZero = (value: number) => {
  return value.toString().padStart(2, '0');
};

export default function PollTimer({expiresAt, setFreezeForm}: Props) {
  const [days, hours, minutes, seconds] = useCountdown(expiresAt);

  const getTime = () => {
    if (days) {
      return `${padZero(days)} : ${padZero(hours)} : ${padZero(
        minutes,
      )} : ${padZero(seconds)}`;
    }
    if (hours) {
      return `${padZero(hours)} : ${padZero(minutes)} : ${padZero(seconds)}`;
    }
    if (minutes || seconds) {
      return `${padZero(minutes)} : ${padZero(seconds)}`;
    }
    return '00 : 00';
  };

  useEffect(() => {
    if (days + hours + minutes + seconds === 0) {
      setFreezeForm(true);
    }
  }, [days, hours, minutes, seconds, setFreezeForm]);

  return (
    <View>
      <Text style={style.timer}>{getTime()}</Text>
    </View>
  );
}

export const style = StyleSheet.create({
  timer: {
    color: $config.SEMANTIC_WARNING,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 16,
    lineHeight: 20,
  },
});
