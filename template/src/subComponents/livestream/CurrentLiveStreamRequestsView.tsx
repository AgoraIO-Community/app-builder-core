import React, {useContext, useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import RemoteLiveStreamRequestApprove from './controls/RemoteLiveStreamRequestApprove';
import RemoteLiveStreamRequestReject from './controls/RemoteLiveStreamRequestReject';
import ParticipantName from '../../components/participants/ParticipantName';
import {participantStylesInterface} from '../../components/ParticipantsView';
import LiveStreamContext, {RaiseHandValue} from '../../components/livestream';
import {filterObject} from '../../utils/index';
import ParticipantSectionTitle from '../../components/participants/ParticipantSectionTitle';
import {ClientRole} from '../../../agora-rn-uikit';

interface IProps {
  userList: any;
  participantStyles: participantStylesInterface;
}

const CurrentLiveStreamRequestsView = (props: IProps) => {
  const {userList, participantStyles} = props;
  const {raiseHandList, setLastCheckedRequestTimestamp} =
    useContext(LiveStreamContext);

  const [activeLiveStreamRequests, setActiveLiveStreamRequests] =
    React.useState({});

  useEffect(() => {
    setActiveLiveStreamRequests(
      filterObject(
        raiseHandList,
        ([k, v]) =>
          v?.raised === RaiseHandValue.TRUE &&
          userList[k]?.role == ClientRole.Audience,
      ),
    );
  }, [raiseHandList]);

  React.useEffect(() => {
    // On unmount update the timestamp, if the user was already active in this view
    return () => {
      setLastCheckedRequestTimestamp(new Date().getTime());
    };
  }, []);

  return (
    <>
      <ParticipantSectionTitle
        title="Streaming Request "
        count={Object.keys(activeLiveStreamRequests).length}
      />
      <View style={participantStyles.participantContainer}>
        {Object.keys(raiseHandList).length == 0 ||
        Object.keys(activeLiveStreamRequests).length == 0 ? (
          <Text style={participantStyles.infoText}>
            No streaming request(s)
          </Text>
        ) : (
          Object.keys(activeLiveStreamRequests).map(
            (userUID: any, index: number) =>
              userList[userUID] ? (
                <View style={participantStyles.participantRow} key={index}>
                  <ParticipantName value={userList[userUID]?.name || 'User'} />
                  <View style={participantStyles.participantActionContainer}>
                    <RemoteLiveStreamRequestApprove
                      user={{...userList[userUID], uid: userUID}}
                    />
                    <RemoteLiveStreamRequestReject
                      user={{...userList[userUID], uid: userUID}}
                    />
                  </View>
                </View>
              ) : (
                <View style={participantStyles.participantRow} key={index}>
                  <ParticipantName value={'User not found'} />
                </View>
              ),
          )
        )}
      </View>
    </>
  );
};

export default CurrentLiveStreamRequestsView;
