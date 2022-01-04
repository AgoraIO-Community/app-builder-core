import React from 'react';
import {View, Text} from 'react-native';
import RemoteLiveStreamRequestApprove from '../subComponents/RemoteLiveStreamRequestApprove';
import RemoteLiveStreamRequestReject from '../subComponents/RemoteLiveStreamRequestReject';

export const LiveStreamRequest = (props: any) => {
  const {user, participantStyles} = props;
  return (
    <View style={participantStyles.participantRow}>
      <Text style={participantStyles.participantText}>{user.name}</Text>
      <View style={participantStyles.participantActionContainer}>
        <RemoteLiveStreamRequestApprove user={user} />
        <RemoteLiveStreamRequestReject user={user} />
      </View>
    </View>
  );
};
