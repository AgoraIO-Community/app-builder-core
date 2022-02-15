import React from 'react';
import {View, Text} from 'react-native';
import RemoteEndCall from '../../subComponents/RemoteEndCall';
import ParticipantName from '../../components/participants/ParticipantName';

const AllAudienceParticipants = (props: any) => {
  const {p_style, isHost, participantList} = props;

  return (
    <View style={p_style.participantContainer}>
      {Object.keys(participantList).length == 0 ? (
        <Text style={p_style.infoText}>No one has joined yet</Text>
      ) : (
        Object.entries(participantList).map(
          ([uid, user]: any, index: number) => (
            <View style={p_style.participantRow} key={index}>
              <ParticipantName value={user.name} />
              {isHost && (
                <View style={p_style.participantActionContainer}>
                  <View style={[p_style.actionBtnIcon]}>
                    <RemoteEndCall uid={uid} isHost={isHost} />
                  </View>
                </View>
              )}
            </View>
          ),
        )
      )}
    </View>
  );
};

export default AllAudienceParticipants;
