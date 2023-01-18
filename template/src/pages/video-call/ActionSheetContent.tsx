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
import {useMeetingInfo} from '../../components/meeting-info/useMeetingInfo';
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
import {useLocalUserInfo} from 'customization-api';

//Icon for expanding Action Sheet
interface ShowMoreIconProps {
  isExpanded: boolean;
  showNotification: boolean;
  onPress: () => void;
}
const ShowMoreIcon = (props: ShowMoreIconProps) => {
  const {isExpanded, onPress, showNotification} = props;
  return (
    <View style={styles.iconContainer}>
      <TouchableOpacity onPress={onPress}>
        <ImageIcon
          name={isExpanded ? 'arrow-down' : 'more-menu'}
          tintColor={$config.PRIMARY_ACTION_BRAND_COLOR}
        />
      </TouchableOpacity>
      {showNotification && <View style={styles.notification} />}
    </View>
  );
};

//Icon for Live Streaming Controls
interface LiveStreamIconProps {
  isHandRaised: boolean;
}
const LiveStreamIcon = (props: LiveStreamIconProps) => {
  const {isHandRaised} = props;
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <LiveStreamControls showControls={true} isDesktop={false} />
      </View>
      <Text style={styles.iconText}>
        {isHandRaised ? 'Lower\nHand' : 'Raise\nHand'}
      </Text>
    </View>
  );
};

//Icon for Chat
const ChatIcon = () => {
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <ChatIconButton isOnActionSheet={true} />
      </View>
      <Text style={styles.iconText}>Chat</Text>
    </View>
  );
};

//Icon for Participants
interface ParticipantsIconProps {
  showNotification: boolean;
}
const ParticipantsIcon = (props: ParticipantsIconProps) => {
  const {showNotification} = props;
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <ParticipantsIconButton isOnActionSheet={true} />
      </View>
      <Text style={styles.iconText}>People</Text>
      {showNotification && <View style={styles.notification} />}
    </View>
  );
};

//Icon for Recording
const RecordingIcon = () => {
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <Recording showLabel={false} isOnActionSheet={true} />
      </View>
      <Text style={styles.iconText}>Record</Text>
    </View>
  );
};

interface SwitchCameraIconProps {
  disabled: boolean;
}
const SwitchCameraIcon = (props: SwitchCameraIconProps) => {
  const {disabled} = props;
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <LocalSwitchCamera showLabel={false} disabled={disabled} />
      </View>
      <Text
        style={[
          styles.iconText,
          {
            color: disabled ? $config.SEMANTIC_NETRUAL : $config.FONT_COLOR,
          },
        ]}>
        Switch {'\n'} Camera
      </Text>
    </View>
  );
};

interface LayoutIconProps {
  onPress: () => void;
  currentLayout: string;
}
const LayoutIcon = (props: LayoutIconProps) => {
  const {onPress, currentLayout} = props;
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <IconButton
          onPress={onPress}
          isOnActionSheet={true}
          iconProps={{
            name: currentLayout === 'grid' ? 'grid' : 'list-view',
            tintColor: $config.PRIMARY_ACTION_TEXT_COLOR,
          }}
        />
        {/* layout */}
      </View>
      <Text style={styles.iconText}>Layout</Text>
    </View>
  );
};

interface SettingsIconProps {
  onPress: () => void;
}
const SettingsIcon = (props: SettingsIconProps) => {
  const {onPress} = props;
  return (
    <View style={styles.iconWithText}>
      <TouchableOpacity style={styles.iconContainer} onPress={onPress}>
        <ImageIcon
          name={'settings'}
          tintColor={$config.PRIMARY_ACTION_TEXT_COLOR}
        />
      </TouchableOpacity>
      <Text style={styles.iconText}>Settings</Text>
    </View>
  );
};

const ShareIcon = () => {
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <CopyJoinInfo showLabel={false} isOnActionSheet={true} />
      </View>
      <Text style={styles.iconText}>Invite</Text>
    </View>
  );
};

