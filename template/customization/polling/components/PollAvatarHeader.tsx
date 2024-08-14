import {Text, View, StyleSheet} from 'react-native';
import React from 'react';
import {PollItem} from '../context/poll-context';
import {
  useContent,
  UserAvatar,
  ThemeConfig,
  useString,
  videoRoomUserFallbackText,
  UidType,
} from 'customization-api';

interface Props {
  pollItem: PollItem;
}

function PollAvatarHeader({pollItem}: Props) {
  const remoteUserDefaultLabel = useString(videoRoomUserFallbackText)();
  const {defaultContent} = useContent();
  const getPollCreaterName = (uid: UidType) => {
    return defaultContent[uid]?.name || remoteUserDefaultLabel;
  };

  return (
    <View style={style.titleCard}>
      <View style={style.titleAvatar}>
        <UserAvatar
          name={getPollCreaterName(pollItem.createdBy)}
          containerStyle={style.titleAvatarContainer}
          textStyle={style.titleAvatarContainerText}
        />
      </View>
      <View style={style.title}>
        <Text style={style.titleText}>
          {getPollCreaterName(pollItem.createdBy)}
        </Text>
        <Text style={style.titleSubtext}>{pollItem.type}</Text>
      </View>
    </View>
  );
}
export const style = StyleSheet.create({
  titleCard: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
  },
  title: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  titleAvatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: $config.VIDEO_AUDIO_TILE_AVATAR_COLOR,
  },
  titleAvatarContainerText: {
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
    fontWeight: '600',
    color: $config.VIDEO_AUDIO_TILE_COLOR,
  },
  titleText: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.normal,
    fontWeight: '700',
    lineHeight: 20,
  },
  titleSubtext: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.tiny,
    fontWeight: '400',
    lineHeight: 16,
  },
});

export default PollAvatarHeader;
