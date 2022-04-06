import React, {useContext} from 'react';
import {View, Text} from 'react-native';
import {participantStylesInterface} from '../ParticipantsView';
import RemoteEndCall from '../../subComponents/RemoteEndCall';
import ParticipantName from './ParticipantName';
import chatContext from '../ChatContext';

interface IProps {
  participantStyles: participantStylesInterface;
  isHost: boolean;
  participantList: any;
}
const ParticipantsWithAudienceControls = (props: IProps) => {
  const {participantStyles, isHost, participantList} = props;
  const {localUid} = useContext(chatContext);

  return (
    <View style={participantStyles.participantContainer}>
      {Object.keys(participantList).length == 0 ? (
        <Text style={participantStyles.infoText}>No one has joined yet</Text>
      ) : (
        <>
          {/* Audience should see his name first */}
          {Object.entries(participantList)
            .filter(([uid, _]: any) => uid === localUid)
            .map(([uid, user]: any, index: number) => (
              <View style={participantStyles.participantRow} key={index}>
                <ParticipantName value={user.name} />
                {isHost && (
                  <View style={participantStyles.participantActionContainer}>
                    <View style={[participantStyles.actionBtnIcon]}>
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
              <View style={participantStyles.participantRow} key={index}>
                <ParticipantName value={user.name} />
                {isHost && (
                  <View style={participantStyles.participantActionContainer}>
                    <View style={[participantStyles.actionBtnIcon]}>
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

export default ParticipantsWithAudienceControls;
