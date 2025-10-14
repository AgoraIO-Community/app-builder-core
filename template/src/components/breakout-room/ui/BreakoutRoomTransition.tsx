import React, {useEffect, useState} from 'react';
import Loading from '../../../subComponents/Loading';
import {View, StyleSheet} from 'react-native';

interface BreakoutRoomTransitionProps {
  onTimeout: () => void;
  direction?: 'enter' | 'exit';
}

const BreakoutRoomTransition = ({
  onTimeout,
  direction = 'enter',
}: BreakoutRoomTransitionProps) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    const timeout = setTimeout(onTimeout, 10000); // 10s timeout

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onTimeout]);

  const transitionText =
    direction === 'exit' ? 'Exiting breakout room' : 'Entering breakout room';

  return (
    <View style={styles.transitionContainer}>
      <Loading
        text={`${transitionText}...${dots}`}
        background={$config.CARD_LAYER_1_COLOR}
        textColor={$config.FONT_COLOR}
      />
    </View>
  );
};

export default BreakoutRoomTransition;
const styles = StyleSheet.create({
  transitionContainer: {
    height: '100%',
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
