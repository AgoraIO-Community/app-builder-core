import React, {useContext} from 'react';
import {View} from 'react-native';
import chatContext from '../ChatContext';

import ParticipantName from '../../components/participants/ParticipantName';

const AllAudienceParticipants = (props: any) => {
  const {p_style} = props;
  const {userList} = useContext(chatContext);

  const allAudience = Object.values(userList)
    .map(function (objectValue, index) {
      return objectValue;
    })
    .filter((user: any) => user.type === 0 && user.role === 'audience');

  return (
    <>
      {allAudience.map((user: any, index: number) => (
        <View style={p_style.participantRow} key={index}>
          <ParticipantName value={user.name} />
        </View>
      ))}
    </>
  );
};

export default AllAudienceParticipants;
