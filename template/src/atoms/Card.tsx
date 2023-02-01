import {StyleSheet, View, ViewStyle} from 'react-native';
import React from 'react';
import {isMobileUA, useResponsive} from '../utils/common';
import ThemeConfig from '../theme';

interface CardProps {
  style?: ViewStyle;
  children?: React.ReactNode;
}

const Card = (props: CardProps) => {
  const {style, children, ...rest} = props;
  const styles = useStyles();
  return (
    <View
      style={[
        styles.root,
        isMobileUA() ? styles.mobile : styles.desktop,
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
};

export default Card;

const useStyles = () => {
  const getResponsiveValue = useResponsive();
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: $config.CARD_LAYER_1_COLOR,
      elevation: 5,
      maxWidth: 676,
      width: '100%',
      overflow: 'hidden',
    },
    mobile: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 40,
      justifyContent: 'space-between',
    },
    desktop: {
      justifyContent: 'center',
      alignSelf: 'center',
      borderWidth: 1,
      paddingHorizontal: getResponsiveValue(60),
      paddingVertical: getResponsiveValue(60),
      borderRadius: ThemeConfig.BorderRadius.extraLarge,
      borderColor: $config.CARD_LAYER_3_COLOR,
      shadowColor: $config.HARD_CODED_BLACK_COLOR,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 20,
      margin: getResponsiveValue(40),
    },
  });
};
