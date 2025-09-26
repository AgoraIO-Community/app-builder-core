/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the "Materials") are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.'s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/

import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import IconButton from '../../../atoms/IconButton';
import ThemeConfig from '../../../theme';
import {UidType, useLocalUid} from '../../../../agora-rn-uikit';
import UserAvatar from '../../../atoms/UserAvatar';
import ImageIcon from '../../../atoms/ImageIcon';
import {BreakoutGroup} from '../state/reducer';
import BreakoutRoomActionMenu from './BreakoutRoomActionMenu';
import BreakoutRoomMemberActionMenu from './BreakoutRoomMemberActionMenu';
import TertiaryButton from '../../../atoms/TertiaryButton';
import BreakoutRoomAnnouncementModal from './BreakoutRoomAnnouncementModal';
import {useModal} from '../../../utils/useModal';
import {useBreakoutRoom} from '../context/BreakoutRoomContext';
import BreakoutRoomRenameModal from './BreakoutRoomRenameModal';
import {useMainRoomUserDisplayName} from '../../../rtm/hooks/useMainRoomUserDisplayName';
import {useRoomInfo} from '../../room-info/useRoomInfo';
import {useChatConfigure} from '../../chat/chatConfigure';
import {
  ChatMessageType,
  SDKChatType,
} from '../../chat-messages/useChatMessages';
import {isWeb} from '../../../utils/common';
import {useRTMGlobalState} from '../../../rtm/RTMGlobalStateProvider';
import {useRaiseHand} from '../../raise-hand';
import Tooltip from '../../../atoms/Tooltip';
import {useContent} from 'customization-api';

