import React, {useContext, useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import RemoteLiveStreamRequestApprove from './controls/RemoteLiveStreamRequestApprove';
import RemoteLiveStreamRequestReject from './controls/RemoteLiveStreamRequestReject';
import ParticipantName from '../../components/participants/ParticipantName';
import LiveStreamContext, {RaiseHandValue} from '../../components/livestream';
import {filterObject} from '../../utils/index';
import ParticipantSectionTitle from '../../components/participants/ParticipantSectionTitle';
import {useString} from '../../utils/useString';
import {ClientRole} from '../../../agora-rn-uikit';

const CurrentLiveStreamRequestsView = (props: any) => {
  const noLiveStreamingRequestsLabel = useString(
    'raisedHandsListPlaceholder',
  )();
  const remoteUserDefaultLabel = useString('remoteUserDefaultLabel')();
  const noUserFoundLabel = useString('noUserFoundLabel')();
  const raisedHandsListTitleLabel = useString('raisedHandsListTitleLabel')();
  const {userList, p_style} = props;
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
  }, [raiseHandList, userList]);

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
        {Object.keys(raiseHandList).length == 0 ||
        Object.keys(activeLiveStreamRequests).length == 0 ? (
          <Text style={p_style.infoText}>{noLiveStreamingRequestsLabel}</Text>
        ) : (
          Object.keys(activeLiveStreamRequests).map(
            (userUID: any, index: number) =>
              userList[userUID] ? (
                <View style={p_style.participantRow} key={index}>
                  <ParticipantName
                    value={userList[userUID]?.name || remoteUserDefaultLabel}
                  />
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
