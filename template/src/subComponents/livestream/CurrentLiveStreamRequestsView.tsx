import React, {useContext, useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import RemoteLiveStreamRequestApprove from './controls/RemoteLiveStreamRequestApprove';
import RemoteLiveStreamRequestReject from './controls/RemoteLiveStreamRequestReject';
import ParticipantName from '../../components/participants/ParticipantName';
import LiveStreamContext, {RaiseHandValue} from '../../components/livestream';
import {filterObject} from '../../utils/index';
import ParticipantSectionTitle from '../../components/participants/ParticipantSectionTitle';
import {useString} from '../../utils/useString';
import {ClientRole} from '../../../agora-rn-uikit';
import {useRender} from 'customization-api';
import UserAvatar from '../../atoms/UserAvatar';

const CurrentLiveStreamRequestsView = (props: any) => {
  //commented for v1 release
  // const noLiveStreamingRequestsLabel = useString(
  //   'raisedHandsListPlaceholder',
  // )();
  // const remoteUserDefaultLabel = useString('remoteUserDefaultLabel')();
  // const noUserFoundLabel = useString('noUserFoundLabel')();
  // const raisedHandsListTitleLabel = useString('raisedHandsListTitleLabel')();
  const noLiveStreamingRequestsLabel = 'No streaming request(s)';
  const remoteUserDefaultLabel = 'User';
  const noUserFoundLabel = 'User not found';
  const raisedHandsListTitleLabel = 'Streaming Request';
  const {p_style} = props;
  const {renderList} = useRender();
  const {raiseHandList, setLastCheckedRequestTimestamp} =
    useContext(LiveStreamContext);
  const [activeLiveStreamRequests, setActiveLiveStreamRequests] =
    React.useState({});

  useEffect(() => {
    setActiveLiveStreamRequests(
      filterObject(
        raiseHandList,
        ([k, v]) =>
          v?.raised === RaiseHandValue.TRUE && v?.role == ClientRole.Audience,
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
              renderList[userUID] ? (
                <View style={localStyle.requestContainer} key={index}>
                  <UserAvatar
                    name={renderList[userUID]?.name || remoteUserDefaultLabel}
                    containerStyle={localStyle.userAvatarContainer}
                    textStyle={localStyle.userAvatarText}
                  />
                  <View style={localStyle.usernameTextContainer}>
                    <Text style={[localStyle.usernameText]}>
                      {renderList[userUID]?.name || remoteUserDefaultLabel}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignSelf: 'center',
                    }}>
                    <View>
                      <RemoteLiveStreamRequestReject uid={userUID} />
                    </View>
                    <View style={{marginLeft: 8}}>
                      <RemoteLiveStreamRequestApprove uid={userUID} />
                    </View>
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
  requestContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  usernameTextContainer: {
    flex: 1,
    marginVertical: 28,
  },
  usernameText: {
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

export default CurrentLiveStreamRequestsView;
