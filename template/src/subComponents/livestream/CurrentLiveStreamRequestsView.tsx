import React, {useContext, useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import RemoteLiveStreamRequestApprove from './controls/RemoteLiveStreamRequestApprove';
import RemoteLiveStreamRequestReject from './controls/RemoteLiveStreamRequestReject';
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
  const containerStyle = {
    background: '#021F3380',
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  };
  const textStyle = {
    fontSize: 12,
    lineHeight: 10,
    fontWeight: '400',
    color: '#fff',
  };

  return (
    <>
      {Object.keys(raiseHandList).length == 0 ||
      Object.keys(activeLiveStreamRequests).length == 0 ? (
        <></>
      ) : (
        <>
          <ParticipantSectionTitle
            title={raisedHandsListTitleLabel + ' '}
            count={Object.keys(activeLiveStreamRequests).length}
          />
          {Object.keys(activeLiveStreamRequests).map(
            (userUID: any, index: number) =>
              renderList[userUID] ? (
                <View style={styles.container}>
                  <View style={styles.userInfoContainer}>
                    <UserAvatar
                      name={renderList[userUID].name}
                      containerStyle={containerStyle}
                      textStyle={textStyle}
                    />
                    <View style={{alignSelf: 'center'}}>
                      <Text style={styles.participantNameText}>
                        {renderList[userUID].name}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.btnContainer}>
                    <RemoteLiveStreamRequestReject uid={userUID} />
                    <RemoteLiveStreamRequestApprove uid={userUID} />
                  </View>
                </View>
              ) : (
                <View style={{alignSelf: 'center'}} key={index}>
                  <Text>{noUserFoundLabel}</Text>
                </View>
              ),
          )}
        </>
      )}
    </>
  );
};
const styles = StyleSheet.create({
  btnContainer: {
    flex: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  userInfoContainer: {
    flexDirection: 'row',
    flex: 0.5,
  },
  participantNameText: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 15,
    fontFamily: 'Source Sans Pro',
    flexDirection: 'row',
    color: $config.FONT_COLOR,
    textAlign: 'left',
  },
});

export default CurrentLiveStreamRequestsView;
