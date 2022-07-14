import React, {useContext, useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import RemoteLiveStreamRequestApprove from './controls/RemoteLiveStreamRequestApprove';
import RemoteLiveStreamRequestReject from './controls/RemoteLiveStreamRequestReject';
import ParticipantName from '../../components/participants/ParticipantName';
import LiveStreamContext, {requestStatus} from '../../components/livestream';
import {filterObject} from '../../utils/index';
import ParticipantSectionTitle from '../../components/participants/ParticipantSectionTitle';
import {useString} from '../../utils/useString';
import useUserList from '../../utils/useUserList';

const CurrentLiveStreamRequestsView = (props: any) => {
  const noLiveStreamingRequestsLabel = useString(
    'raisedHandsListPlaceholder',
  )();
  const remoteUserDefaultLabel = useString('remoteUserDefaultLabel')();
  const noUserFoundLabel = useString('noUserFoundLabel')();
  const raisedHandsListTitleLabel = useString('raisedHandsListTitleLabel')();
  const {p_style} = props;
  const {renderList} = useUserList();
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
        title={raisedHandsListTitleLabel + ' '}
        count={Object.keys(activeLiveStreamRequests).length}
      />
      <View style={p_style.participantContainer}>
        {Object.keys(currLiveStreamRequest).length == 0 ||
        Object.keys(activeLiveStreamRequests).length == 0 ? (
          <Text style={p_style.infoText}>{noLiveStreamingRequestsLabel}</Text>
        ) : (
          Object.keys(activeLiveStreamRequests).map(
            (userUID: any, index: number) =>
              renderList[userUID] ? (
                <View style={p_style.participantRow} key={index}>
                  <ParticipantName
                    value={renderList[userUID]?.name || remoteUserDefaultLabel}
                  />
                  <View style={p_style.participantActionContainer}>
                    <RemoteLiveStreamRequestApprove uid={userUID} />
                    <RemoteLiveStreamRequestReject uid={userUID} />
                  </View>
                </View>
              ) : (
                <View style={p_style.participantRow} key={index}>
                  <ParticipantName value={noUserFoundLabel} />
                </View>
              ),
          )
        )}
      </View>
    </>
  );
};

export default CurrentLiveStreamRequestsView;
