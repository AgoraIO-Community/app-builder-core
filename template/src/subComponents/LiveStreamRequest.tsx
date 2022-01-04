import React from 'react';
import {View, Text} from 'react-native';
import {LiveStreamHostControls} from '../../agora-rn-uikit';

export const LiveStreamRequest = (props: any) => {
  const {user, participantStyles} = props;
  return (
    <View style={participantStyles.participantRow}>
      <Text style={participantStyles.participantText}>{user.name}</Text>
      <View style={participantStyles.participantActionContainer}>
        <LiveStreamHostControls user={user} />
      </View>
    </View>
  );
};
