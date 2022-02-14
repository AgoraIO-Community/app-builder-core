import React, {useContext} from 'react';
import {View} from 'react-native';
import chatContext from '../ChatContext';
import RemoteEndCall from '../../subComponents/RemoteEndCall';
import ParticipantName from '../../components/participants/ParticipantName';
import {filterObject} from '../../utils/index';

const AllAudienceParticipants = (props: any) => {
  const {p_style, type, isHost} = props;
  const {userList} = useContext(chatContext);

  const filteredParticipantsByType = filterObject(
    userList,
    ([k, v]) => v?.type === 0 && v?.role == type && !v.offline,
  );

  return (
    <>
      {Object.entries(filteredParticipantsByType).map(
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
      )}
    </>
  );
};

export default AllAudienceParticipants;
