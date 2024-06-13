import {StyleSheet} from 'react-native';
import ThemeConfig from '../../theme';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';

export const style = StyleSheet.create({
  scrollgrow: {
    flexGrow: 1,
  },
  mContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flexShrink: 0,
    // width: 620,
    width: '100%',
    maxWidth: 620,
    minWidth: 340,
    height: 620,
    maxHeight: 620,
    borderRadius: 4,
    zIndex: 2,
  },
  mHeader: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: 60,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 20,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_3_COLOR,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
  },
  mbody: {
    width: '100%',
    flex: 1,
  },
  mfooter: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: 60,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
    borderTopWidth: 1,
    borderTopColor: $config.CARD_LAYER_3_COLOR,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
  },
  ttable: {
    flex: 1,
  },
  // Header styles start
  thead: {
    display: 'flex',
    height: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexShrink: 0,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
  },
  throw: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
  },
  th: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  thText: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.medium,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 16,
  },
  // Header style ends
  // Body style starts
  tbody: {
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    paddingHorizontal: 20,
    flex: 1,
  },
  tbrow: {
    display: 'flex',
    alignSelf: 'stretch',
    minHeight: 50,
    flexDirection: 'row',
    paddingBottom: 10,
    paddingTop: 20,
  },
  td: {
    flex: 1,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 12,
    // height: 100,
    gap: 10,
  },
  tpreview: {
    width: '100%',
    height: 76,
    padding: 4,
    backgroundColor: 'black',
    border: '1px solid grey',
    color: $config.FONT_COLOR,
  },
  ttime: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.medium,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 16,
  },
  tname: {
    color: $config.VIDEO_AUDIO_TILE_AVATAR_COLOR,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 16,
  },
  tactions: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: -8,
  },
  tlink: {
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
    fontSize: ThemeConfig.FontSize.tiny,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    lineHeight: 12,
  },
  // footer start
  mfooterTitle: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 16,
  },
  pagination: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_4_COLOR,
    backgroundColor: $config.CARD_LAYER_3_COLOR,
  },
  placeHolder: {
    fontSize: ThemeConfig.FontSize.tiny,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
  },
  // footer ends
  captionContainer: {
    height: 44,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    padding: 12,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  captionText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Source Sans Pro',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    paddingLeft: 8,
  },
  infotextContainer: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Source Sans Pro',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
  },
  iconButtonContainer: {
    marginTop: -8,
  },
  iconButton: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: $config.HARD_CODED_BLACK_COLOR,
  },
  iconButtonHoverEffect: {
    backgroundColor:
      $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['25%'],
    borderRadius: 16,
  },
  iconShareLink: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zeroHPadding: {
    paddingHorizontal: 0,
  },
  pushRight: {
    marginLeft: 'auto',
  },
  pl10: {
    paddingLeft: 10,
  },
  plzero: {
    paddingLeft: 0,
  },
  pt10: {
    paddingTop: 10,
  },
  pt12: {
    paddingTop: 12,
  },
  pv10: {
    paddingVertical: 10,
  },
  ph20: {
    paddingHorizontal: 20,
  },
  pl15: {
    paddingLeft: 15,
  },
});
