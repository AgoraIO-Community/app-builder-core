import {StyleSheet} from 'react-native';
import ThemeConfig from '../theme';
const CommonStyles = StyleSheet.create({
  sidePanelContainerWeb: {
    flex: 1,
    maxWidth: '20%',
    minWidth: 338,
    borderRadius: ThemeConfig.BorderRadius.small,
    marginLeft: 12,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderColor: $config.CARD_LAYER_3_COLOR,
    borderWidth: 1,
    shadowColor: $config.HARD_CODED_BLACK_COLOR,
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 20,
    overflow: 'hidden',
  },
  sidePanelContainerNative: {
    zIndex: 5,
    width: '100%',
    height: '100%',
  },
  sidePanelContainerWebMinimzed: {
    position: 'absolute',
    zIndex: 5,
    width: '96%',
    height: '96%',
    right: '2%',
    left: '2%',
    top: '2%',
    bottom: '2%',
    borderRadius: ThemeConfig.BorderRadius.small,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderColor: $config.CARD_LAYER_3_COLOR,
    borderWidth: 1,
    shadowColor: $config.HARD_CODED_BLACK_COLOR,
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 20,
    overflow: 'hidden',
  },
});
export default CommonStyles;
