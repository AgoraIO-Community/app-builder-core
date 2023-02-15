import { StyleSheet } from 'react-native';
import colors from '../../colors';

export const HEIGHT = 105;

export default StyleSheet.create({
  base: {
    flexDirection: 'row',
    height: HEIGHT,
    borderRadius: 6,
    backgroundColor: colors.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2
  },
  borderTop: {
    borderTopWidth: 5,
    borderTopColor: colors.alto
  },
  contentContainer: {
    paddingLeft: 20,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  text1: {
    fontSize: 15,
    fontFamily: 'Source Sans Pro',
    width: '100%',
    fontWeight: '600',
    marginRight: 2
  },
  text2: {
    fontSize: 15,
    fontFamily: 'Source Sans Pro',
    width: '100%',
    fontWeight: '400'
  }
});
