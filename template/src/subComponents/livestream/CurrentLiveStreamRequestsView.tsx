import React from 'react';
import {View, Text} from 'react-native';
import RemoteLiveStreamRequestApprove from './controls/RemoteLiveStreamRequestApprove';
import RemoteLiveStreamRequestReject from './controls/RemoteLiveStreamRequestReject';

const CurrentLiveStreamRequestsView = (props: any) => {
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

export default CurrentLiveStreamRequestsView;
