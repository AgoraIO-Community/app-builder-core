import React from 'react';
import {Appearance, View, StyleSheet, Platform} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
} from 'react-native-reanimated';

const INITIAL_BOX_SIZE = 50;
const SLIDER_WIDTH = 300;

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const Slider = () => {
  const colorScheme = Appearance.getColorScheme();
  const offset = useSharedValue(0);
  const boxWidth = useSharedValue(INITIAL_BOX_SIZE);
  const MAX_VALUE = SLIDER_WIDTH - INITIAL_BOX_SIZE;

  const pan = Gesture.Pan().onChange(event => {
    offset.value = Math.min(
      MAX_VALUE,
      Math.max(0, offset.value + event.changeX),
    );

    const newWidth = INITIAL_BOX_SIZE + offset.value;
    boxWidth.value = newWidth;
  });

  const boxStyle = useAnimatedStyle(() => {
    return {
      width: INITIAL_BOX_SIZE + offset.value,
    };
  });

  const sliderStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: offset.value}],
    };
  });

  const animatedBoxTextColor = {
    color: colorScheme === 'light' ? '#001a72' : '#f8f9ff',
  };

  const animatedProps = useAnimatedProps(() => {
    return {
      text: `Box width: ${Math.round(boxWidth.value)}`,
      defaultValue: `Box width: ${boxWidth.value}`,
    };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Remove the TextInput if you don't want to show the box width */}
      {/* <AnimatedTextInput
        animatedProps={animatedProps}
        style={[animatedBoxTextColor, styles.boxWidthText]}
        editable={false}
      /> */}
      <Animated.View style={[styles.box, boxStyle]} />
      <View style={styles.sliderTrack}>
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              styles.sliderHandle,
              sliderStyle,
              Platform.OS === 'web' && styles.webCursorPointer,
            ]}
          />
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  sliderTrack: {
    width: SLIDER_WIDTH,
    height: 50,
    backgroundColor: '#82cab2',
    borderRadius: 25,
    justifyContent: 'center',
    padding: 5,
  },
  sliderHandle: {
    width: 40,
    height: 40,
    backgroundColor: '#f8f9ff',
    borderRadius: 20,
    position: 'absolute',
    left: 5,
  },
  box: {
    height: INITIAL_BOX_SIZE,
    backgroundColor: '#b58df1',
    borderRadius: 10,
  },
  // web-specific cursor style
  webCursorPointer: {
    cursor: 'pointer',
  },
});

export default Slider;