import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import React from 'react';
import isMobileOrTablet from '../utils/isMobileOrTablet';

const mobileOrTablet = isMobileOrTablet();

interface CardProps {
  style?: ViewStyle;
  children?: React.ReactNode;
}

const Card = (props: CardProps) => {
  const {style, children, ...rest} = props;
  return (
    <View style={[styles.root, style]} {...rest}>
      {children}
    </View>
  );
};

export default Card;

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 60,
    paddingVertical: 60,
    borderRadius: 20,
    borderColor: 'rgba(80, 80, 80, 0.2)',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    width: 676,
    height: 629,
  },
});
