// import {ReactNativeZoomableView} from '@openspacelabs/react-native-zoomable-view';
// import {isAndroid} from '../../utils/common';
import React, {useEffect, useRef} from 'react';
// import {Animated, View} from 'react-native';
// import {Gesture, GestureDetector} from 'react-native-gesture-handler';
// import {useSharedValue} from 'react-native-reanimated';
import {PinchableView} from './PinchableView';

const ZoomableWrapper = (props) => {
  if (!props?.enableZoom) {
    return <>{props.children}</>;
  }
  return <PinchableView>{props.children}</PinchableView>;
  /**
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

  const startValue = useRef(new Animated.Value(1));
  const lastSavedValue = useRef(1);
  const updatedValue = useRef(1);
  const duration = 250;

  function debounce(func, timeout = 100) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  }

  useEffect(() => {
    Animated.spring(startValue.current, {
      toValue: updatedValue.current,
      delay: 250,
      useNativeDriver: true,
    }).start();
  }, [updatedValue.current]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      updatedValue.current = lastSavedValue.current * e.scale;
    })
    .onEnd(() => {
      lastSavedValue.current = updatedValue.current;
      startValue.current = new Animated.Value(updatedValue.current);
    });

  return (
    <GestureDetector gesture={pinchGesture}>
      <Animated.View
        style={[
          {
            width: '100%',
            height: '100%',
          },
          {transform: [{scale: startValue.current}]},
        ]}>
        {props.children}
      </Animated.View>
    </GestureDetector>
  );
   */
};
export default ZoomableWrapper;
