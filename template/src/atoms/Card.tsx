import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import React from 'react';
import isMobileOrTablet from '../utils/isMobileOrTablet';

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
      style={[styles.root, style, isDesktop ? styles.desktop : styles.mobile]}
      {...rest}>
      {children}
    </View>
  );
};

export default Card;

const styles = StyleSheet.create({
  root: {
    flex: 1,

    backgroundColor: 'rgba(255,255,255,0.05)',
    elevation: 5,
    maxWidth: 676,
    width: '100%',
  },
  mobile: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },
  desktop: {
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    paddingHorizontal: 60,
    paddingVertical: 60,
    borderRadius: 20,
    borderColor: 'rgba(80, 80, 80, 0.2)',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
});
