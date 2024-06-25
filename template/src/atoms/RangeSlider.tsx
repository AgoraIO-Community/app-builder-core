import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Slider} from '@react-native-assets/slider';

interface RangeSliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}

const RangeSlider = (props: RangeSliderProps) => {
  const {value, minimumValue, maximumValue, step, onValueChange, disabled} =
    props;
  return (
    <View>
      <Slider
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={
          disabled
            ? $config.SEMANTIC_NEUTRAL
            : $config.PRIMARY_ACTION_BRAND_COLOR
        }
        maximumTrackTintColor={$config.SEMANTIC_NEUTRAL}
        thumbStyle={{backgroundColor: $config.SECONDARY_ACTION_COLOR}}
        style={styles.slider}
        enabled={!disabled}
      />
    </View>
  );
};

export default RangeSlider;

const styles = StyleSheet.create({
  slider: {
    // width: 200,
    height: 40,
    flexGrow: 1,
    width: 120,
  },
});
