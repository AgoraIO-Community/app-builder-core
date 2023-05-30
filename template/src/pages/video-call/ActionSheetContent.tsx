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
  isWeb,
  useRtc,
} from 'customization-api';

import LayoutIconButton from '../../subComponents/LayoutIconButton';
import CaptionIcon from '../../subComponents/caption/CaptionIcon';
import TranscriptIcon from '../../subComponents/caption/TranscriptIcon';
import protoRoot from '../../../src/subComponents/caption/proto/ptoto';

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
interface LiveStreamIconProps {
  isHandRaised: boolean;
  showLabel?: boolean;
}
const LiveStreamIcon = (props: LiveStreamIconProps) => {
  const {isHandRaised, showLabel = $config.ICON_TEXT} = props;
  return (
    <ToolbarItem>
      <View style={styles.iconContainer}>
        <LiveStreamControls
          showControls={true}
          isDesktop={false}
          showLabel={false}
        />
      </View>
      {showLabel && (
        <Text style={styles.iconText}>
          {isHandRaised ? 'Lower\nHand' : 'Raise\nHand'}
        </Text>
      )}
    </ToolbarItem>
  );
};

//Icon for Chat
interface ChatIconProps {
  showLabel?: boolean;
}
const ChatIcon = (props: ChatIconProps) => {
  const {showLabel = $config.ICON_TEXT} = props;
  return (
    <ToolbarItem>
      <View style={styles.iconContainer}>
        <ChatIconButton isOnActionSheet={true} />
      </View>
      {showLabel && <Text style={styles.iconText}>Chat</Text>}
    </ToolbarItem>
  );
};

//Icon for Participants
interface ParticipantsIconProps {
  showNotification: boolean;
}
const ParticipantsIcon = (props: ParticipantsIconProps) => {
  const {showNotification} = props;
  return (
    <ToolbarItem>
      <View style={styles.iconContainer}>
        <ParticipantsIconButton isOnActionSheet={true} />
      </View>
      {$config.ICON_TEXT && <Text style={styles.iconText}>People</Text>}
    </ToolbarItem>
  );
};

//Icon for Recording
interface RecordingIconProps {
  showLabel?: boolean;
}
const RecordingIcon = (props: RecordingIconProps) => {
  const {showLabel = $config.ICON_TEXT} = props;
  return (
    <ToolbarItem>
      <View style={styles.iconContainer}>
        <Recording showLabel={false} isOnActionSheet={true} />
      </View>
      {showLabel && <Text style={styles.iconText}>Record</Text>}
    </ToolbarItem>
  );
};

interface SwitchCameraIconProps {
  disabled: boolean;
}
const SwitchCameraIcon = (props: SwitchCameraIconProps) => {
  const {disabled} = props;
  return (
    <ToolbarItem>
      <View style={styles.iconContainer}>
        <LocalSwitchCamera showLabel={false} disabled={disabled} />
      </View>
      {$config.ICON_TEXT && (
        <View>
          <Text
            style={[
              styles.iconText,
              {
                color: disabled ? $config.SEMANTIC_NEUTRAL : $config.FONT_COLOR,
              },
            ]}>
            Switch
          </Text>
          <Text
            style={[
              styles.iconText,
              {
                color: disabled ? $config.SEMANTIC_NEUTRAL : $config.FONT_COLOR,
                marginTop: 0,
              },
            ]}>
            Camera
          </Text>
        </View>
      )}
    </ToolbarItem>
  );
};

interface SettingsIconProps {
  onPress: () => void;
}
const SettingsIcon = (props: SettingsIconProps) => {
  const {onPress} = props;
  return (
    <ToolbarItem>
      <TouchableOpacity style={styles.iconContainer} onPress={onPress}>
        <ImageIcon
          name={'settings'}
          tintColor={$config.SECONDARY_ACTION_COLOR}
        />
      </TouchableOpacity>
      {$config.ICON_TEXT && <Text style={styles.iconText}>Settings</Text>}
    </ToolbarItem>
  );
};

const ShareIcon = () => {
  return (
    <ToolbarItem>
      <View style={styles.iconContainer}>
        <CopyJoinInfo showLabel={false} isOnActionSheet={true} />
      </View>
      {$config.ICON_TEXT && <Text style={styles.iconText}>Invite</Text>}
    </ToolbarItem>
  );
};

interface AudioIconProps {
  isMobileView: boolean;
  isOnActionSheet: boolean;
  showLabel: boolean;
  disabled: boolean;
}
const AudioIcon = (props: AudioIconProps) => {
  return (
    <ToolbarItem>
      <View style={styles.iconContainer}>
        <LocalAudioMute {...props} />
      </View>
    </ToolbarItem>
  );
};

interface CamIconProps {
  isMobileView: boolean;
  isOnActionSheet: boolean;
  showLabel: boolean;
  disabled: boolean;
}
const CamIcon = (props: CamIconProps) => {
  return (
    <ToolbarItem>
      <View style={styles.iconContainer}>
        <LocalVideoMute {...props} />
      </View>
    </ToolbarItem>
  );
};

