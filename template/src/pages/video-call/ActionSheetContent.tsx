import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useContext} from 'react';
import ImageIcon from '../../atoms/ImageIcon';
import LocalAudioMute, {
  LocalAudioMuteProps,
} from '../../subComponents/LocalAudioMute';
import LocalVideoMute, {
  LocalVideoMuteProps,
} from '../../subComponents/LocalVideoMute';
import LocalEndcall, {
  LocalEndcallProps,
} from '../../subComponents/LocalEndCall';
import CopyJoinInfo from '../../subComponents/CopyJoinInfo';
import LocalSwitchCamera from '../../subComponents/LocalSwitchCamera';
import Recording from '../../subComponents/Recording';
import ChatContext from '../../components/ChatContext';
import {numFormatter} from '../../utils';
import IconButton from '../../atoms/IconButton';
import {useLayout} from '../../utils/useLayout';
import useLayoutsData from '../../pages/video-call/useLayoutsData';
import {useChangeDefaultLayout} from '../../pages/video-call/DefaultLayouts';
import {PropsContext, ToggleState} from '../../../agora-rn-uikit';
import {ClientRole} from '../../../agora-rn-uikit';
import {useRoomInfo} from '../../components/room-info/useRoomInfo';
import LiveStreamControls from '../../components/livestream/views/LiveStreamControls';
import LiveStreamContext, {RaiseHandValue} from '../../components/livestream';
import {
  ChatIconButton,
  ParticipantsCountView,
  ParticipantsIconButton,
} from '../../../src/components/Navbar';
import {useChatNotification} from '../../components/chat-notification/useChatNotification';
import {SidePanelType} from '../../subComponents/SidePanelEnum';
import {useSidePanel} from '../../utils/useSidePanel';
import Settings from '../../components/Settings';
import {
  ToolbarCustomItem,
  ToolbarItem,
  useLocalUserInfo,
} from 'customization-api';
import LayoutIconButton from '../../subComponents/LayoutIconButton';
import {ActionSheetProvider} from '../../utils/useActionSheet';

//Icon for expanding Action Sheet
interface ShowMoreIconProps {
  isExpanded: boolean;
  showNotification: boolean;
  onPress: () => void;
}
const ShowMoreIcon = (props: ShowMoreIconProps) => {
  const {isExpanded, onPress, showNotification} = props;
  return (
    <ToolbarItem>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={onPress}>
          <ImageIcon
            name={isExpanded ? 'arrow-down' : 'more-menu'}
            tintColor={$config.PRIMARY_ACTION_BRAND_COLOR}
          />
        </TouchableOpacity>
        {showNotification && <View style={styles.notification} />}
      </View>
    </ToolbarItem>
  );
};

//Icon for Live Streaming Controls
const LiveStreamIcon = () => {
  //toolbaritem wrapped in the LiveStreamControls
  return <LiveStreamControls showControls={true} />;
};

//Icon for Chat
const ChatIcon = () => {
  return (
    <ToolbarItem>
      <ChatIconButton />
    </ToolbarItem>
  );
};

//Icon for Participants
const ParticipantsIcon = () => {
  return (
    <ToolbarItem>
      <ParticipantsIconButton />
    </ToolbarItem>
  );
};

//Icon for Recording

const RecordingIcon = () => {
  return (
    <ToolbarItem>
      <Recording />
    </ToolbarItem>
  );
};

const SwitchCameraIcon = () => {
  return (
    <ToolbarItem>
      <LocalSwitchCamera />
    </ToolbarItem>
  );
};

const SettingsIcon = () => {
  return (
    <ToolbarItem>
      <Settings />
    </ToolbarItem>
  );
};

const ShareIcon = () => {
  return (
    <ToolbarItem>
      <CopyJoinInfo />
    </ToolbarItem>
  );
};

const AudioIcon = () => {
  return (
    <ToolbarItem>
      <LocalAudioMute />
    </ToolbarItem>
  );
};

const CamIcon = () => {
  return (
    <ToolbarItem>
      <LocalVideoMute />
    </ToolbarItem>
  );
};

const EndCallIcon = () => {
  return (
    <ToolbarItem>
      <LocalEndcall />
    </ToolbarItem>
  );
};

const LayoutIcon = () => {
  return (
    <ToolbarItem>
      <LayoutIconButton />
    </ToolbarItem>
  );
};

