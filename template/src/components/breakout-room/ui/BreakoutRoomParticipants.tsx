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

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import UserAvatar from '../../../atoms/UserAvatar';
import {ContentInterface, UidType} from '../../../../agora-rn-uikit';
import ThemeConfig from '../../../theme';

interface Props {
  participants?: {uid: UidType; user: ContentInterface}[];
}

const BreakoutRoomParticipants: React.FC<Props> = ({participants}) => {
  return (
    <>
      <Text style={styles.title}>
        Main Room ({participants.length} unassigned)
      </Text>
      <View style={styles.participantContainer}>
        {participants.length > 0 ? (
          participants.map(item => (
            <View style={[styles.participantItem]}>
              <UserAvatar
                name={item.user.name}
                containerStyle={styles.userAvatarContainer}
                textStyle={styles.userAvatarText}
              />
            </View>
          ))
        ) : (
          <Text style={styles.emptyStateText}>
            No participants available for breakout rooms
          </Text>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
    fontWeight: '500',
    opacity: 0.2,
  },
  participantContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
  },
  participantItem: {},
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
  emptyStateText: {
    color: $config.FONT_COLOR,
    fontSize: 14,
  },
});

export default BreakoutRoomParticipants;
