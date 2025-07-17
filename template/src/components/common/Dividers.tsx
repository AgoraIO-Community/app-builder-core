import React from 'react';
import {View, StyleSheet} from 'react-native';
import ThemeConfig from '../../theme';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  thickness?: number;
  color?: string;
  length?: number | string; // only for vertical dividers
}

const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  marginTop = 8,
  marginBottom = 8,
  marginLeft = 0,
  marginRight = 0,
  thickness = 1,
  color = $config.CARD_LAYER_4_COLOR,
  length = '100%',
}) => {
  const isHorizontal = orientation === 'horizontal';

  const style = isHorizontal
    ? {
        height: thickness,
        width: '100%',
        backgroundColor: color,
        marginTop,
        marginBottom,
      }
    : {
        width: thickness,
        height: length,
        backgroundColor: color,
        marginLeft,
        marginRight,
      };

  return <View style={[styles.base, style]} />;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: $config.CARD_LAYER_4_COLOR,
  },
});

export default Divider;
