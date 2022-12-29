import React, {useRef, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {RenderInterface, UidType} from '../../../agora-rn-uikit';
import ScreenShareNotice from '../../subComponents/ScreenShareNotice';
import {MaxVideoView} from '../../../agora-rn-uikit';
import FallbackLogo from '../../subComponents/FallbackLogo';
import NetworkQualityPill from '../../subComponents/NetworkQualityPill';
import NameWithMicIcon from './NameWithMicIcon';
import useIsActiveSpeaker from '../../utils/useIsActiveSpeaker';
import {
  isWeb,
  MUTE_REMOTE_TYPE,
  useLayout,
  useMeetingInfo,
  useRemoteMute,
  useRender,
  useRtc,
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
        <ScreenShareNotice uid={user.uid} />
        <NetworkQualityPill user={user} />
        <MaxVideoView
          fallback={() => {
            return FallbackLogo(
              user?.name,
              activeSpeaker,
              isHovered && !isMax && pinnedUid ? true : false,
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
        {isHovered ? (
          <MoreMenu isMax={isMax} pinnedUid={pinnedUid} user={user} />
        ) : (
          <></>
        )}
        {pinnedUid && !isMax && isHovered ? (
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
              name: 'pin',
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
  const {dispatch} = useRtc();
  const {setLayout} = useLayout();
  const videoMoreMenuRef = useRef(null);
  const {hostUids} = useLiveStreamDataContext();
  const [actionMenuVisible, setActionMenuVisible] = React.useState(false);
  const remoteRequest = useRemoteRequest();
  const remoteMute = useRemoteMute();
  const {
    data: {isHost},
  } = useMeetingInfo();
  const [removeMeetingPopupVisible, setRemoveMeetingPopupVisible] =
    useState(false);
  const endRemoteCall = useRemoteEndCall();
  const [pos, setPos] = useState({top: 0, left: 0});
  const showMoreMenu = () => {
    videoMoreMenuRef?.current?.measure((_fx, _fy, _w, h, _px, _py) => {
      setPos({
        top: _py,
        left: _px,
      });
    });
    setActionMenuVisible(true);
  };
  const renderActionMenu = () => {
    const items: ActionMenuItem[] = [];
    if (!(pinnedUid && isMax)) {
      items.push({
        icon: 'pin',
        iconColor: $config.SECONDARY_ACTION_COLOR,
        textColor: $config.SECONDARY_ACTION_COLOR,
        title: pinnedUid ? 'Replace pin' : 'Pin for me',
        callback: () => {
          setActionMenuVisible(false);
          dispatch({type: 'UserPin', value: [user.uid]});
          setLayout(getPinnedLayoutName());
        },
      });
    }
    if (
      (isHost && !$config.EVENT_MODE) ||
      ($config.EVENT_MODE &&
        $config.RAISE_HAND &&
        hostUids.indexOf(user.uid) !== -1)
    ) {
      items.push({
        icon: user.video ? 'video-off-outlined' : 'video-on-outlined',
        iconColor: $config.SECONDARY_ACTION_COLOR,
        textColor: $config.SECONDARY_ACTION_COLOR,
        title: user.video ? 'Mute Video' : 'Request Video',
        callback: () => {
          setActionMenuVisible(false);
          user.video
            ? remoteMute(MUTE_REMOTE_TYPE.video, user.uid)
            : remoteRequest(REQUEST_REMOTE_TYPE.video, user.uid);
        },
      });
      items.push({
        icon: user.audio ? 'mic-off-outlined' : 'mic-on-outlined',
        iconColor: $config.SECONDARY_ACTION_COLOR,
        textColor: $config.SECONDARY_ACTION_COLOR,
        title: user.audio ? 'Mute Audio' : 'Request Audio',
        callback: () => {
          setActionMenuVisible(false);
          user.audio
            ? remoteMute(MUTE_REMOTE_TYPE.audio, user.uid)
            : remoteRequest(REQUEST_REMOTE_TYPE.audio, user.uid);
        },
      });
    }

    if (isHost) {
      items.push({
        icon: 'remove-meeting',
        iconColor: $config.SEMANTIC_ERROR,
        textColor: $config.SEMANTIC_ERROR,
        title: 'Remove from meeting',
        callback: () => {
          setActionMenuVisible(false);
          setRemoveMeetingPopupVisible(true);
        },
      });
    }

    return (
      <>
        {isHost ? (
          <RemoveMeetingPopup
            modalVisible={removeMeetingPopupVisible}
            setModalVisible={setRemoveMeetingPopupVisible}
            username={user.name}
            removeUserFromMeeting={() => endRemoteCall(user.uid)}
          />
        ) : (
          <></>
        )}
        <ActionMenu
          actionMenuVisible={actionMenuVisible}
          setActionMenuVisible={setActionMenuVisible}
          modalPosition={{top: pos.top - 160, left: pos.left - 200}}
          items={items}
        />
      </>
    );
  };

  return (
    <>
      <View style={{position: 'absolute', right: 12, bottom: 12}}>
        {renderActionMenu()}
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
  return isWeb() ? (
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
    {children}
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
    borderRadius: 12,
    borderWidth: 4,
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
