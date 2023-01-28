import React, {useContext} from 'react';
import {View, StyleSheet, useWindowDimensions, Text} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import ThemeConfig from '../../theme';
import {RenderInterface} from '../../../agora-rn-uikit';
import ImageIcon from '../../atoms/ImageIcon';
import TextWithTooltip from '../../subComponents/TextWithTooltip';
import {useString} from '../../utils/useString';
import {useLayout, useRender} from 'customization-api';
import useIsActiveSpeaker from '../../utils/useIsActiveSpeaker';
import {
  isMobileUA,
  isWeb,
  isWebInternal,
  useIsMobile,
  useIsSmall,
} from '../../utils/common';
import AnimatedActiveSpeaker from '../../atoms/AnimatedActiveSpeaker';
import {getGridLayoutName} from './DefaultLayouts';

interface NameWithMicIconProps {
  user: RenderInterface;
}

const NameWithMicIcon = (props: NameWithMicIconProps) => {
  const {activeUids} = useRender();
  const {currentLayout} = useLayout();
  const reduceSpace =
    isMobileUA() &&
    activeUids.length > 4 &&
    currentLayout === getGridLayoutName();
  const {user} = props;
  const {height, width} = useWindowDimensions();
  const isActiveSpeaker = useIsActiveSpeaker();
  const isSpeaking = isActiveSpeaker(user.uid);
  //commented for v1 release
  //const remoteUserDefaultLabel = useString('remoteUserDefaultLabel')();
  const remoteUserDefaultLabel = 'User';
  const isMobile = useIsMobile()();
  return (
    <View
      style={[
        style.container,
        reduceSpace ? {left: 2, bottom: 2} : {},
        reduceSpace && activeUids.length > 12 ? {padding: 2} : {},
      ]}>
      {/* {user.audio ? (
          <AnimatedActiveSpeaker isSpeaking={isSpeaking} />
        ) : ( */}
      <ImageIcon
        iconType="plain"
        name={
          user.audio && isSpeaking
            ? 'active-speaker'
            : user.audio
            ? 'mic-on'
            : 'mic-off'
        }
        tintColor={
          user.audio
            ? $config.PRIMARY_ACTION_BRAND_COLOR
            : $config.SEMANTIC_ERROR
        }
        iconSize={20}
      />
      {/* )} */}
      {/* <ImageIcon
          name={
            isSpeaking ? 'active-speaker' : user.audio ? 'mic-on' : 'mic-off'
          }
          tintColor={
            isSpeaking
              ? $config.PRIMARY_ACTION_BRAND_COLOR
              : user.audio
              ? $config.PRIMARY_ACTION_BRAND_COLOR
              : $config.SEMANTIC_ERROR
          }
          iconSize={'small'}
        /> */}
      {!isMobile ? (
        <PlatformWrapper>
          <Text
            numberOfLines={1}
            textBreakStrategy="simple"
            ellipsizeMode="tail"
            style={style.name}>
            {user.name || remoteUserDefaultLabel}
          </Text>
        </PlatformWrapper>
      ) : (
        <></>
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
    maxWidth: 180,
  },
  name: {
    color: $config.VIDEO_AUDIO_TILE_TEXT_COLOR,
    fontSize: ThemeConfig.FontSize.small,
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    flexShrink: 1,
    marginLeft: 4,
  },
});

export default NameWithMicIcon;
