import React, {useContext} from 'react';
import {View, Text} from 'react-native';
import RemoteEndCall from '../../subComponents/RemoteEndCall';
import ParticipantName from '../../components/participants/ParticipantName';
import chatContext from '../ChatContext';
import {useString} from '../../utils/useString';
import {useRender} from 'customization-api';

const AllAudienceParticipants = (props: any) => {
  const {p_style, isHost, uids} = props;
  const {renderList} = useRender();
  const {localUid} = useContext(chatContext);
  //commented for v1 release
  //const participantListPlaceholder = useString('participantListPlaceholder')();
  const participantListPlaceholder = 'No one has joined yet';
  return (
    <View style={p_style.participantContainer}>
      {uids.length == 0 ? (
        <Text style={p_style.infoText}>{participantListPlaceholder}</Text>
      ) : (
        <>
          {/* Audience should see his name first */}
          {uids.filter((i) => i === localUid).length ? (
            <View style={p_style.participantRow} key={'local' + 0}>
              <ParticipantName value={renderList[localUid]?.name} />
              {isHost && (
                <View style={p_style.participantActionContainer}>
                  <View style={[p_style.actionBtnIcon]}>
                    <RemoteEndCall uid={localUid} isHost={isHost} />
                  </View>
                </View>
              )}
            </View>
          ) : (
            <></>
          )}
          {/* Others Audience in the call */}
          {uids
            .filter((i) => i !== localUid)
            .map((uid: any, index: number) => (
              <View style={p_style.participantRow} key={index}>
                <ParticipantName value={renderList[uid]?.name} />
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
