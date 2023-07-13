import React, {useState, useRef, useContext, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
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
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import {useScreenContext} from '../../components/contexts/ScreenShareContext';
import ZoomableWrapper from './ZoomableWrapper';
interface VideoRendererProps {
  user: RenderInterface;
  isMax?: boolean;
}
const VideoRenderer: React.FC<VideoRendererProps> = ({user, isMax = false}) => {
  const {dispatch, RtcEngine} = useRtc();
  const {height, width} = useWindowDimensions();
  const isActiveSpeaker = useIsActiveSpeaker();
  const {pinnedUid, activeUids} = useRender();
  const activeSpeaker = isActiveSpeaker(user.uid);
  const [isHovered, setIsHovered] = useState(false);
  const {rtcProps} = useContext(PropsContext);
  const {currentLayout} = useLayout();
  const showReplacePin =
    pinnedUid && !isMax && isHovered && currentLayout === getPinnedLayoutName();
  const showPinForMe =
    !pinnedUid &&
    !isMax &&
    isHovered &&
    currentLayout === getPinnedLayoutName();
  const [videoTileWidth, setVideoTileWidth] = useState(0);
  const [avatarSize, setAvatarSize] = useState(100);
  const videoMoreMenuRef = useRef(null);
  const [actionMenuVisible, setActionMenuVisible] = React.useState(false);

  const {
    screenShareData,
    setScreenShareData,
    isScreenShareOnFullView,
    setScreenShareOnFullView,
  } = useScreenContext();

  return (
    <>
      <UserActionMenuOptionsOptions
        actionMenuVisible={actionMenuVisible}
        setActionMenuVisible={(flag) => {
          //once user clicks action menu item -> hide the action menu and set parent isHovered false
          if (!flag) {
            setIsHovered(false);
          }
          setActionMenuVisible(flag);
        }}
        user={user}
        btnRef={videoMoreMenuRef}
        from={'video-tile'}
      />
      <VideoTileWrapper
        isScreenShareOnFullView={isScreenShareOnFullView}
        onPressVideoTile={() => {}}>
        <PlatformWrapper isHovered={isHovered} setIsHovered={setIsHovered}>
          <View
            onLayout={({
              nativeEvent: {
                layout: {x, y, width, height},
              },
            }) => {
              setVideoTileWidth(width);
              setAvatarSize(Math.floor(width * 0.35));
            }}
            style={[
              maxStyle.container,
              activeSpeaker
                ? maxStyle.activeContainerStyle
                : user.video
                ? maxStyle.noVideoStyle
                : maxStyle.nonActiveContainerStyle,
            ]}>
            {!showReplacePin && !showPinForMe && (
              <ScreenShareNotice uid={user.uid} isMax={isMax} />
            )}
            {screenShareData && screenShareData?.[user.uid] && isMobileUA() ? (
              <IconButton
                containerStyle={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  zIndex: 999,
                  elevation: 999,
                }}
                onPress={() => {
                  setScreenShareOnFullView(
                    !screenShareData[user.uid]?.isExpanded,
                  );
                  setScreenShareData((prevState) => {
                    return {
                      ...prevState,
                      [user.uid]: {
                        ...prevState[user.uid],
                        isExpanded: !prevState[user.uid]?.isExpanded,
                      },
                    };
                  });
                }}
                iconProps={{
                  iconContainerStyle: {
                    padding: 8,
                    backgroundColor:
                      $config.CARD_LAYER_5_COLOR +
                      hexadecimalTransparency['10%'],
                  },
                  name:
                    screenShareData?.[user?.uid]?.isExpanded === true
                      ? 'collapse'
                      : 'expand',
                  tintColor: $config.SECONDARY_ACTION_COLOR,
                  iconSize: 24,
                }}
              />
            ) : (
              <></>
            )}
            {!isScreenShareOnFullView && <NetworkQualityPill user={user} />}
            <ZoomableWrapper
              enableZoom={
                screenShareData && screenShareData?.[user.uid] ? true : false
              }>
              <MaxVideoView
                fallback={() => {
                  return FallbackLogo(
                    user?.name,
                    activeSpeaker,
                    (showReplacePin || showPinForMe) && !isMobileUA()
                      ? true
                      : false,
                    isMax,
                    avatarSize,
                  );
                }}
                user={user}
                containerStyle={{
                  width: isScreenShareOnFullView ? height : '100%',
                  height: isScreenShareOnFullView ? width : '100%',
                  // width: '100%',
                  // height: '100%',
                }}
                key={user.uid}
                landscapeMode={isScreenShareOnFullView ? true : false}
              />
            </ZoomableWrapper>
            {!isScreenShareOnFullView && (
              <NameWithMicIcon
                videoTileWidth={videoTileWidth}
                user={user}
                isMax={isMax}
              />
            )}
            {!isScreenShareOnFullView &&
            user.uid !== rtcProps?.screenShareUid &&
            (isHovered || actionMenuVisible || isMobileUA()) ? (
              <MoreMenu
                videoMoreMenuRef={videoMoreMenuRef}
                setActionMenuVisible={setActionMenuVisible}
              />
            ) : (
              <></>
            )}
            {(showReplacePin || showPinForMe) && !isMobileUA() ? (
              <IconButton
                onPress={() => {
                  dispatch({type: 'UserPin', value: [user.uid]});
                }}
                containerStyle={maxStyle.replacePinContainer}
                btnTextProps={{
                  text: showReplacePin ? 'Replace Pin' : 'Pin for me',
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
      </VideoTileWrapper>
    </>
  );
};

const VideoTileWrapper = (props) => {
  if (props?.isScreenShareOnFullView) {
    return (
      <TouchableOpacity
        style={{
          flex: 1,
        }}
        onPress={props?.onPressVideoTile}>
        {props?.children}
      </TouchableOpacity>
    );
  } else {
    return props?.children;
  }
};

interface MoreMenuProps {
  setActionMenuVisible: (f: boolean) => void;
  videoMoreMenuRef: any;
}
const MoreMenu = ({setActionMenuVisible, videoMoreMenuRef}: MoreMenuProps) => {
  const {activeUids} = useRender();
  const {currentLayout} = useLayout();
  const reduceSpace =
    isMobileUA() &&
    activeUids.length > 4 &&
    currentLayout === getGridLayoutName();
  return (
    <>
      <View
        ref={videoMoreMenuRef}
        collapsable={false}
        style={{
          position: 'absolute',
          right: reduceSpace ? 2 : 8,
          bottom: reduceSpace ? 2 : 8,
          zIndex: 999,
        }}>
        <IconButton
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
            tintColor: $config.SECONDARY_ACTION_COLOR,
          }}
        />
      </View>
    </>
  );
};

const PlatformWrapper = ({children, setIsHovered, isHovered}) => {
  return isWebInternal() && !isMobileUA() ? (
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
