import React, {useContext, useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import chatContext from '../ChatContext';
import RemoteEndCall from '../../subComponents/RemoteEndCall';
import ParticipantName from '../../components/participants/ParticipantName';
import {filterObject} from '../../utils/index';

const AllAudienceParticipants = (props: any) => {
  const {p_style, type, isHost, title} = props;
  const {userList} = useContext(chatContext);

  const [filteredParticipantsByType, setfilteredParticipantsByType] = useState(
    {},
  );

  useEffect(() => {
    setfilteredParticipantsByType(
      filterObject(
        userList,
        ([k, v]) => v?.type === 0 && v?.role == type && !v.offline,
      ),
    );
  }, [userList]);

  return (
    <>
      <Text style={p_style.subheading}>
        {title}{' '}
        <Text style={p_style.count}>
          ({Object.keys(filteredParticipantsByType).length})
        </Text>
      </Text>
      <View style={p_style.participantContainer}>
        {Object.keys(filteredParticipantsByType).length == 0 ? (
          <Text style={p_style.infoText}>No {title}(s) have joined yet</Text>
        ) : (
          Object.entries(filteredParticipantsByType).map(
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
    </>
  );
};

export default AllAudienceParticipants;
