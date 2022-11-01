import React, {useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import RemoteEndCall from '../../subComponents/RemoteEndCall';
import ParticipantName from '../../components/participants/ParticipantName';
import chatContext from '../ChatContext';
import {useString} from '../../utils/useString';
import {useRender} from 'customization-api';
import UserAvatar from '../../atoms/UserAvatar';

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
              <UserAvatar
                name={renderList[localUid]?.name}
                containerStyle={localStyle.userAvatarContainer}
                textStyle={localStyle.userAvatarText}
              />
              <View style={localStyle.participantTextContainer}>
                <Text style={[localStyle.participantText]}>
                  {renderList[localUid]?.name}
                </Text>
              </View>
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
                <UserAvatar
                  name={renderList[uid]?.name}
                  containerStyle={localStyle.userAvatarContainer}
                  textStyle={localStyle.userAvatarText}
                />
                <View style={localStyle.participantTextContainer}>
                  <Text style={[localStyle.participantText]}>
                    {renderList[uid]?.name}
                  </Text>
                </View>

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

const localStyle = StyleSheet.create({
  userAvatarContainer: {
    backgroundColor: '#021F3380',
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    marginLeft: 20,
    marginVertical: 16,
  },
  userAvatarText: {
    fontSize: 12,
    lineHeight: 10,
    fontWeight: '400',
    color: '#fff',
  },
  participantContainer: {
    flexDirection: 'row',
    flex: 1,
    overflow: 'hidden',
  },
  participantTextContainer: {
    flex: 1,
    marginVertical: 28,
  },
  participantText: {
    flex: 1,
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 12,
    color: '#000000',
    textAlign: 'left',
    flexShrink: 1,
  },
});

export default AllAudienceParticipants;
