import React, {useContext} from 'react';
import {View, Text} from 'react-native';
import RemoteLiveStreamRequestApprove from './controls/RemoteLiveStreamRequestApprove';
import RemoteLiveStreamRequestReject from './controls/RemoteLiveStreamRequestReject';
import ParticipantName from '../../components/participants/ParticipantName';
import LiveStreamContext from '../../components/livestream/LiveStreamContext';

const CurrentLiveStreamRequestsView = (props: any) => {
  const {userList, p_style} = props;
  const {currLiveStreamRequest} = useContext(LiveStreamContext);

  if (Object.keys(currLiveStreamRequest).length == 0) {
    return <Text style={p_style.infoText}>No streaming request(s)</Text>;
  }

  return (
    <>
      {Object.keys(currLiveStreamRequest).map((userUID: any, index: number) => (
        <View style={p_style.participantRow} key={index}>
          <ParticipantName value={userList[userUID].name} />
          <View style={p_style.participantActionContainer}>
            <RemoteLiveStreamRequestApprove
              user={{...userList[userUID], uid: userUID}}
            />
            <RemoteLiveStreamRequestReject
              user={{...userList[userUID], uid: userUID}}
            />
          </View>
        </View>
      ))}
    </>
  );
};

export default CurrentLiveStreamRequestsView;
