import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import ThemeConfig from '../../theme';
import ImageIcon from '../../atoms/ImageIcon';
import {useLayout, useContent} from 'customization-api';
import {isMobileUA, isWeb} from '../../utils/common';
import {getGridLayoutName} from './DefaultLayouts';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import {useString} from '../../utils/useString';

const SpotlightHighligher = () => {
  const {activeUids, customContent} = useContent();
  const {currentLayout} = useLayout();
  const activeUidsLen = activeUids?.filter(i => !customContent[i])?.length;
  const reduceSpace =
    isMobileUA() &&
    activeUids.length > 4 &&
    currentLayout === getGridLayoutName();
  const spotlightText = useString('videoRoomInTheSpotlightText')();

  return (
    <View
      style={[
        style.container,
        reduceSpace ? {left: 2, bottom: 2} : {},
        reduceSpace && activeUidsLen > 12 ? {padding: 2} : {},
      ]}>
      <ImageIcon
        iconType="plain"
        name={'spotlight'}
        tintColor={$config.PRIMARY_ACTION_BRAND_COLOR}
        iconSize={20}
      />
      <PlatformWrapper>
        <Text
          numberOfLines={1}
          textBreakStrategy="simple"
          ellipsizeMode="tail"
          style={[style.name]}>
          {spotlightText}
        </Text>
      </PlatformWrapper>
    </View>
  );
};
const PlatformWrapper = ({children}) => {
  return isWeb() ? (
    <div
      style={{
        userSelect: 'none',
        MozUserSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
        alignSelf: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: $config.VIDEO_AUDIO_TILE_TEXT_COLOR,
      }}>
      {children}
    </div>
  ) : (
    <>{children}</>
  );
};

const style = StyleSheet.create({
  container: {
    backgroundColor:
      $config.VIDEO_AUDIO_TILE_OVERLAY_COLOR + hexadecimalTransparency['25%'],
    position: 'absolute',
    alignItems: 'center',
    padding: 8,
    top: 8,
    left: 8,
    borderRadius: 4,
    flexDirection: 'row',
    zIndex: 999,
    elevation: 5,
  },
  name: {
    color: $config.VIDEO_AUDIO_TILE_TEXT_COLOR,
    fontSize: ThemeConfig.FontSize.small,
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    flexShrink: 1,
    marginLeft: 4,
    marginRight: 2,
  },
});

export default SpotlightHighligher;
