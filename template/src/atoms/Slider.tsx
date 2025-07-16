import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextStyle,
  ViewStyle,
  TouchableOpacity,
  PanResponder,
  Dimensions,
} from 'react-native';
import ThemeConfig from '../theme';
import {isWebInternal} from '../utils/common';

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  trackStyle?: ViewStyle;
  thumbStyle?: ViewStyle;
  showValue?: boolean;
  unit?: string;
}

const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  disabled = false,
  label,
  labelStyle,
  containerStyle,
  trackStyle,
  thumbStyle,
  showValue = true,
  unit = '',
}) => {
  const TRACK_WIDTH = 240;
  const THUMB_SIZE = 20;
  
  // Calculate position based on value
  const getPositionFromValue = (val: number) => {
    const percentage = (val - minimumValue) / (maximumValue - minimumValue);
    return percentage * (TRACK_WIDTH - THUMB_SIZE);
  };
  
  // Calculate value based on position
  const getValueFromPosition = (pos: number) => {
    const percentage = pos / (TRACK_WIDTH - THUMB_SIZE);
    const rawValue = minimumValue + percentage * (maximumValue - minimumValue);
    return Math.round(rawValue / step) * step;
  };
  
  const [isDragging, setIsDragging] = React.useState(false);
  const [position, setPosition] = React.useState(getPositionFromValue(value));
  
  React.useEffect(() => {
    setPosition(getPositionFromValue(value));
  }, [value]);
  
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setIsDragging(true);
    },
    onPanResponderMove: (evt, gestureState) => {
      const newPosition = Math.max(
        0,
        Math.min(TRACK_WIDTH - THUMB_SIZE, position + gestureState.dx)
      );
      setPosition(newPosition);
      
      const newValue = getValueFromPosition(newPosition);
      onValueChange(newValue);
    },
    onPanResponderRelease: () => {
      setIsDragging(false);
    },
  });
  
  // For web, use HTML input range
  if (isWebInternal()) {
    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
        <View style={styles.sliderContainer}>
          <input
            type="range"
            min={minimumValue}
            max={maximumValue}
            step={step}
            value={value}
            onChange={(e) => onValueChange(Number(e.target.value))}
            disabled={disabled}
            style={{
              width: TRACK_WIDTH,
              height: 4,
              background: `linear-gradient(to right, ${$config.PRIMARY_ACTION_BRAND_COLOR} 0%, ${$config.PRIMARY_ACTION_BRAND_COLOR} ${((value - minimumValue) / (maximumValue - minimumValue)) * 100}%, #444 ${((value - minimumValue) / (maximumValue - minimumValue)) * 100}%, #444 100%)`,
              borderRadius: 2,
              outline: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          />
          {showValue && (
            <Text style={styles.valueText}>
              {value}{unit}
            </Text>
          )}
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View style={styles.sliderContainer}>
        <View style={[styles.track, trackStyle]}>
          <View
            style={[
              styles.activeTrack,
              {
                width: position + THUMB_SIZE / 2,
              },
            ]}
          />
          <View
            style={[
              styles.thumb,
              thumbStyle,
              {
                left: position,
                opacity: disabled ? 0.5 : 1,
              },
            ]}
            {...panResponder.panHandlers}
          />
        </View>
        {showValue && (
          <Text style={styles.valueText}>
            {value}{unit}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  track: {
    width: 240,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    position: 'relative',
  },
  activeTrack: {
    height: 4,
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    borderRadius: 2,
    position: 'absolute',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    position: 'absolute',
    top: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  valueText: {
    fontSize: 14,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    minWidth: 60,
    textAlign: 'center',
  },
});

export default Slider;