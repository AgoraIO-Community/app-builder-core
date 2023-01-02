import isMobileOrTablet from '../../src/utils/isMobileOrTablet';
import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
  base: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    left: isMobileOrTablet() ? 10 : Dimensions.get('window').width / 2 - 300,
    right: isMobileOrTablet() ? 10 : 'auto',
    width: isMobileOrTablet() ? '95%' : 600
  },
  top: {
    top: 0
  },
  bottom: {
    bottom: 0
  }
});
