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

import React, {useState, useRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import IconButton from '../../../atoms/IconButton';
import ThemeConfig from '../../../theme';
import {UidType} from 'agora-rn-uikit';
import UserAvatar from '../../../atoms/UserAvatar';
import {BreakoutGroup} from '../state/reducer';
import {useContent} from 'customization-api';
import {videoRoomUserFallbackText} from '../../../language/default-labels/videoCallScreenLabels';
import {useString} from '../../../utils/useString';
import UserActionMenuOptionsOptions from '../../participants/UserActionMenuOptions';
import BreakoutRoomActionMenu from './BreakoutRoomActionMenu';
import TertiaryButton from '../../../atoms/TertiaryButton';
import BreakoutRoomAnnouncementModal from './BreakoutRoomAnnouncementModal';
import {useModal} from '../../../utils/useModal';
import {useBreakoutRoom} from '../context/BreakoutRoomContext';
import BreakoutRoomRenameModal from './BreakoutRoomRenameModal';
import {useRoomInfo} from '../../room-info/useRoomInfo';

const BreakoutRoomGroupSettings: React.FC = () => {
  const {
    data: {isHost},
  } = useRoomInfo();

  const {
    breakoutGroups,
    isUserInRoom,
    exitRoom,
    joinRoom,
    sendAnnouncement,
    updateRoomName,
    canUserSwitchRoom,
    raisedHands,
  } = useBreakoutRoom();

  const disableJoinBtn = !isHost && !canUserSwitchRoom;

  // Render room card
  const {defaultContent} = useContent();
  const remoteUserDefaultLabel = useString(videoRoomUserFallbackText)();
  const memberMoreMenuRefs = useRef<{[key: string]: any}>({});
  const {
    modalOpen: isAnnoucementModalOpen,
    setModalOpen: setAnnouncementModal,
  } = useModal();
  const {
    modalOpen: isRenameRoomModalOpen,
    setModalOpen: setRenameRoomModalOpen,
  } = useModal();

  const [roomIdToEdit, setRoomIdToEdit] = useState<string>(null);

  const isParticipantHandRaised = (uid: UidType) => {
    return raisedHands.some(hand => hand.uid === uid);
  };

  const [actionMenuVisible, setActionMenuVisible] = useState<{
    [key: string]: boolean;
  }>({});

  const showModal = (memberUId: UidType) => {
    setActionMenuVisible(prev => ({
      ...prev,
      [memberUId]: !prev[memberUId],
    }));
  };

  const getName = (uid: UidType) => {
    return defaultContent[uid]?.name || remoteUserDefaultLabel;
  };

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
    // Create or get ref for this specific member
    if (!memberMoreMenuRefs.current[memberUId]) {
      memberMoreMenuRefs.current[memberUId] = React.createRef();
    }

    const memberRef = memberMoreMenuRefs.current[memberUId];
    const isMenuVisible = actionMenuVisible[memberUId] || false;
    const hasRaisedHand = isParticipantHandRaised(memberUId);
    return (
      <View key={memberUId} style={styles.memberItem}>
        <View style={styles.memberInfo}>
          <UserAvatar
            name={getName(memberUId)}
            containerStyle={styles.userAvatarContainer}
            textStyle={styles.userAvatarText}
          />
          <Text style={styles.memberName} numberOfLines={1}>
            {getName(memberUId)}
          </Text>
        </View>

        <View style={styles.memberMenu}>
          <View>{hasRaisedHand ? '✋' : <></>}</View>
          <View style={styles.memberMenuMoreIcon}>
            <View ref={memberRef} collapsable={false}>
              <IconButton
                iconProps={{
                  iconType: 'plain',
                  name: 'more-menu',
                  iconSize: 20,
                  tintColor: $config.SECONDARY_ACTION_COLOR,
                }}
                onPress={() => showModal(memberUId)}
              />
            </View>
            <UserActionMenuOptionsOptions
              actionMenuVisible={isMenuVisible}
              setActionMenuVisible={visible =>
                setActionMenuVisible(prev => ({...prev, [memberUId]: visible}))
              }
              user={defaultContent[memberUId]}
              btnRef={memberRef}
              from={'breakout-room'}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderRoom = (room: BreakoutGroup) => {
    const isExpanded = expandedRooms.has(room.id);
    const memberCount =
      room.participants.hosts.length ||
      0 + room.participants.attendees.length ||
      0;

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
              <Text style={styles.roomName}>{room.name}</Text>
              <Text style={styles.roomMemberCount}>
                {memberCount > 0 ? memberCount : 'No'} Member
                {memberCount !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <View style={styles.roomHeaderRight}>
            {isUserInRoom(room) ? (
              <TertiaryButton
                containerStyle={styles.exitRoomBtn}
                textStyle={styles.roomActionBtnText}
                text={'Exit Room'}
                onPress={() => {
                  exitRoom(room.id);
                }}
              />
            ) : (
              <TertiaryButton
                disabled={disableJoinBtn}
                containerStyle={
                  disableJoinBtn ? styles.disabledBtn : styles.joinRoomBtn
                }
                textStyle={styles.roomActionBtnText}
                text={'Join'}
                onPress={() => {
                  joinRoom(room.id);
                }}
              />
            )}
            {/* Only host can perform these actions */}
            {isHost ? (
              <BreakoutRoomActionMenu
                onDeleteRoom={() => {
                  console.log('supriya on delete clicked');
                }}
                onRenameRoom={() => {
                  setRoomIdToEdit(room.id);
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
    if (newName && roomIdToEdit) {
      updateRoomName(newName, roomIdToEdit);
      setRoomIdToEdit(null);
      setRenameRoomModalOpen(false);
    }
  };

  const onAnnouncement = (announcement: string) => {
    if (announcement) {
      sendAnnouncement(announcement);
      setAnnouncementModal(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>All Rooms</Text>
        </View>
        {isHost ? (
          <View style={styles.headerRight}>
            <IconButton
              iconProps={{
                iconType: 'plain',
                name: 'speaker',
                iconSize: 20,
                tintColor: $config.SECONDARY_ACTION_COLOR,
              }}
              onPress={() => {
                setAnnouncementModal(true);
              }}
            />
          </View>
        ) : (
          <></>
        )}
      </View>
      <View style={styles.body}>{breakoutGroups.map(renderRoom)}</View>
      {isAnnoucementModalOpen && (
        <BreakoutRoomAnnouncementModal
          onAnnouncement={onAnnouncement}
          setModalOpen={setAnnouncementModal}
        />
      )}
      {isRenameRoomModalOpen && roomIdToEdit && (
        <BreakoutRoomRenameModal
          updateRoomName={onRoomNameChange}
          setModalOpen={setRenameRoomModalOpen}
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
    paddingHorizontal: 12,
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
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  roomName: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 14,
    fontWeight: '600',
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
    minHeight: 40,
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
    alignItems: 'center',
    gap: 4,
  },
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