interface EndCallIconProps {
  showLabel: boolean;
  isOnActionSheet: boolean;
}
const EndCallIcon = (props: EndCallIconProps) => {
  return (
    <ToolbarItem>
      <View
        style={[
          styles.iconContainer,
          {backgroundColor: $config.SEMANTIC_ERROR},
        ]}>
        <LocalEndcall {...props} />
      </View>
    </ToolbarItem>
  );
};

interface LayoutIconProps {
  showLabel?: boolean;
}
const LayoutIcon = (props: LayoutIconProps) => {
  const {showLabel = $config.ICON_TEXT} = props;
  return (
    <ToolbarItem>
      <View style={styles.iconContainer}>
        <LayoutIconButton showLabel={false} />
      </View>
      {showLabel && <Text style={styles.iconText}>Layout</Text>}
    </ToolbarItem>
  );
};

interface CaptionIconBtnProps {
  showLabel?: boolean;
}

const CaptionIconBtn = (props: CaptionIconBtnProps) => {
  const {showLabel = $config.ICON_TEXT} = props;
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <CaptionIcon isOnActionSheet={true} showLabel={false} />
      </View>
      {showLabel && <Text style={styles.iconText}>Caption</Text>}
    </View>
  );
};

interface TranscriptIconProps {
  showLabel?: boolean;
}

const TranscriptIconBtn = (props: TranscriptIconProps) => {
  const {showLabel = $config.ICON_TEXT} = props;
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <TranscriptIcon isOnActionSheet={true} showLabel={false} />
      </View>
      {showLabel && <Text style={styles.iconText}>Transcript</Text>}
    </View>
  );
};

