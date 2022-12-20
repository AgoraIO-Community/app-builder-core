import {StyleSheet, Text, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import ThemeConfig from '../theme';

interface CircleProgressProps {
  onComplete?: () => void;
  timer?: number; // in seconds
}

const CircularProgress = (props: CircleProgressProps) => {
  const {onComplete = () => {}, timer = 60} = props;
  const [seconds, setSeconds] = useState(timer);

  React.useEffect(() => {
    const timerInterval = setInterval(() => {
      setSeconds((seconds) => seconds - 1);
    }, 1000);
    return () => {
      clearInterval(timerInterval); //when user exits, clear this interval.
    };
  }, []);

  useEffect(() => {
    if (seconds <= 0) {
      onComplete();
    }
  }, [seconds]);

  return (
    <View
      style={{
        justifyContent: 'center',
        alignSelf: 'center',
        borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
        borderWidth: 3,
        borderRadius: 30,
        minHeight: 40,
        minWidth: 40,
      }}>
      <Text
        style={{
          padding: 12,
          minHeight: 40,
          minWidth: 40,
          fontFamily: ThemeConfig.FontFamily.sansPro,
          fontWeight: '700',
          fontSize: 14,
          lineHeight: 18,
          textAlign: 'center',
          color: $config.FONT_COLOR,
        }}>
        {seconds}
      </Text>
    </View>
  );
};

export default CircularProgress;

const styles = StyleSheet.create({});
