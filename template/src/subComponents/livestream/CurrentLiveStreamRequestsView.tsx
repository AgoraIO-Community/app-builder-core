import React, {useContext, useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import RemoteLiveStreamRequestApprove from './controls/RemoteLiveStreamRequestApprove';
import RemoteLiveStreamRequestReject from './controls/RemoteLiveStreamRequestReject';
import ParticipantName from '../../components/participants/ParticipantName';
import LiveStreamContext, {requestStatus} from '../../components/livestream';
import {filterObject} from '../../utils/index';
import ParticipantSectionTitle from '../../components/participants/ParticipantSectionTitle';

const CurrentLiveStreamRequestsView = (props: any) => {
  const {userList, p_style} = props;
  const {currLiveStreamRequest, setLastCheckedRequestTimestamp} =
    useContext(LiveStreamContext);
  const [activeLiveStreamRequests, setActiveLiveStreamRequests] =
    React.useState({});

  useEffect(() => {
    setActiveLiveStreamRequests(
      filterObject(
        currLiveStreamRequest,
        ([k, v]) => v?.status === requestStatus.AwaitingAction,
      ),
    );
  }, [currLiveStreamRequest]);

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
      <View style={p_style.participantContainer}>
        {Object.keys(currLiveStreamRequest).length == 0 ||
        Object.keys(activeLiveStreamRequests).length == 0 ? (
          <Text style={p_style.infoText}>No streaming request(s)</Text>
        ) : (
          Object.keys(activeLiveStreamRequests).map(
            (userUID: any, index: number) =>
              userList[userUID] ? (
                <View style={p_style.participantRow} key={index}>
                  <ParticipantName value={userList[userUID]?.name || 'User'} />
                  <View style={p_style.participantActionContainer}>
                    <RemoteLiveStreamRequestApprove
                      user={{...userList[userUID], uid: userUID}}
                    />
                    <RemoteLiveStreamRequestReject
                      user={{...userList[userUID], uid: userUID}}
                    />
                  </View>
                </View>
              ) : (
                <View style={p_style.participantRow} key={index}>
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
