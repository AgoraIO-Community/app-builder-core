import React, {useContext} from 'react';
import {View, Text} from 'react-native';
import RemoteEndCall from '../../subComponents/RemoteEndCall';
import ParticipantName from '../../components/participants/ParticipantName';
import chatContext from '../ChatContext';

const AllAudienceParticipants = (props: any) => {
  const {p_style, isHost, participantList} = props;
  const {localUid} = useContext(chatContext);

  return (
    <View style={p_style.participantContainer}>
      {Object.keys(participantList).length == 0 ? (
        <Text style={p_style.infoText}>No one has joined yet</Text>
      ) : (
        <>
          {/* Audience should see his name first */}
          {Object.entries(participantList)
            .filter(([uid, _]: any) => uid === localUid)
            .map(([uid, user]: any, index: number) => (
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
            ))}
          {/* Others Audience in the call */}
          {Object.entries(participantList)
            .filter(([uid, _]: any) => uid !== localUid)
            .map(([uid, user]: any, index: number) => (
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
            ))}
        </>
      )}
    </View>
  );
};

export default AllAudienceParticipants;