type ActionSheetComponentsProps = [
  (props: LocalAudioMuteProps) => JSX.Element,
  (props: LocalVideoMuteProps) => JSX.Element,
  (props: LocalEndcallProps) => JSX.Element,
  (props: ShowMoreIconProps) => JSX.Element,
  () => JSX.Element,
  (props: ParticipantsIconProps) => JSX.Element,
  () => JSX.Element,
  (props: SwitchCameraIconProps) => JSX.Element,
  (props: LayoutIconProps) => JSX.Element,
  (props: SettingsIconProps) => JSX.Element,
  () => JSX.Element,
];

export const ActionSheetComponentsArray: ActionSheetComponentsProps = [
  LocalAudioMute,
  LocalAudioMute,
  LocalEndcall,
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
  const {handleSheetChanges, isExpanded} = props;
  const {onlineUsersCount, localUid} = useContext(ChatContext);
  const layouts = useLayoutsData();
  const {currentLayout} = useLayout();
  const changeLayout = useChangeDefaultLayout();
  const {rtcProps} = useContext(PropsContext);
  const {sidePanel, setSidePanel} = useSidePanel();
  const {
    data: {isHost},
  } = useMeetingInfo();
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

  const isVideoDisabled = useLocalUserInfo().video === ToggleState.disabled;
  return (
    <View>
      <View style={[styles.row, {borderBottomWidth: 1, paddingTop: 4}]}>
        <View style={styles.iconContainer}>
          <LocalVideoMute
            isOnActionSheet={true}
            isMobileView={true}
            showLabel={false}
            disabled={isLiveStream && isAudience && !isBroadCasting}
          />
        </View>
        <View style={[styles.iconContainer]}>
          <LocalAudioMute
            isMobileView={true}
            isOnActionSheet={true}
            showLabel={false}
            disabled={isLiveStream && isAudience && !isBroadCasting}
          />
        </View>

        <View
          style={[
            styles.iconContainer,
            {backgroundColor: $config.SEMANTIC_ERROR},
          ]}>
          <LocalEndcall showLabel={false} isOnActionSheet={true} />
        </View>

        <ShowMoreIcon
          isExpanded={isExpanded}
          showNotification={
            (!isExpanded && totalUnreadCount !== 0) ||
            ($config.EVENT_MODE && isPendingRequestToReview)
          }
          onPress={() => handleSheetChanges(isExpanded ? 0 : 1)}
        />
      </View>
      <View style={styles.row}>
        {/**
         * In event mode when raise hand feature is active
         * and audience is promoted to host, the audience can also
         * demote himself
         */}
        {(isLiveStream && isAudience) || (isBroadCasting && !isHost) ? (
          <LiveStreamIcon isHandRaised={isHandRaised} />
        ) : null}

        {/* chat */}
        <ChatIcon />
        {/* participants */}
        <ParticipantsIcon
          showNotification={$config.EVENT_MODE && isPendingRequestToReview}
        />
        {/* record */}
        {isHost && $config.CLOUD_RECORDING ? <RecordingIcon /> : null}

        {/* switch camera */}
        <SwitchCameraIcon
          disabled={
            (isLiveStream && isAudience && !isBroadCasting) || isVideoDisabled
          }
        />
      </View>
      <View style={[styles.row, {paddingVertical: 0}]}>
        {/* Layout view */}
        <LayoutIcon
          onPress={handleLayoutChange}
          currentLayout={layouts[layout]?.iconName}
        />

        {/* settings */}
        <SettingsIcon
          onPress={() => {
            setSidePanel(SidePanelType.Settings);
          }}
        />
        {/* invite */}
        <ShareIcon />
        <View style={styles.emptyContainer}></View>
      </View>
    </View>
  );
};

export default ActionSheetContent;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderColor: $config.CARD_LAYER_3_COLOR,
    flexWrap: 'wrap',
  },
  iconContainer: {
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    width: 50,
    height: 50,
  },
  iconWithText: {
    justifyContent: 'center',
    alignItems: 'center',
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
