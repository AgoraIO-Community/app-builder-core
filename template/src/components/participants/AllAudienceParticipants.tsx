import React, {useContext} from 'react';
import {View} from 'react-native';
import chatContext from '../ChatContext';
import RemoteEndCall from '../../subComponents/RemoteEndCall';
import ParticipantName from '../../components/participants/ParticipantName';

const ParticipantsWithoutControls = (props: any) => {
  const {p_style, type, isHost} = props;
  const {userList} = useContext(chatContext);

  const filteredParticipantsByType = Object.values(userList)
    .map(function (objectValue) {
      return objectValue;
    })
    .filter((user: any) => user.type === 0 && user.role == type);

  return (
    <>
      {filteredParticipantsByType.map((user: any, index: number) => (
        <View style={p_style.participantRow} key={index}>
          <ParticipantName value={user.name} />
          <View style={p_style.participantActionContainer}>
            <View style={[p_style.actionBtnIcon]}>
              <RemoteEndCall uid={user.uid} isHost={isHost} />
            </View>
          </View>
        </View>
      ))}
    </>
  );
};

export default ParticipantsWithoutControls;
