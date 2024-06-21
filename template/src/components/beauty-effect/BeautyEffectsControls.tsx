import {StyleSheet, Text, View, ScrollView} from 'react-native';
import {
  useBeautyEffect,
  type LighteningContrastLevel,
  type Level,
} from './useBeautyEffects';
import React from 'react';
import Toggle from '../../atoms/Toggle';
import ThemeConfig from '../../theme';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import RangeSlider from '../../atoms/RangeSlider';

const Header = () => (
  <Text
    style={{
      paddingHorizontal: 24,
      fontWeight: '400',
      fontSize: ThemeConfig.FontSize.small,
      color: $config.FONT_COLOR + hexadecimalTransparency['70%'],
      fontFamily: ThemeConfig.FontFamily.sansPro,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: $config.INPUT_FIELD_BORDER_COLOR,
    }}>
    {'Apply Beauty Effects'}
  </Text>
);

const BeautyEffectsControls = () => {
  const {
    beautyEffectsOn,
    setBeautyEffectsOn,
    lighteningContrastLevel,
    setLighteningContrastLevel,
    rednessLevel,
    setRednessLevel,
    smoothnessLevel,
    setSmoothnessLevel,
    sharpnessLevel,
    setSharpnessLevel,
    lighteningLevel,
    setLighteningLevel,
  } = useBeautyEffect();

  return (
    <View>
      <Header />
      <ScrollView>
        <View style={styles.row}>
          <Text numberOfLines={1} style={styles.label}>
            Enable Beauty Effects
          </Text>
          <View style={styles.toggleContainer}>
            <Toggle
              isEnabled={beautyEffectsOn}
              toggleSwitch={setBeautyEffectsOn}
            />
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>
            Lightening Contrast: {lighteningContrastLevel}
          </Text>
          <RangeSlider
            minimumValue={0}
            maximumValue={2}
            step={1}
            value={lighteningContrastLevel}
            onValueChange={value =>
              setLighteningContrastLevel(value as LighteningContrastLevel)
            }
            disabled={!beautyEffectsOn}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>
            Lightening : {lighteningLevel.toFixed(1)}
          </Text>
          <RangeSlider
            minimumValue={0}
            maximumValue={1}
            step={0.1}
            value={lighteningLevel}
            onValueChange={value => setLighteningLevel(value as Level)}
            disabled={!beautyEffectsOn}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>
            Smoothness : {smoothnessLevel.toFixed(1)}
          </Text>
          <RangeSlider
            minimumValue={0}
            maximumValue={1}
            step={0.1}
            value={smoothnessLevel}
            onValueChange={value => setSmoothnessLevel(value as Level)}
            disabled={!beautyEffectsOn}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>
            Sharpness : {sharpnessLevel.toFixed(1)}
          </Text>

          <RangeSlider
            minimumValue={0}
            maximumValue={1}
            step={0.1}
            value={sharpnessLevel}
            onValueChange={value => setSharpnessLevel(value as Level)}
            disabled={!beautyEffectsOn}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Redness : {rednessLevel.toFixed(1)}</Text>
          <RangeSlider
            minimumValue={0}
            maximumValue={1}
            step={0.1}
            value={rednessLevel}
            onValueChange={value => setRednessLevel(value as Level)}
            disabled={!beautyEffectsOn}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default BeautyEffectsControls;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleContainer: {
    flex: 0.2,
    alignItems: 'flex-end',
    alignSelf: 'center',
  },
  RangeSliderContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.normal,
    color: $config.FONT_COLOR + hexadecimalTransparency['70%'],
  },
});
