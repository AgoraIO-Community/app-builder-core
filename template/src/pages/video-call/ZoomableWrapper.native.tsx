import {ReactNativeZoomableView} from '@openspacelabs/react-native-zoomable-view';
import {isAndroid} from '../../utils/common';
import React from 'react';
import {Animated, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useSharedValue} from 'react-native-reanimated';

const ZoomableWrapper = (props) => {
  if (!props?.enableZoom) {
    return <>{props.children}</>;
  }
  if (isAndroid()) {
    return (
      <View
        style={{
          flexShrink: 1,
          height: '100%',
          width: '100%',
        }}>
        <ReactNativeZoomableView
          maxZoom={30}
          zoomStep={1}
          initialZoom={1}
          style={{
            flex: 1,
          }}>
          {props.children}
        </ReactNativeZoomableView>
      </View>
    );
  }

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  return (
    <GestureDetector gesture={pinchGesture}>
      <Animated.View
        style={[
          {
            width: '100%',
            height: '100%',
          },
          {transform: [{scale: scale.value}]},
        ]}>
        {props.children}
      </Animated.View>
    </GestureDetector>
  );
};
export default ZoomableWrapper;
