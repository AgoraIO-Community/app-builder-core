import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import ThemeConfig from '../../theme';
import ImageIcon from '../../atoms/ImageIcon';
import {useLayout, useContent} from 'customization-api';
import {isMobileUA, isWeb, useIsSmall} from '../../utils/common';
import {getGridLayoutName} from './DefaultLayouts';
import {useVideoContainer} from './VideoRenderer';

export interface NameWithMicIconProps {
  name: string;
  muted?: boolean;
}

const NameWithMicIcon = (props: NameWithMicIconProps) => {
  const {activeUids, customContent} = useContent();
  const {videoTileWidth} = useVideoContainer();
  const {currentLayout} = useLayout();
  const activeUidsLen = activeUids?.filter((i) => !customContent[i])?.length;
  const reduceSpace =
    isMobileUA() && activeUidsLen > 4 && currentLayout === getGridLayoutName();
  const {name, muted} = props;
  //const isSpeaking = isActiveSpeaker(user.uid);
  //commented for v1 release
  //const remoteUserDefaultLabel = useString('remoteUserDefaultLabel')();
  const remoteUserDefaultLabel = 'User';
  const isSmall = useIsSmall();
  return (
    <View
      style={[
        style.container,
        {
          maxWidth: videoTileWidth * 0.6 > 180 ? 180 : videoTileWidth * 0.6,
        },
        reduceSpace ? {left: 2, bottom: 2} : {},
        reduceSpace && activeUidsLen > 12 ? {padding: 2} : {},
      ]}>
      {muted !== undefined ? (
        <ImageIcon
          iconType="plain"
          name={!muted ? 'mic-on' : 'mic-off'}
          tintColor={
            !muted ? $config.PRIMARY_ACTION_BRAND_COLOR : $config.SEMANTIC_ERROR
          }
          iconSize={20}
        />
      ) : (
        <></>
      )}
      {(isMobileUA() || (!isMobileUA() && isSmall())) &&
      currentLayout === getGridLayoutName() &&
      activeUidsLen > 6 ? (
        <></>
      ) : (
        <PlatformWrapper>
          <Text
            numberOfLines={1}
            textBreakStrategy="simple"
            ellipsizeMode="tail"
            style={style.name}>
            {name || remoteUserDefaultLabel}
          </Text>
        </PlatformWrapper>
      )}
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
    backgroundColor: $config.VIDEO_AUDIO_TILE_OVERLAY_COLOR,
    position: 'absolute',
    alignItems: 'center',
    padding: 8,
    // height: 34,
    left: 8,
    bottom: 8,
    borderRadius: 4,
    flexDirection: 'row',
    zIndex: 5,
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

export default NameWithMicIcon;
