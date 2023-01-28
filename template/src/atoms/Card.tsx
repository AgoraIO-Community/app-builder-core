import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import React from 'react';
import isMobileOrTablet from '../utils/isMobileOrTablet';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';

const mobileOrTablet = isMobileOrTablet();

interface CardProps {
  isDesktop?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
}

const Card = (props: CardProps) => {
  const {style, children, isDesktop = true, ...rest} = props;
  return (
    <View
      style={[styles.root, isDesktop ? styles.desktop : styles.mobile, style]}
      {...rest}>
      {children}
    </View>
  );
};

export default Card;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    elevation: 5,
    maxWidth: 676,
    width: '100%',
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
    paddingHorizontal: 60,
    paddingVertical: 60,
    borderRadius: 16,
    borderColor: $config.CARD_LAYER_3_COLOR,
    shadowColor: $config.HARD_CODED_BLACK_COLOR,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    marginHorizontal: 40,
  },
});
