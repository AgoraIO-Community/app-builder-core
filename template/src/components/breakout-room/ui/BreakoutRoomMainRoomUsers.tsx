import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useRTMCore} from '../../../rtm/RTMCoreProvider';
import ThemeConfig from '../../../theme';
import {useBreakoutRoom} from '../context/BreakoutRoomContext';
import UserAvatar from '../../../atoms/UserAvatar';
import {type GetOnlineUsersResponse} from 'agora-react-native-rtm';

interface OnlineUser {
  userId: string;
  name?: string;
}

const getUserNameFromAttributes = (
  attributes: any,
  fallbackUserId: string,
): string => {
  try {
    const nameAttribute = attributes?.items?.find(
      item => item.key === 'name',
    )?.value;
    if (!nameAttribute) {
      return fallbackUserId;
    }

    const firstParse = JSON.parse(nameAttribute);
    if (firstParse?.payload) {
      const secondParse = JSON.parse(firstParse.payload);
      return secondParse?.name || fallbackUserId;
    }
    return firstParse?.name || fallbackUserId;
  } catch (e) {
    return fallbackUserId;
  }
};

const BreakoutRoomMainRoomUsers: React.FC = () => {
  const {client} = useRTMCore();
  const {mainChannelId, breakoutGroups} = useBreakoutRoom();
  const [usersWithNames, setUsersWithNames] = useState<OnlineUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all assigned users from breakout rooms
  const getAssignedUsers = useCallback(() => {
    const assigned = new Set<string>();
    breakoutGroups.forEach(group => {
      group.participants.hosts.forEach(uid => assigned.add(String(uid)));
      group.participants.attendees.forEach(uid => assigned.add(String(uid)));
    });
    return assigned;
  }, [breakoutGroups]);

  // Fetch attributes only when online users change
  useEffect(() => {
    const fetchUserAttributes = async () => {
      if (!client) {
        setUsersWithNames([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const onlineUsers: GetOnlineUsersResponse =
          await client.presence.getOnlineUsers(mainChannelId, 1);

        const users = await Promise.all(
          Array.from(onlineUsers.occupants).map(async member => {
            try {
              const attributes = await client.storage.getUserMetadata({
                userId: member.userId,
              });
              const username = getUserNameFromAttributes(
                attributes,
                member.userId,
              );
              return {
                userId: member.userId,
                name: username,
              };
            } catch (e) {
              console.warn(
                `Failed to get attributes for user ${member.userId}:`,
                e,
              );
              return {
                userId: member.userId,
                name: 'User',
              };
            }
          }),
        );

        setUsersWithNames(users);
      } catch (fetchError) {
        console.error('Failed to fetch user attributes:', fetchError);
        setError('Failed to fetch user information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAttributes();
  }, [client, mainChannelId]);

  // Filter out users who are assigned to breakout rooms
  const mainRoomOnlyUsers = usersWithNames.filter(user => {
    const assignedUsers = getAssignedUsers();
    return !assignedUsers.has(user.userId);
  });

  if (!mainChannelId) {
    return (
      <View style={style.card}>
        <View style={style.section}>
          <Text style={style.emptyText}>Main channel not available</Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={style.card}>
        <View style={style.section}>
          <Text style={style.emptyText}>Loading main room users...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={style.card}>
        <View style={style.section}>
          <Text style={style.emptyText}>Error: {error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={style.card}>
      <View style={style.section}>
        <Text style={style.title}>Main Room ({mainRoomOnlyUsers.length})</Text>
        <View style={style.participantContainer}>
          {mainRoomOnlyUsers.map(user => (
            <View key={user.userId}>
              <UserAvatar
                name={user.name}
                containerStyle={style.userAvatarContainer}
                textStyle={style.userAvatarText}
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
