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
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import IconButton from '../../../atoms/IconButton';
import ThemeConfig from '../../../theme';
import {UidType} from 'agora-rn-uikit';
import UserAvatar from '../../../atoms/UserAvatar';
import {BreakoutGroup} from '../state/reducer';
import {useContent} from 'customization-api';
import {videoRoomUserFallbackText} from '../../../language/default-labels/videoCallScreenLabels';
import {useString} from '../../../utils/useString';

interface Props {
  groups: BreakoutGroup[];
}
const BreakoutRoomGroupSettings: React.FC<Props> = ({groups}) => {
  // Render room card
  const {defaultContent} = useContent();
  const remoteUserDefaultLabel = useString(videoRoomUserFallbackText)();

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

  const renderMember = (memberUId: UidType) => (
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

      <TouchableOpacity style={styles.memberMenu} onPress={() => {}}>
        <Text style={styles.memberMenuText}>⋯</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRoom = (room: BreakoutGroup) => {
    const isExpanded = expandedRooms.has(room.id);
    const memberCount = room.participants.attendees.length || 0;

    return (
      <View key={room.id} style={styles.roomGroupCard}>
        <View style={styles.roomHeader}>
          <View style={styles.roomHeaderLeft}>
            <IconButton
              hoverEffect={true}
              containerStyle={styles.expandIcon}
              iconProps={{
                name: isExpanded ? 'arrow-down' : 'arrow-up',
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
          {/* <View style={styles.roomHeaderRight}>
            <IconButton
              hoverEffect={true}
              containerStyle={styles.expandIcon}
              iconProps={{
                name: 'more-menu',
                iconType: 'plain',
                iconSize: 20,
                tintColor: `${$config.FONT_COLOR}`,
              }}
              onPress={() => {}}
            />
          </View> */}
        </View>

        {/* Room Members (Expanded) */}
        {isExpanded && (
          <View style={styles.roomMembers}>
            {room.participants.attendees.length > 0 ? (
              room.participants.attendees.map(member => renderMember(member))
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Rooms</Text>
        {/* <View style={styles.headerActions}></View> */}
      </View>
      <View style={styles.body}>{groups.map(renderRoom)}</View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    // border: '1px solid yellow',
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontFamily: ThemeConfig.FontFamily.sansPro,
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
    gap: 8,
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
  },
  memberMenuText: {
    fontSize: 16,
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
