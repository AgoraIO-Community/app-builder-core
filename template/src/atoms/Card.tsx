import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import isMobileOrTablet from '../utils/isMobileOrTablet';

const mobileOrTablet = isMobileOrTablet();

const Card = (props) => {
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
    backgroundColor: '#ffffff',
    paddingVertical: mobileOrTablet ? 40 : 60,
    paddingHorizontal: mobileOrTablet ? 20 : 60,
    borderRadius: 20,
    borderColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    maxWidth: 675,
    width: '100%',
    marginHorizontal: 'auto',
    marginVertical: 0,
  },
});
