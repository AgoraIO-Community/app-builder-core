import {StyleSheet} from 'react-native';
const CommonStyles = StyleSheet.create({
  sidePanelContainerWeb: {
    flex: 1,
    maxWidth: '20%',
    minWidth: 338,
    borderRadius: 12,
    marginLeft: 24,
    //margin vertical added to match video tile top/bottom padding
    marginVertical: 12,
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
});
export default CommonStyles;
