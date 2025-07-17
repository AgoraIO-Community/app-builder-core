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
import {useContent} from 'customization-api';
import {useLocalUid} from '../../../../agora-rn-uikit';
import UserAvatar from '../../../atoms/UserAvatar';
import {UidType} from '../../../../agora-rn-uikit';
import ThemeConfig from '../../../theme';

interface BreakoutRoomParticipantsProps {
  onParticipantSelect?: (uid: UidType) => void;
  selectedParticipants?: UidType[];
  title?: string;
}

const BreakoutRoomParticipants: React.FC<BreakoutRoomParticipantsProps> = ({
  onParticipantSelect,
  selectedParticipants = [],
  title = 'Main Room',
}) => {
  const {defaultContent, activeUids} = useContent();
  console.log('supriya activeUids: ', activeUids);
  const localUid = useLocalUid();

  // Filter active UIDs to exclude:
  // 1. Custom content (not type 'rtc')
  // 2. Screenshare UIDs
  // 3. Offline users
  const filteredParticipants = activeUids
    .filter(uid => {
      const user = defaultContent[uid];
      if (!user) {
        return false;
      }
      // Only include RTC users
      if (user.type !== 'rtc') {
        return false;
      }
      // Exclude offline users
      if (user.offline) {
        return false;
      }
      // Exclude screenshare UIDs (they typically have a parentUid)
      if (user.parentUid) {
        return false;
      }
      return true;
    })
    .map(uid => ({
      uid,
      user: defaultContent[uid],
    }));

  // Sort participants with local user first
  const availableParticipants = filteredParticipants.sort((a, b) => {
    if (a.uid === localUid) {
      return -1;
    }
    if (b.uid === localUid) {
      return 1;
    }
    return 0;
  });

  const renderParticipant = ({item}: {item: {uid: UidType; user: any}}) => {
    console.log('supriya participant item: ', item);
    const {uid, user} = item;
    const isSelected = selectedParticipants.includes(uid);

    return (
      <View style={[styles.participantItem, isSelected && styles.selectedItem]}>
        <UserAvatar
          name={user.name}
          containerStyle={styles.userAvatarContainer}
          textStyle={styles.userAvatarText}
        />
        {onParticipantSelect && (
          <View style={styles.selectButton}>
            <Text
              style={[
                styles.selectButtonText,
                isSelected && styles.selectedButtonText,
              ]}
              onPress={() => onParticipantSelect(uid)}>
              {isSelected ? 'Selected' : 'Select'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <Text style={styles.title}>
        {title} ({availableParticipants.length} unassigned)
      </Text>
      <View style={styles.participantContainer}>
        {availableParticipants.length > 0 ? (
          availableParticipants.map(item => renderParticipant({item}))
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
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'stretch',
    gap: 12,
  },
  title: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
    fontWeight: '500',
    opacity: 0.2,
  },
  listContainer: {
    paddingVertical: 8,
  },
  participantContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
  },
  participantItem: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // paddingHorizontal: 16,
    // paddingVertical: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: '#2a2a2a',
  },
  selectedItem: {
    backgroundColor: '#2a4a7a',
  },
  avatar: {
    marginRight: 12,
  },
  participantInfo: {
    flex: 1,
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

  participantName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  participantStatus: {
    color: '#888',
    fontSize: 12,
  },
  selectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  selectButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedButtonText: {
    color: '#4A90E2',
  },

  emptyStateText: {
    color: $config.FONT_COLOR,
    fontSize: 14,
  },
});

export default BreakoutRoomParticipants;
