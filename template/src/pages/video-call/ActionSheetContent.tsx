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
import {PropsContext} from '../../../agora-rn-uikit';
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

const ActionSheetContent = (props) => {
  const {handleSheetChanges, updateActionSheet, isExpanded} = props;
  const {onlineUsersCount, localUid} = useContext(ChatContext);
  const layouts = useLayoutsData();
  const {currentLayout} = useLayout();
  const changeLayout = useChangeDefaultLayout();
  const {rtcProps} = useContext(PropsContext);
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
  const isHandRasied = raiseHandList[localUid]?.raised === RaiseHandValue.TRUE;

  const handleLayoutChange = () => {
    changeLayout();
  };
  return (
    <View>
      <View style={[styles.row, {borderBottomWidth: 1}]}>
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
        <View style={styles.iconContainer}>
          <TouchableOpacity
            onPress={() => handleSheetChanges(isExpanded ? 0 : 1)}>
            <ImageIcon
              name={isExpanded ? 'arrow-down' : 'more-menu'}
              tintColor={$config.PRIMARY_ACTION_BRAND_COLOR}
            />
          </TouchableOpacity>
          {/* TODO:  show when chat,hand raises*/}
          {!isExpanded &&
            (totalUnreadCount !== 0 ||
              ($config.EVENT_MODE && isPendingRequestToReview)) && (
              <View style={styles.notification} />
            )}
        </View>
      </View>
      <View style={styles.row}>
        {/**
         * In event mode when raise hand feature is active
         * and audience is promoted to host, the audience can also
         * demote himself
         */}
        {(isLiveStream && isAudience) || (isBroadCasting && !isHost) ? (
          <View style={styles.iconWithText}>
            <View style={styles.iconContainer}>
              <LiveStreamControls showControls={true} isDesktop={false} />
            </View>
            <Text style={styles.iconText}>
              {isHandRasied ? 'Lower\nHand' : 'Raise\nHand'}
            </Text>
          </View>
        ) : null}

        {/* chat */}
        <View style={styles.iconWithText}>
          <View style={styles.iconContainer}>
            <ChatIconButton
              badgeContainerPosition={{
                top: -8,
                left: 15,
              }}
              isMobileView={true}
              isOnActionSheet={true}
              openSheet={() => updateActionSheet('chat')}
            />
          </View>
          <Text style={styles.iconText}>Chat</Text>
        </View>
        {/* participants */}
        <View style={styles.iconWithText}>
          <View style={styles.iconContainer}>
            <ParticipantsIconButton
              isMobileView={true}
              isOnActionSheet={true}
              openSheet={() => updateActionSheet('participants')}
            />
          </View>
          <Text style={styles.iconText}>People</Text>
          {$config.EVENT_MODE && isPendingRequestToReview && (
            <View style={styles.notification} />
          )}
        </View>
        {/* record */}
        {isHost && $config.CLOUD_RECORDING && (
          <View style={styles.iconWithText}>
            <View style={styles.iconContainer}>
              <Recording showLabel={false} isOnActionSheet={true} />
            </View>
            <Text style={styles.iconText}>Record</Text>
          </View>
        )}

        {/* switch camera */}
        <View style={styles.iconWithText}>
          <View style={styles.iconContainer}>
            <LocalSwitchCamera
              showLabel={false}
              disabled={isLiveStream && isAudience && !isBroadCasting}
            />
          </View>
          <Text
            style={[
              styles.iconText,
              {
                color:
                  isLiveStream && isAudience && !isBroadCasting
                    ? $config.SEMANTIC_NETRUAL
                    : $config.FONT_COLOR,
              },
            ]}>
            Switch {'\n'} Camera
          </Text>
        </View>
      </View>
      <View style={[styles.row, {paddingVertical: 0}]}>
        {/* List view */}
        <View style={styles.iconWithText}>
          <View style={styles.iconContainer}>
            <IconButton
              onPress={handleLayoutChange}
              isOnActionSheet={true}
              iconProps={{
                name:
                  layouts[layout]?.iconName === 'grid' ? 'grid' : 'list-view',
                tintColor: $config.PRIMARY_ACTION_TEXT_COLOR,
              }}
            />
            {/* layout */}
          </View>
          <Text style={styles.iconText}>Layout</Text>
        </View>
        {/* settings */}
        <View style={styles.iconWithText}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => updateActionSheet('settings')}>
            <ImageIcon
              name={'settings'}
              tintColor={$config.PRIMARY_ACTION_TEXT_COLOR}
            />
          </TouchableOpacity>
          <Text style={styles.iconText}>Settings</Text>
        </View>
        {/* invite */}
        <View style={styles.iconWithText}>
          <View style={styles.iconContainer}>
            <CopyJoinInfo showLabel={false} isOnActionSheet={true} />
          </View>
          <Text style={styles.iconText}>Invite</Text>
        </View>

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
