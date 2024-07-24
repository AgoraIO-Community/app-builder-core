import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Toggle from '../../atoms/Toggle';
import ThemeConfig from '../../theme';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import {useSuperClarity} from './useSuperClarity';

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
    {'Apply Super Clarity'}
  </Text>
);

const SuperClarityControls = () => {
  const {superClarityOn, setSuperClarityOn} = useSuperClarity();

  return (
    <View>
      <Header />
      <ScrollView>
        <View style={styles.row}>
          <Text numberOfLines={1} style={styles.label}>
            Enable Super Clarity
          </Text>
          <View style={styles.toggleContainer}>
            <Toggle
              isEnabled={superClarityOn}
              toggleSwitch={setSuperClarityOn}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SuperClarityControls;

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
