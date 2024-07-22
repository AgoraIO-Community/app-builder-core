import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useOrientation} from '../utils/useOrientation';
import ThemeConfig from '../theme';
import {isMobileUA} from '../utils/common';

export default function BlockUI() {
  const orientation = useOrientation();
  if (!isMobileUA()) {
    return <></>;
  }
  if (orientation === 'PORTRAIT') {
    return <></>;
  }
  return (
    <View style={styles.blockui__wrapper}>
      <View style={styles.blockui__body}>
        <Text style={styles.blockui__content}>
          Please change to portrait mode to further access our application.
          value is:
          {isMobileUA ? 'mobile ua' : 'not mobile ua'}
          orientation is {orientation}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  blockui__wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 99999,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    color: '#fff',
  },
  blockui__body: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  blockui__content: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Source Sans Pro',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.medium,
  },
});