const TestStreamMessageIcon = () => {
  const {RtcEngine} = useRtc();
  const [streamId, setStreamId] = React.useState(0);

  // Create data stream

  React.useEffect(() => {
    const createDataStream = async () => {
      const config = {
        syncWithAudio: true,
        ordered: true,
      };
      try {
        const id = await RtcEngine.createDataStreamWithConfig(config);
        setStreamId(id);
      } catch (err) {
        console.error('Error on creating data stream:', err);
        setStreamId(0);
      }
    };
    createDataStream();
  }, []);

  const handleStreamMessage = async () => {
    const Text = protoRoot.lookupType('Text');
    // sample message to encode.
    const message = {
      vendor: 1,
      version: 2,
      seqnum: 3,
      uid: 4,
      flag: 5,
      time: Date.now(),
      lang: 7,
      starttime: 8,
      offtime: 9,
      words: [
        {
          text: 'agora check',
          start_ms: 0,
          duration_ms: 0,
          is_final: true,
          confidence: 1.0,
        },
      ],
    };

    const encodedMessage = Text.encode(Text.create(message)).finish();

    const buffer = [
      32, 162, 174, 128, 123, 48, 235, 205, 240, 230, 253, 48, 72, 162, 67, 82,
      19, 10, 3, 79, 75, 46, 24, 246, 4, 32, 1, 41, 0, 0, 0, 192, 44, 7, 235,
      63, 96, 246, 4, 106, 10, 116, 114, 97, 110, 115, 99, 114, 105, 98, 101,
      122, 5, 101, 110, 45, 85, 83,
    ];

    const messageString = buffer.toString();

    console.warn('stream ID  :=>', streamId),
      console.warn('stream message  =>', messageString),
      RtcEngine.sendStreamMessage(streamId, buffer.toString());
  };

  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={handleStreamMessage}>
          <ImageIcon
            name={'alert'}
            tintColor={$config.PRIMARY_ACTION_BRAND_COLOR}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

type ActionSheetComponentsProps = [
  (props: AudioIconProps) => JSX.Element,
  (props: CamIconProps) => JSX.Element,
  (props: EndCallIconProps) => JSX.Element,
  (props: ShowMoreIconProps) => JSX.Element,
  (props: ChatIconProps) => JSX.Element,
  (props: ParticipantsIconProps) => JSX.Element,
  (props) => JSX.Element,
  (props: SwitchCameraIconProps) => JSX.Element,
  (props: LayoutIconProps) => JSX.Element,
  (props: SettingsIconProps) => JSX.Element,
  (props) => JSX.Element,
];

export const ActionSheetComponentsArray: ActionSheetComponentsProps = [
  AudioIcon,
  CamIcon,
  EndCallIcon,
  ShowMoreIcon,
  ChatIcon,
  ParticipantsIcon,
  RecordingIcon,
  SwitchCameraIcon,
  LayoutIcon,
  SettingsIcon,
  ShareIcon,
];

const ActionSheetContent = (props) => {
  const {
    handleSheetChanges,
    isExpanded,
    customItems = [],
    includeDefaultItems = true,
  } = props;
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
      component: isAudioVideoControlsDisabled ? null : (
        <AudioIcon
          isMobileView={true}
          isOnActionSheet={true}
          showLabel={false}
          disabled={isLiveStream && isAudience && !isBroadCasting}
        />
      ),
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
        isVoiceChatAudience) && <ChatIcon showLabel={false} />,
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
            <LiveStreamIcon isHandRaised={isHandRaised} showLabel={false} />
          ) : null
        ) : null,
    },
    {
      default: true,
      order: 1,
      hide: 'no',
      align: 'start',
      component:
        !isAudioRoom &&
        (isAudioVideoControlsDisabled ? null : (
          <CamIcon
            isOnActionSheet={true}
            isMobileView={true}
            showLabel={false}
            disabled={isLiveStream && isAudience && !isBroadCasting}
          />
        )),
    },
    {
      default: true,
      order: 2,
      hide: 'no',
      align: 'start',
      component: <EndCallIcon showLabel={false} isOnActionSheet={true} />,
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
            <LiveStreamIcon isHandRaised={isHandRaised} />
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
      component: (
        <ParticipantsIcon
          showNotification={$config.EVENT_MODE && isPendingRequestToReview}
        />
      ),
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
        (isAudioVideoControlsDisabled ? null : (
          <SwitchCameraIcon
            disabled={
              (isLiveStream && isAudience && !isBroadCasting) || isVideoDisabled
            }
          />
        )),
    },
    {
      default: true,
      order: 10,
      hide: 'no',
      align: 'start',
      component: (
        <SettingsIcon
          onPress={() => {
            setSidePanel(SidePanelType.Settings);
          }}
        />
      ),
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
  // const combinedItems = customItems
  //   ?.filter((i) => !isHidden(i))
  //   ?.concat(includeDefaultItems ? defaultItems : [])
  //   //to filter empty component because of some condition array will have empty component
  //   ?.filter((i) => i?.component);
  //?.sort((a, b) => a?.order - b?.order);
  const combinedItems = includeDefaultItems
    ? defaultItems
        .concat(customItems?.filter((i) => !isHidden(i)))
        ?.filter((i) => i?.component)
    : customItems?.filter((i) => !isHidden(i))?.filter((i) => i?.component);

  return (
    <View>
      {/* Row Always Visible */}
      <View
        style={[
          styles.row,
          {borderBottomWidth: 1, paddingTop: 4, justifyContent: 'center'},
        ]}>
        {/**If no items more than 4 then render firstrender first 3 items and render show more icon  */}
        {/**If no items more less or equal to 4 then render n items and don't show more icon  */}
        {combinedItems
          ?.slice(0, combinedItems?.length >= 4 ? 3 : 4)
          ?.map((i) => {
            const Component = i?.component;
            if (Component) {
              return i?.default ? Component : <Component />;
            } else {
              return null;
            }
          })}
        {combinedItems && combinedItems?.length >= 4 ? (
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

      {/* Rest Of Controls */}
      <View style={styles.row}>
        {combinedItems?.length > 3 &&
          combinedItems?.slice(3, combinedItems?.length)?.map((i) => {
            const Component = i?.component;
            if (Component) {
              return i?.default ? Component : <Component />;
            } else {
              return null;
            }
          })}
        {/**
         * In event mode when raise hand feature is active
         * and audience is promoted to host, the audience can also
         * demote himself
         */}
        {/* {(isLiveStream && isAudience) || (isBroadCasting && !isHost) ? (
          $config.RAISE_HAND && !isAudioRoom ? (
            <LiveStreamIcon isHandRaised={isHandRaised} />
          ) : null
        ) : null} */}

        {/* Layout view */}
        {/* <LayoutIcon /> */}

        {/* chat */}
        {/* {!(isAudioCastHost || isVoiceChatHost || isVoiceChatAudience) && (
          <ChatIcon />
        )} */}
        {/* participants */}
        {/* <ParticipantsIcon
          showNotification={$config.EVENT_MODE && isPendingRequestToReview}
        /> */}
        {/* record */}
        {/* {isHost && $config.CLOUD_RECORDING ? <RecordingIcon /> : null} */}

        {/* switch camera */}
        {/* {!isAudioRoom &&
          (isAudioVideoControlsDisabled ? null : (
            <SwitchCameraIcon
              disabled={
                (isLiveStream && isAudience && !isBroadCasting) ||
                isVideoDisabled
              }
            />
          ))} */}

        {/* settings */}
        {/* <SettingsIcon
          onPress={() => {
            setSidePanel(SidePanelType.Settings);
          }}
        /> */}

        {/* invite */}
        {/* <ShareIcon /> */}

        {/* caption  */}
        <CaptionIconBtn />
        {/* Transcript */}
        <TranscriptIconBtn />
        {/* TODO: remove below , to test only  streamMessage callback on native */}
        {!isWeb() && <TestStreamMessageIcon />}
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