const BreakoutRoomGroupSettings = ({scrollOffset}) => {
  const {
    data: {isHost, uid, chat},
  } = useRoomInfo();
  const localUid = useLocalUid();
  const {defaultContent} = useContent();
  const {sendChatSDKMessage} = useChatConfigure();
  const {isUserHandRaised} = useRaiseHand();
  const {defaultContent} = useContent();

  const {
    breakoutGroups,
    isUserInRoom,
    exitRoom,
    joinRoom,
    closeRoom,
    updateRoomName,
    canUserSwitchRoom,
    permissions,
  } = useBreakoutRoom();

  const disableJoinBtn = !isHost && !canUserSwitchRoom;

  // Render room card
  const {mainRoomRTMUsers} = useRTMGlobalState();
  // Use hook to get display names with fallback to main room users
  const getDisplayName = useMainRoomUserDisplayName();

  const {
    modalOpen: isAnnoucementModalOpen,
    setModalOpen: setAnnouncementModal,
  } = useModal();
  const {
    modalOpen: isRenameRoomModalOpen,
    setModalOpen: setRenameRoomModalOpen,
  } = useModal();

  const [roomToEdit, setRoomToEdit] = useState<{id: string; name: string}>(
    null,
  );

  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());

  const toggleRoomExpansion = (roomId: string) => {
    const newExpanded = new Set(expandedRooms);
    if (newExpanded.has(roomId)) {
      newExpanded.delete(roomId);
    } else {
      newExpanded.add(roomId);
    }
    setExpandedRooms(newExpanded);
  };

  const renderMember = (memberUId: UidType) => {
    // Hide offline users from UI - check mainRoomRTMUsers for offline status
    const rtmMemberData = mainRoomRTMUsers[memberUId];

    // If user is offline in RTM data, don't render them
    if (rtmMemberData && rtmMemberData?.offline) {
      return null;
    }

    return (
      <View key={memberUId} style={[styles.memberItem]}>
        <View style={styles.memberInfo}>
          <UserAvatar
            name={getDisplayName(memberUId)}
            containerStyle={styles.userAvatarContainer}
            textStyle={styles.userAvatarText}
          />
          <Text style={styles.memberName} numberOfLines={1}>
            {getDisplayName(memberUId)}
          </Text>
        </View>

        <View style={styles.memberMenu}>
          {isUserHandRaised(memberUId) ? (
            <View style={styles.memberRaiseHand}>
              <ImageIcon
                iconSize={18}
                iconType="plain"
                name="raise-hand"
                tintColor={$config.SEMANTIC_WARNING}
              />
            </View>
          ) : (
            <></>
          )}
          {permissions.canHostManageMainRoom && memberUId !== localUid ? (
            <View style={styles.memberMenuMoreIcon}>
              <BreakoutRoomMemberActionMenu memberUid={memberUId} />
            </View>
          ) : (
            <></>
          )}
        </View>
      </View>
    );
  };

  const renderRoom = (room: BreakoutGroup) => {
    const isExpanded = expandedRooms.has(room.id);
    const memberCount =
      room.participants.hosts.length + room.participants.attendees.length;

    return (
      <View key={room.id} style={styles.roomGroupCard}>
        <View style={styles.roomHeader}>
          <View style={styles.roomHeaderLeft}>
            <IconButton
              hoverEffect={false}
              containerStyle={styles.expandIcon}
              iconProps={{
                name: isExpanded ? 'arrow-up' : 'arrow-down',
                iconType: 'plain',
                iconSize: 20,
                tintColor: `${$config.FONT_COLOR}`,
              }}
              onPress={() => toggleRoomExpansion(room.id)}
            />
            <View style={styles.roomHeaderInfo}>
              <View style={styles.roomNameToolTipContainer}>
                <Tooltip
                  fontSize={12}
                  key={room.id}
                  scrollY={scrollOffset}
                  toolTipMessage={room.name}
                  renderContent={() => {
                    return <Text style={styles.roomName}>{room.name}</Text>;
                  }}
                />
              </View>
              <Text style={styles.roomMemberCount}>
                {memberCount > 0 ? memberCount : 'No'} Member
                {memberCount !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <View style={[styles.roomHeaderRight]}>
            {isUserInRoom(room) ? (
              <TertiaryButton
                containerStyle={styles.exitRoomBtn}
                textStyle={styles.roomActionBtnText}
                text={'Exit Room'}
                onPress={() => exitRoom(room.id)}
              />
            ) : (
              <TertiaryButton
                disabled={disableJoinBtn}
                containerStyle={
                  disableJoinBtn ? styles.disabledBtn : styles.joinRoomBtn
                }
                textStyle={styles.roomActionBtnText}
                text={'Join'}
                onPress={() => joinRoom(room.id)}
              />
            )}
            {/* Only host can perform these actions */}
            {permissions.canHostManageMainRoom ? (
              <BreakoutRoomActionMenu
                onDeleteRoom={() => {
                  closeRoom(room.id);
                }}
                onRenameRoom={() => {
                  setRoomToEdit({id: room.id, name: room.name});
                  setRenameRoomModalOpen(true);
                }}
              />
            ) : (
              <></>
            )}
          </View>
        </View>

        {/* Room Members (Expanded) */}
        {isExpanded && (
          <View style={styles.roomMembers}>
            {room.participants.hosts.length > 0 ||
            room.participants.attendees.length > 0 ? (
              <>
                {room.participants.hosts.map(member => renderMember(member))}
                {room.participants.attendees.map(member =>
                  renderMember(member),
                )}
              </>
            ) : (
              <View style={styles.emptyRoom}>
                <Text style={styles.emptyRoomText}>
                  No members in this room
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const onRoomNameChange = (newName: string) => {
    if (newName && roomToEdit?.id) {
      updateRoomName(newName, roomToEdit.id);
      setRoomToEdit(null);
      setRenameRoomModalOpen(false);
    }
  };

  const onAnnouncement = (announcement: string) => {
    if (announcement) {
      const option = {
        chatType: SDKChatType.GROUP_CHAT,
        type: ChatMessageType.TXT,
        msg: `${announcement}`,
        from: uid.toString(),
        to: chat.group_id,
        ext: {
          from_platform: isWeb() ? 'web' : 'native',
          announcement: {
            sender: defaultContent[localUid]?.name,
            heading: `${defaultContent[localUid]?.name} made an announcement.`,
          },
        },
      };
      sendChatSDKMessage(option);
      setAnnouncementModal(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>All Rooms</Text>
        </View>
        {permissions.canHostManageMainRoom ? (
          <View style={[styles.headerRight]}>
            <IconButton
              iconProps={{
                iconType: 'plain',
                name: 'speaker',
                iconSize: 20,
                tintColor: $config.SECONDARY_ACTION_COLOR,
              }}
              onPress={() => setAnnouncementModal(true)}
            />
          </View>
        ) : (
          <></>
        )}
      </View>
      <View style={styles.body}>
        {breakoutGroups.length === 0 ? (
          <View style={styles.emptyRoomPaddingHorizontal}>
            <Text style={styles.emptyRoomText}>
              The host hasn't created any breakout rooms yet
            </Text>
          </View>
        ) : (
          breakoutGroups.map(renderRoom)
        )}
      </View>
      {isAnnoucementModalOpen && (
        <BreakoutRoomAnnouncementModal
          onAnnouncement={onAnnouncement}
          setModalOpen={setAnnouncementModal}
        />
      )}
      {isRenameRoomModalOpen && roomToEdit?.id && (
        <BreakoutRoomRenameModal
          currentRoomName={roomToEdit.name}
          updateRoomName={onRoomNameChange}
          setModalOpen={setRenameRoomModalOpen}
          existingRoomNames={breakoutGroups.map(group => group.name)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    // border: '2px solid red',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // paddingHorizontal: 12,
    paddingVertical: 16,
  },
  headerLeft: {},
  headerTitle: {
    fontWeight: '600',
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
  headerRight: {
    display: 'flex',
    marginLeft: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    // border: '1px solid yellow',
  },
  roomGroupCard: {
    display: 'flex',
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_3_COLOR,
    borderRadius: 8,
  },
  roomHeader: {
    display: 'flex',
    flexDirection: 'row',
    borderColor: $config.CARD_LAYER_3_COLOR,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    alignItems: 'center',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  roomHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exitRoomBtn: {
    backgroundColor: 'transparent',
    borderColor: $config.SECONDARY_ACTION_COLOR,
    height: 28,
  },
  joinRoomBtn: {
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    height: 28,
  },
  disabledBtn: {
    backgroundColor: $config.SEMANTIC_NEUTRAL,
    borderColor: $config.SEMANTIC_NEUTRAL,
    height: 28,
  },
  roomActionBtnText: {
    color: $config.SECONDARY_ACTION_COLOR,
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
    fontWeight: '600',
  },
  roomHeaderInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  roomNameToolTipContainer: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  roomName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 14,
    fontWeight: '600',
    maxWidth: '100%',
  },
  roomMemberCount: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
    fontSize: ThemeConfig.FontSize.tiny,
    lineHeight: 12,
    fontWeight: '600',
  },
  roomHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 4,
  },
  roomMembers: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    display: 'flex',
    gap: 4,
    alignSelf: 'stretch',
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    paddingRight: 16,
    borderRadius: 9,
    backgroundColor: $config.CARD_LAYER_3_COLOR,
    minHeight: 64,
    gap: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  memberDragHandle: {
    marginRight: 12,
    width: 16,
    alignItems: 'center',
  },
  dragDots: {
    width: 4,
    height: 12,
    borderRadius: 2,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hostAvatar: {},
  memberInitial: {
    fontSize: 14,
    fontWeight: '600',
  },
  memberName: {
    flex: 1,
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 20,
    fontWeight: '400',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
  },
  memberMenu: {
    padding: 8,
    marginLeft: 'auto',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberRaiseHand: {},
  memberMenuMoreIcon: {
    width: 24,
    height: 24,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  emptyRoom: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyRoomPaddingHorizontal: {
    paddingHorizontal: 12,
  },
  emptyRoomText: {
    fontSize: ThemeConfig.FontSize.small,
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
    fontStyle: 'italic',
  },
  userAvatarContainer: {
    backgroundColor: $config.VIDEO_AUDIO_TILE_AVATAR_COLOR,
    width: 24,
    height: 24,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: ThemeConfig.FontSize.tiny,
    lineHeight: 12,
    fontWeight: '600',
    color: $config.BACKGROUND_COLOR,
  },
  expandIcon: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: $config.HARD_CODED_BLACK_COLOR,
  },
});

export default BreakoutRoomGroupSettings;
