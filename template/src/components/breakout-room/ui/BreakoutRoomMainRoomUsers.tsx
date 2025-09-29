import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useRTMGlobalState} from '../../../rtm/RTMGlobalStateProvider';
import ThemeConfig from '../../../theme';
import {useBreakoutRoom} from '../context/BreakoutRoomContext';
import UserAvatar from '../../../atoms/UserAvatar';
import Tooltip from '../../../atoms/Tooltip';
import {useString} from '../../../utils/useString';
import {videoRoomUserFallbackText} from '../../../language/default-labels/videoCallScreenLabels';

interface MainRoomUser {
  uid: number;
  name: string;
}

const BreakoutRoomMainRoomUsers = ({scrollOffset}) => {
  const {mainRoomRTMUsers} = useRTMGlobalState();
  const {breakoutGroups, breakoutRoomVersion} = useBreakoutRoom();
  const remoteUserDefaultLabel = useString(videoRoomUserFallbackText)();

  // Get all assigned users from breakout rooms
  const assignedUserUids = useMemo(() => {
    const assigned = new Set<number>();
    breakoutGroups.forEach(group => {
      group.participants.hosts.forEach(uid => assigned.add(uid));
      group.participants.attendees.forEach(uid => assigned.add(uid));
    });
    return assigned;
  }, [breakoutRoomVersion]);

  // Filter main room users to only show those not assigned to breakout rooms
  const mainRoomOnlyUsers = useMemo(() => {
    const users: MainRoomUser[] = [];

    Object.entries(mainRoomRTMUsers).forEach(([uidStr, userData]) => {
      const uid = parseInt(uidStr, 10);

      // Skip if user is assigned to a breakout room
      if (assignedUserUids.has(uid)) {
        return;
      }

      // Only include RTC users who are online
      if (userData.type === 'rtc' && !userData.offline) {
        users.push({
          uid,
          name: userData.name || remoteUserDefaultLabel,
        });
      }
    });

    return users;
  }, [mainRoomRTMUsers, assignedUserUids, breakoutRoomVersion]);

  return (
    <View style={style.card}>
      <View style={style.section}>
        <Text style={style.title}>Main Room ({mainRoomOnlyUsers.length})</Text>
        <View style={style.participantContainer}>
          {mainRoomOnlyUsers.map(user => (
            <View key={user.uid}>
              <Tooltip
                key={user.uid}
                scrollY={scrollOffset}
                toolTipMessage={user.name}
                renderContent={() => {
                  return (
                    <UserAvatar
                      name={user.name}
                      containerStyle={style.userAvatarContainer}
                      textStyle={style.userAvatarText}
                    />
                  );
                }}
              />
            </View>
          ))}
        </View>
        {mainRoomOnlyUsers.length === 0 && (
          <Text style={style.emptyText}>No users online in main room</Text>
        )}
      </View>
    </View>
  );
};

export default BreakoutRoomMainRoomUsers;

const style = StyleSheet.create({
  card: {
    width: '100%',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    borderColor: $config.CARD_LAYER_3_COLOR,
    gap: 12,
  },
  section: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  title: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
  participantContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
  },
  emptyText: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.medium,
    fontSize: ThemeConfig.FontSize.tiny,
    lineHeight: 16,
    fontWeight: '400',
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
    display: 'flex',
  },
});
