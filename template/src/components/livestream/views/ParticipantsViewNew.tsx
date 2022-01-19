/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';

import {
  PropsContext,
  LocalUserContext,
  MinUidConsumer,
  MaxUidConsumer,
  LocalAudioMute,
  LocalVideoMute,
} from '../../../../agora-rn-uikit';
import chatContext from '../../ChatContext';
import {
  RemoteLiveStreamApprovedRequestRecall,
  CurrentLiveStreamRequestsView,
} from '../../../subComponents/livestream';
import LiveStreamContext from './../LiveStreamContext';
import {UserType} from '../../RTMConfigure';
import RemoteAudioMute from '../../../subComponents/RemoteAudioMute';
import RemoteVideoMute from '../../../subComponents/RemoteVideoMute';

const ParticipantViewNew = (props: any) => {
  const {userList, localUid} = useContext(chatContext);
  const {currLiveStreamRequest} = useContext(LiveStreamContext);
  const {rtcProps} = useContext(PropsContext);
  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);

  const isSmall = dim[0] < 700;

  const allUsers = Object.values(userList)
    .map(function (objectValue, index) {
      return objectValue;
    })
    .filter((user: any) => user.type === 0);

  const allHosts = allUsers.filter((user: any) => user.role === 'host');
  const allAudience = allUsers.filter((user: any) => user.role === 'audience');
  const isHost = () => rtcProps?.role === 'host';

  return (
    <View
      style={
        Platform.OS === 'web'
          ? isSmall
            ? style.participantViewNative
            : style.participantView
          : style.participantViewNative
      }>
      <View style={[style.titleContainer, style.padding15]}>
        <Text style={[style.mainHeading, style.lineUnderHeading]}>
          Participants
        </Text>
      </View>
      <ScrollView style={[style.bodyContainer, style.padding15]}>
        {isHost() && (
          <View style={style.participantsection}>
            <Text style={style.subheading}>Streaming request</Text>
            <View style={style.participantContainer}>
              {currLiveStreamRequest.map((user: any, index: number) => (
                <CurrentLiveStreamRequestsView
                  participantStyles={style}
                  key={index}
                  user={{...userList[user], uid: user}}
                />
              ))}
              {currLiveStreamRequest.length == 0 && (
                <Text style={style.infoText}>No streaming request</Text>
              )}
            </View>
          </View>
        )}
        {/* Host section -> shows different for audience and host */}
        <View style={style.participantsection}>
          <Text style={style.subheading}>Host</Text>
          <View style={style.participantContainer}>
            {isHost() ? (
              <MinUidConsumer>
                {(minUsers) => (
                  <MaxUidConsumer>
                    {(maxUser) =>
                      [...minUsers, ...maxUser].map((user) =>
                        user.uid === 'local' ? (
                          <View style={style.participantRow} key={user.uid}>
                            <View>
                              <Text style={style.participantText}>
                                {userList[localUid]
                                  ? userList[localUid].name
                                  : 'You '}
                                {/* Add you infront my name */}
                                <Text style={style.participantTextSmall}>
                                  {userList[localUid] && ' (You) '}
                                </Text>
                              </Text>
                            </View>
                            <View style={style.participantActionContainer}>
                              <LocalUserContext>
                                <View
                                  style={[
                                    style.actionBtnIcon,
                                    {marginRight: 10},
                                  ]}>
                                  <LocalAudioMute btnText=" " variant="text" />
                                </View>
                                <View style={style.actionBtnIcon}>
                                  <LocalVideoMute btnText=" " variant="text" />
                                </View>
                              </LocalUserContext>
                            </View>
                          </View>
                        ) : user.uid === 1 ? (
                          <View style={style.participantRow} key={user.uid}>
                            <Text style={style.participantText}>
                              {userList[localUid]
                                ? userList[localUid].name + "'s screenshare "
                                : 'Your screenshare '}
                            </Text>
                          </View>
                        ) : (
                          <View style={style.participantRow} key={user.uid}>
                            <Text style={style.participantText}>
                              {userList[user.uid]
                                ? userList[user.uid].name + ' '
                                : String(user.uid)[0] === '1'
                                ? 'PSTN User '
                                : 'User '}
                            </Text>
                            {userList[user.uid]?.type !==
                            UserType.ScreenShare ? (
                              <View style={style.participantActionContainer}>
                                <View
                                  style={[
                                    style.actionBtnIcon,
                                    {marginRight: 10},
                                  ]}>
                                  <RemoteAudioMute
                                    uid={user.uid}
                                    audio={user.audio}
                                    isHost={props.isHost}
                                  />
                                </View>
                                <View
                                  style={[
                                    style.actionBtnIcon,
                                    {marginRight: 10},
                                  ]}>
                                  <RemoteVideoMute
                                    uid={user.uid}
                                    video={user.video}
                                    isHost={props.isHost}
                                  />
                                </View>
                                <View
                                  style={[
                                    style.actionBtnIcon,
                                    {marginLeft: 7},
                                  ]}>
                                  <RemoteLiveStreamApprovedRequestRecall
                                    uid={user.uid}
                                  />
                                </View>
                              </View>
                            ) : (
                              <></>
                            )}
                          </View>
                        ),
                      )
                    }
                  </MaxUidConsumer>
                )}
              </MinUidConsumer>
            ) : (
              allHosts.map((user: any, index: number) => (
                <View style={style.participantRow} key={index}>
                  <Text style={style.participantText}>{user.name}</Text>
                </View>
              ))
            )}
          </View>
        </View>
        <View style={style.participantsection}>
          <Text style={style.subheading}>Audience</Text>
          <View style={style.participantContainer}>
            {allAudience.map((user: any, index: number) => (
              <View style={style.participantRow} key={index}>
                <Text style={style.participantText}>{user.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const style = StyleSheet.create({
  padding15: {
    padding: 15,
  },
  lineUnderHeading: {
    borderBottomWidth: 2,
    borderBottomColor: $config.PRIMARY_COLOR,
  },
  participantView: {
    width: '20%',
    minWidth: 200,
    maxWidth: 300,
    flex: 1,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    shadowColor: $config.PRIMARY_FONT_COLOR + '80',
    shadowOpacity: 0.5,
    shadowOffset: {width: -2, height: 0},
    shadowRadius: 3,
  },
  participantViewNative: {
    position: 'absolute',
    zIndex: 5,
    width: '100%',
    height: '100%',
    right: 0,
    top: 0,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
  },
  bodyContainer: {
    flex: 1,
  },
  participantsection: {
    minHeight: 150,
    marginBottom: 25,
  },
  titleContainer: {
    // cursor: 'default',
  },
  mainHeading: {
    fontSize: 20,
    letterSpacing: 0.8,
    lineHeight: 30,
    color: $config.PRIMARY_FONT_COLOR,
  },
  subheading: {
    fontSize: 15,
    letterSpacing: 0.8,
    fontWeight: '700',
    color: $config.PRIMARY_FONT_COLOR,
  },
  infoText: {
    fontSize: 12,
    letterSpacing: 0.8,
    fontStyle: 'italic',
    color: $config.PRIMARY_FONT_COLOR,
  },
  participantContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 10,
    paddingBottom: 20,
    paddingLeft: 15,
  },

  participantRow: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  participantActionContainer: {
    flexDirection: 'row',
    paddingRight: 10,
    alignSelf: 'center',
    alignItems: 'center',
  },
  actionBtnIcon: {
    width: 25,
    height: 25,
  },
  participantText: {
    lineHeight: 24,
    fontSize: Platform.OS === 'web' ? 18 : 16,
    flexDirection: 'row',
    letterSpacing: 0.3,
    color: $config.PRIMARY_FONT_COLOR,
    // cursor: 'default',
    fontWeight: '300',
  },
  participantTextSmall: {
    fontSize: Platform.OS === 'web' ? 14 : 12,
  },
});

export default ParticipantViewNew;