const ActionSheetContent = (props) => {
  const {
    handleSheetChanges,
    isExpanded,
    customItems = [],
    includeDefaultItems = true,
    displayCustomBottomSheetContent = false,
    customBottomSheetContent,
  } = props;

  if (displayCustomBottomSheetContent) {
    return <View>{customBottomSheetContent}</View>;
  }

  const {onlineUsersCount, localUid} = useContext(ChatContext);
  const layouts = useLayoutsData();
  const {currentLayout} = useLayout();
  const changeLayout = useChangeDefaultLayout();
  const {rtcProps} = useContext(PropsContext);
  const {sidePanel, setSidePanel} = useSidePanel();
  const {
    data: {isHost},
  } = useRoomInfo();
  const {isPendingRequestToReview, raiseHandList} =
    useContext(LiveStreamContext);
  const {totalUnreadCount} = useChatNotification();
  const layout = layouts.findIndex((item) => item.name === currentLayout);
  const isLiveStream = $config.EVENT_MODE;
  const isAudience = rtcProps?.role == ClientRole.Audience;
  const isBroadCasting = rtcProps?.role == ClientRole.Broadcaster;
  const isHandRaised = raiseHandList[localUid]?.raised === RaiseHandValue.TRUE;

  const handleLayoutChange = () => {
    changeLayout();
  };

  const isAudioRoom = $config.AUDIO_ROOM;
  const isVoiceChatHost = !$config.EVENT_MODE && $config.AUDIO_ROOM && isHost;
  const isVoiceChatAudience =
    !$config.EVENT_MODE && $config.AUDIO_ROOM && isAudience;
  const isAudioCastHost = $config.EVENT_MODE && $config.AUDIO_ROOM && isHost;
  const isAudioCastAudience =
    $config.EVENT_MODE && $config.AUDIO_ROOM && isAudience;

  const isAudioVideoControlsDisabled =
    isAudience && $config.EVENT_MODE && !$config.RAISE_HAND;
  const isVideoDisabled = useLocalUserInfo().video === ToggleState.disabled;

  const defaultItems = [
    {
      default: true,
      order: 0,
      hide: 'no',
      align: 'start',
      component: isAudioVideoControlsDisabled ? null : <AudioIcon />,
    },
    {
      default: true,
      order: 0,
      hide: 'no',
      align: 'start',
      /*For AudioCast Host:Chat ,Attendee:Raise Hand 
          For VoiceChat Host:Chat, Attendee:Chat
         */
      component: (isAudioCastHost ||
        isVoiceChatHost ||
        isVoiceChatAudience) && <ChatIcon />,
    },

    {
      default: true,
      order: 0,
      hide: 'no',
      align: 'start',
      component:
        (isAudioCastAudience && isLiveStream && isAudience) ||
        (isBroadCasting && !isHost) ? (
          $config.RAISE_HAND && isAudioRoom ? (
            <LiveStreamIcon />
          ) : null
        ) : null,
    },
    {
      default: true,
      order: 1,
      hide: 'no',
      align: 'start',
      component:
        !isAudioRoom && (isAudioVideoControlsDisabled ? null : <CamIcon />),
    },
    {
      default: true,
      order: 2,
      hide: 'no',
      align: 'start',
      component: <EndCallIcon />,
    },
    //reset of the controls
    {
      default: true,
      order: 4,
      hide: 'no',
      align: 'start',
      component:
        (isLiveStream && isAudience) || (isBroadCasting && !isHost) ? (
          $config.RAISE_HAND && !isAudioRoom ? (
            <LiveStreamIcon />
          ) : null
        ) : null,
    },
    {
      default: true,
      order: 5,
      hide: 'no',
      align: 'start',
      component: <LayoutIcon />,
    },
    {
      default: true,
      order: 6,
      hide: 'no',
      align: 'start',
      component: !(
        isAudioCastHost ||
        isVoiceChatHost ||
        isVoiceChatAudience
      ) && <ChatIcon />,
    },
    {
      default: true,
      order: 7,
      hide: 'no',
      align: 'start',
      component: <ParticipantsIcon />,
    },
    {
      default: true,
      order: 8,
      hide: 'no',
      align: 'start',
      component: isHost && $config.CLOUD_RECORDING ? <RecordingIcon /> : null,
    },
    {
      default: true,
      order: 9,
      hide: 'no',
      align: 'start',
      component:
        !isAudioRoom &&
        (isAudioVideoControlsDisabled ? null : <SwitchCameraIcon />),
    },
    {
      default: true,
      order: 10,
      hide: 'no',
      align: 'start',
      component: <SettingsIcon />,
    },
    {
      default: true,
      order: 11,
      hide: 'no',
      align: 'start',
      component: <ShareIcon />,
    },
  ];

  const isHidden = (i) => {
    return i?.hide === 'yes';
  };
  const combinedItems = customItems
    ?.filter((i) => !isHidden(i))
    ?.concat(includeDefaultItems ? defaultItems : [])
    //to filter empty component because of some condition array will have empty component
    ?.filter((i) => i?.component)
    ?.sort((a, b) => a?.order - b?.order);

  return (
    <View>
      {/* Row Always Visible */}
      <ActionSheetProvider isOnFirstRow={true}>
        <View
          style={[
            styles.row,
            {borderBottomWidth: 1, paddingTop: 4, justifyContent: 'center'},
          ]}>
          {/**If no items more than 4 then render firstrender first 3 items and render show more icon  */}
          {/**If no items more less or equal to 4 then render n items and don't show more icon  */}
          {combinedItems
            ?.slice(0, combinedItems?.length > 4 ? 3 : 4)
            ?.map((i) => {
              const Component = i?.component;
              if (Component) {
                return i?.default ? Component : <Component />;
              } else {
                return null;
              }
            })}
          {combinedItems && combinedItems?.length > 4 ? (
            <ShowMoreIcon
              isExpanded={isExpanded}
              showNotification={
                (!isExpanded && totalUnreadCount !== 0) ||
                ($config.EVENT_MODE && isPendingRequestToReview)
              }
              onPress={() => handleSheetChanges(isExpanded ? 0 : 1)}
            />
          ) : (
            <></>
          )}
        </View>
      </ActionSheetProvider>
      {/* Rest Of Controls */}
      <View style={styles.row}>
        {combinedItems?.length > 4 &&
          combinedItems?.slice(3, combinedItems?.length)?.map((i) => {
            const Component = i?.component;
            if (Component) {
              return i?.default ? Component : <Component />;
            } else {
              return null;
            }
          })}
      </View>
    </View>
  );
};

export default ActionSheetContent;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 24,
    borderColor: $config.CARD_LAYER_3_COLOR,
    flexWrap: 'wrap',
  },

  iconContainer: {
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconWithText: {
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '25%',
    paddingBottom: 24,
  },
  iconText: {
    color: $config.FONT_COLOR,
    marginTop: 8,
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Source Sans Pro',
    textAlign: 'center',
  },
  notification: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: $config.SEMANTIC_ERROR,
    borderRadius: 6,
    top: -1,
    right: 5,
  },
});
