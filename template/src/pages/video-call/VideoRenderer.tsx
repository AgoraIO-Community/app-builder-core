import React, {useState, useRef, useContext} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {
  PropsContext,
  RenderInterface,
  UidType,
  useLocalUid,
} from '../../../agora-rn-uikit';
import ScreenShareNotice from '../../subComponents/ScreenShareNotice';
import {MaxVideoView} from '../../../agora-rn-uikit';
import FallbackLogo from '../../subComponents/FallbackLogo';
import NetworkQualityPill from '../../subComponents/NetworkQualityPill';
import NameWithMicIcon from './NameWithMicIcon';
import useIsActiveSpeaker from '../../utils/useIsActiveSpeaker';
import {
  MUTE_REMOTE_TYPE,
  SidePanelType,
  useLayout,
  useMeetingInfo,
  useRemoteMute,
  useRender,
  useRtc,
  useSidePanel,
} from 'customization-api';
import {getPinnedLayoutName} from './DefaultLayouts';
import IconButton from '../../atoms/IconButton';
import ActionMenu, {ActionMenuItem} from '../../atoms/ActionMenu';
import {useLiveStreamDataContext} from '../../components/contexts/LiveStreamDataContext';
import useRemoteRequest, {
  REQUEST_REMOTE_TYPE,
} from '../../utils/useRemoteRequest';
import RemoveMeetingPopup from '../../subComponents/RemoveMeetingPopup';
import useRemoteEndCall from '../../utils/useRemoteEndCall';
import {useChatMessages} from '../../components/chat-messages/useChatMessages';
import UserActionMenuOptionsOptions from '../../components/participants/UserActionMenuOptions';
import {isWebInternal} from '../../utils/common';

