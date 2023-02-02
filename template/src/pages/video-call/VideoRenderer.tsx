import React, {useState, useRef, useContext} from 'react';
import {View, StyleSheet} from 'react-native';
import {PropsContext, RenderInterface, UidType} from '../../../agora-rn-uikit';
import ScreenShareNotice from '../../subComponents/ScreenShareNotice';
import {MaxVideoView} from '../../../agora-rn-uikit';
import FallbackLogo from '../../subComponents/FallbackLogo';
import NetworkQualityPill from '../../subComponents/NetworkQualityPill';
import NameWithMicIcon from './NameWithMicIcon';
import useIsActiveSpeaker from '../../utils/useIsActiveSpeaker';
import {useLayout, useRender, useRtc} from 'customization-api';
import {getGridLayoutName, getPinnedLayoutName} from './DefaultLayouts';
import IconButton from '../../atoms/IconButton';
import UserActionMenuOptionsOptions from '../../components/participants/UserActionMenuOptions';
import {isMobileUA, isWebInternal} from '../../utils/common';
import ThemeConfig from '../../theme';

interface VideoRendererProps {
  user: RenderInterface;
  isMax?: boolean;
}
const VideoRenderer: React.FC<VideoRendererProps> = ({user, isMax = false}) => {
  const {dispatch} = useRtc();
  const isActiveSpeaker = useIsActiveSpeaker();
  const {pinnedUid, activeUids} = useRender();
  const activeSpeaker = isActiveSpeaker(user.uid);
  const [isHovered, setIsHovered] = useState(false);
  const {rtcProps} = useContext(PropsContext);
  const {currentLayout} = useLayout();
  const showReplacePin =
    pinnedUid && !isMax && isHovered && currentLayout === getPinnedLayoutName();
  const [videoTileWidth, setVideoTileWidth] = useState(0);
  return (
    <PlatformWrapper isHovered={isHovered} setIsHovered={setIsHovered}>
      <View
        onLayout={({
          nativeEvent: {
            layout: {x, y, width, height},
          },
        }) => {
          setVideoTileWidth(width);
        }}
        style={[
          maxStyle.container,
          activeSpeaker
            ? maxStyle.activeContainerStyle
            : user.video
            ? maxStyle.noVideoStyle
            : maxStyle.nonActiveContainerStyle,
        ]}>
        <ScreenShareNotice uid={user.uid} isMax={isMax} />
        <NetworkQualityPill user={user} />
        <MaxVideoView
          fallback={() => {
            return FallbackLogo(
              user?.name,
              activeSpeaker,
              showReplacePin && !isMobileUA() ? true : false,
              isMax,
            );
          }}
          user={user}
          containerStyle={{
            width: '100%',
            height: '100%',
          }}
          key={user.uid}
        />
        <NameWithMicIcon
          videoTileWidth={videoTileWidth}
          user={user}
          isMax={isMax}
        />
        {user.uid !== rtcProps?.screenShareUid &&
        (isHovered || isMobileUA()) ? (
          <MoreMenu isMax={isMax} pinnedUid={pinnedUid} user={user} />
        ) : (
          <></>
        )}
        {showReplacePin && !isMobileUA() ? (
          <IconButton
            onPress={() => {
              dispatch({type: 'UserPin', value: [user.uid]});
            }}
            containerStyle={maxStyle.replacePinContainer}
            btnTextProps={{
              text: 'Replace Pin',
              textColor: $config.VIDEO_AUDIO_TILE_TEXT_COLOR,
              textStyle: {
                marginTop: 0,
                fontWeight: '700',
                marginLeft: 6,
              },
            }}
            iconProps={{
              name: 'pin-filled',
              iconSize: 20,
              iconType: 'plain',
              tintColor: $config.VIDEO_AUDIO_TILE_TEXT_COLOR,
            }}
          />
        ) : (
          <></>
        )}
      </View>
    </PlatformWrapper>
  );
};

interface MoreMenuProps {
  user: RenderInterface;
  isMax: boolean;
  pinnedUid: UidType;
}
const MoreMenu = ({user, isMax, pinnedUid}: MoreMenuProps) => {
  const videoMoreMenuRef = useRef(null);
  const {activeUids} = useRender();
  const [actionMenuVisible, setActionMenuVisible] = React.useState(false);
  const {currentLayout} = useLayout();
  const reduceSpace =
    isMobileUA() &&
    activeUids.length > 4 &&
    currentLayout === getGridLayoutName();
  return (
    <>
      <View
        style={{
          position: 'absolute',
          right: reduceSpace ? 2 : 8,
          bottom: reduceSpace ? 2 : 8,
          zIndex: 999,
        }}>
        <UserActionMenuOptionsOptions
          actionMenuVisible={actionMenuVisible}
          setActionMenuVisible={setActionMenuVisible}
          user={user}
          btnRef={videoMoreMenuRef}
          from={'video-tile'}
        />
        <IconButton
          setRef={(ref) => {
            videoMoreMenuRef.current = ref;
          }}
          onPress={() => {
            setActionMenuVisible(true);
          }}
          iconProps={{
            iconContainerStyle: {
              padding: reduceSpace && activeUids.length > 12 ? 2 : 8,
              backgroundColor: $config.VIDEO_AUDIO_TILE_OVERLAY_COLOR,
            },
            name: 'more-menu',
            iconSize: 20,
            tintColor: $config.VIDEO_AUDIO_TILE_TEXT_COLOR,
          }}
        />
      </View>
    </>
  );
};

const PlatformWrapper = ({children, setIsHovered, isHovered}) => {
  return isWebInternal() ? (
    <div
      style={{width: '100%', height: '100%'}}
      /**
       * why onMouseOver is used instead of onMouseEnter
       * when user clicks close icon the participant then video tile will expand and
       * cursor will directly land on child elements. so onhover kabab menu icon is not displayed
       *
       * As per doc
       * The mouseover event triggers when the mouse pointer enters the div element, and its child elements.
       * The mouseenter event is only triggered when the mouse pointer enters the div element.
       *  */
      onMouseOver={() => {
        !isHovered && setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}>
      {children}
    </div>
  ) : (
    <>{children}</>
  );
};

const maxStyle = StyleSheet.create({
  replacePinContainer: {
    zIndex: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: $config.VIDEO_AUDIO_TILE_OVERLAY_COLOR,
    borderRadius: 8,
    flexDirection: 'row',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    margin: 'auto',
    maxWidth: 120,
    maxHeight: 32,
  },
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: ThemeConfig.BorderRadius.small,
    borderWidth: 2,
  },
  activeContainerStyle: {
    borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
  nonActiveContainerStyle: {
    borderColor: 'transparent',
  },
  noVideoStyle: {
    borderColor: 'transparent',
  },
});

export default VideoRenderer;
