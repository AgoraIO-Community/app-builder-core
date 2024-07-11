import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import ThemeConfig from '../../theme';
import Dropdown from '../../atoms/Dropdown';

const QualityControls = () => {
  const data = [];
  return (
    <View>
      <Text style={styles.label}>{'Video Profile'}</Text>
    </View>
  );
};

export default QualityControls;

const styles = StyleSheet.create({
  label: {
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.small,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    marginBottom: 12,
  },
});
