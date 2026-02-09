import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useOrientation} from '../utils/useOrientation';
import ThemeConfig from '../theme';
import Popup from './../atoms/Popup';
import {useString} from '../utils/useString';
import {blockLandscapeModeMessageText} from '../language/default-labels/videoCallScreenLabels';

export type DeviceClass = 'phone' | 'tablet' | 'desktop';

export const getDeviceClass = (): DeviceClass => {
  // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/maxTouchPoints
  // const isTouch = window.navigator.maxTouchPoints > 0;
  const minDim = Math.min(window.screen.width, window.screen.height);
  // Mouse-only devices
  // if (!isTouch) {
  //   return 'desktop';
  // }
  // Touch + small screen → phone
  if (minDim < 768) {
    return 'phone';
  }
  // Touch + large screen → tablet
  return 'tablet';
};
export default function BlockUI() {
  const blockLandscapeModeMessageTextLabel = useString(
    blockLandscapeModeMessageText,
  )();

  const [isBlockModalVisible, setBlockModalVisible] = useState(true);

  const orientation = useOrientation();
  const deviceClass = getDeviceClass();

  const shouldBlock = deviceClass === 'phone' && orientation === 'LANDSCAPE';
  if (!shouldBlock) {
    return <></>;
  }
  return (
    <Popup
      cancelable={false}
      modalVisible={isBlockModalVisible}
      setModalVisible={setBlockModalVisible}
      containerStyle={styles.blockui__wrapper}
      contentContainerStyle={styles.blockui__body}
      showCloseIcon={false}>
      <View style={styles.blockui__wrapper}>
        <View style={styles.blockui__body}>
          <Text style={styles.blockui__content}>
            {blockLandscapeModeMessageTextLabel}
          </Text>
        </View>
      </View>
    </Popup>
  );
}

const styles = StyleSheet.create({
  blockui__wrapper: {
    padding: 0,
    // position: 'absolute',
    // top: 0,
    // left: 0,
    // width: '100%',
    // height: '100%',
    // zIndex: 99999,
    // backgroundColor: $config.CARD_LAYER_1_COLOR,
    // color: '#fff',
  },
  blockui__body: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    borderRadius: 0,
  },
  blockui__content: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Source Sans Pro',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.medium,
  },
});