interface VideoRendererProps {
  user: RenderInterface;
  isMax?: boolean;
}
const VideoRenderer: React.FC<VideoRendererProps> = ({user, isMax = false}) => {
  const {dispatch} = useRtc();
  const isActiveSpeaker = useIsActiveSpeaker();
  const {pinnedUid} = useRender();
  const activeSpeaker = isActiveSpeaker(user.uid);
  const [isHovered, setIsHovered] = useState(false);
  const {rtcProps} = useContext(PropsContext);
  const {currentLayout} = useLayout();
  const showReplacePin =
    pinnedUid && !isMax && isHovered && currentLayout === getPinnedLayoutName();
  return (
    <PlatformWrapper setIsHovered={setIsHovered}>
      <View
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
              showReplacePin ? true : false,
              isMax,
            );
          }}
          user={user}
          containerStyle={{
            width: '100%',
            height: '100%',
            borderRadius: 8,
          }}
          key={user.uid}
        />
        <NameWithMicIcon user={user} />
        {user.uid !== rtcProps?.screenShareUid && isHovered ? (
          <MoreMenu isMax={isMax} pinnedUid={pinnedUid} user={user} />
        ) : (
          <></>
        )}
        {showReplacePin ? (
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
  const {sidePanel} = useSidePanel();
  const {currentLayout} = useLayout();
  const localUid = useLocalUid();
  const {dispatch} = useRtc();
  const {setLayout} = useLayout();
  const videoMoreMenuRef = useRef(null);
  const {hostUids} = useLiveStreamDataContext();
  const [actionMenuVisible, setActionMenuVisible] = React.useState(false);
  const {openPrivateChat} = useChatMessages();
  const remoteRequest = useRemoteRequest();
  const remoteMute = useRemoteMute();
  const {setSidePanel} = useSidePanel();
  const {
    data: {isHost},
  } = useMeetingInfo();
  const [removeMeetingPopupVisible, setRemoveMeetingPopupVisible] =
    useState(false);
  const endRemoteCall = useRemoteEndCall();
  const [pos, setPos] = useState({});
  const showMoreMenu = () => {
    videoMoreMenuRef?.current?.measure((_fx, _fy, _w, h, _px, _py) => {
      const breakpoint = Dimensions.get('window').height / 2;
      let extraLeftSpace = 0;
      if (
        sidePanel !== SidePanelType.None &&
        currentLayout === getPinnedLayoutName()
      ) {
        extraLeftSpace = 50;
      }
      if (_py > breakpoint) {
        setPos({
          bottom: Dimensions.get('window').height - _py - h,
          left: _px - 200 - _w + extraLeftSpace,
        });
      } else {
        setPos({
          top: _py,
          left: _px - 200 - _w + extraLeftSpace,
        });
      }
      setActionMenuVisible(true);
    });
  };
  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  const isMobile = dim[0] < 700;
  //don't remove the commented code
  // const renderActionMenu = () => {
  //   const items: ActionMenuItem[] = [];
  //   items.push({
  //     icon: pinnedUid ? 'unpin-outlined' : 'pin-outlined',
  //     onHoverIcon: pinnedUid ? 'unpin-outlined' : 'pin-filled',
  //     iconColor: $config.SECONDARY_ACTION_COLOR,
  //     textColor: $config.SECONDARY_ACTION_COLOR,
  //     title: pinnedUid ? (isMax ? 'Unpin' : 'Replace Pin') : 'Pin for me',
  //     callback: () => {
  //       setActionMenuVisible(false);
  //       dispatch({type: 'UserPin', value: [pinnedUid && isMax ? 0 : user.uid]});
  //       setLayout(getPinnedLayoutName());
  //     },
  //   });

  //   if (localUid !== user.uid) {
  //     items.push({
  //       icon: 'chat-outlined',
  //       onHoverIcon: 'chat-filled',
  //       iconColor: $config.SECONDARY_ACTION_COLOR,
  //       textColor: $config.SECONDARY_ACTION_COLOR,
  //       title: 'Message Privately',
  //       callback: () => {
  //         setActionMenuVisible(false);
  //         openPrivateChat(user.uid);
  //       },
  //     });

  //     if (user.type === 'rtc') {
  //       if (
  //         (isHost && !$config.EVENT_MODE) ||
  //         ($config.EVENT_MODE &&
  //           $config.RAISE_HAND &&
  //           hostUids.indexOf(user.uid) !== -1)
  //       ) {
  //         items.push({
  //           icon: user.video ? 'video-off-outlined' : 'video-on-outlined',
  //           onHoverIcon: user.video ? 'video-off-filled' : 'video-on-filled',
  //           iconColor: $config.SECONDARY_ACTION_COLOR,
  //           textColor: $config.SECONDARY_ACTION_COLOR,
  //           title: user.video ? 'Mute Video' : 'Request Video',
  //           callback: () => {
  //             setActionMenuVisible(false);
  //             user.video
  //               ? remoteMute(MUTE_REMOTE_TYPE.video, user.uid)
  //               : remoteRequest(REQUEST_REMOTE_TYPE.video, user.uid);
  //           },
  //         });
  //         items.push({
  //           icon: user.audio ? 'mic-off-outlined' : 'mic-on-outlined',
  //           onHoverIcon: user.audio ? 'mic-off-filled' : 'mic-on-filled',
  //           iconColor: $config.SECONDARY_ACTION_COLOR,
  //           textColor: $config.SECONDARY_ACTION_COLOR,
  //           title: user.audio ? 'Mute Audio' : 'Request Audio',
  //           callback: () => {
  //             setActionMenuVisible(false);
  //             user.audio
  //               ? remoteMute(MUTE_REMOTE_TYPE.audio, user.uid)
  //               : remoteRequest(REQUEST_REMOTE_TYPE.audio, user.uid);
  //           },
  //         });
  //       }

  //       if (isHost) {
  //         items.push({
  //           icon: 'remove-meeting',
  //           iconColor: $config.SEMANTIC_ERROR,
  //           textColor: $config.SEMANTIC_ERROR,
  //           title: 'Remove from meeting',
  //           callback: () => {
  //             setActionMenuVisible(false);
  //             setRemoveMeetingPopupVisible(true);
  //           },
  //         });
  //       }
  //     }
  //   } else {
  //     //local user menu
  //     items.push({
  //       icon: 'pencil-outlined',
  //       onHoverIcon: 'pencil-filled',
  //       iconColor: $config.SECONDARY_ACTION_COLOR,
  //       textColor: $config.SECONDARY_ACTION_COLOR,
  //       title: 'Change Name',
  //       callback: () => {
  //         setActionMenuVisible(false);
  //         setSidePanel(SidePanelType.Settings);
  //       },
  //     });
  //   }

  //   return (
  //     <>
  //       {isHost ? (
  //         <RemoveMeetingPopup
  //           modalVisible={removeMeetingPopupVisible}
  //           setModalVisible={setRemoveMeetingPopupVisible}
  //           username={user.name}
  //           removeUserFromMeeting={() => endRemoteCall(user.uid)}
  //         />
  //       ) : (
  //         <></>
  //       )}
  //       <ActionMenu
  //         actionMenuVisible={actionMenuVisible}
  //         setActionMenuVisible={setActionMenuVisible}
  //         modalPosition={{bottom: pos.bottom + 10, left: pos.left - 200}}
  //         items={items}
  //       />
  //     </>
  //   );
  // };

  return (
    <>
      <View style={{position: 'absolute', right: 12, bottom: 12, zIndex: 999}}>
        <UserActionMenuOptionsOptions
          actionMenuVisible={actionMenuVisible}
          setActionMenuVisible={setActionMenuVisible}
          //todo pass handle close
          isMobile={isMobile}
          modalPosition={pos}
          user={user}
        />
        <IconButton
          setRef={(ref) => {
            videoMoreMenuRef.current = ref;
          }}
          onPress={() => {
            showMoreMenu();
          }}
          iconProps={{
            iconContainerStyle: {
              padding: 8,
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

const PlatformWrapper = ({children, setIsHovered}) => {
  return isWebInternal() ? (
    <div
      style={{width: '100%', height: '100%'}}
      onMouseEnter={() => {
        setIsHovered(true);
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
    borderRadius: 4,
    borderWidth: 2,
  },
  activeContainerStyle: {
    borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
  nonActiveContainerStyle: {
    borderColor: $config.VIDEO_AUDIO_TILE_COLOR,
  },
  noVideoStyle: {
    borderColor: 'transparent',
  },
});

export default VideoRenderer;
