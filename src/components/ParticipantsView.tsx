import React from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import {MinUidConsumer} from '../../agora-rn-uikit/src/MinUidContext';
import {MaxUidConsumer} from '../../agora-rn-uikit/src/MaxUidContext';
import LocalAudioMute from '../subComponents/LocalAudioMute';
import LocalVideoMute from '../subComponents/LocalVideoMute';
import LocalUserContext from '../../agora-rn-uikit/src/LocalUserContext';
import RemoteAudioMute from '../subComponents/RemoteAudioMute';
import RemoteVideoMute from '../subComponents/RemoteVideoMute';
import RemoteEndCall from '../subComponents/RemoteEndCall';

const ParticipantView = (props: {isHost: boolean}) => {
  return (
    <View
      style={
        Platform.OS === 'web'
          ? style.participantView
          : style.participantViewNative
      }>
      <Text style={style.heading}>Participants</Text>
      <MinUidConsumer>
        {(minUsers) => (
          <MaxUidConsumer>
            {(maxUser) =>
              [...minUsers, ...maxUser].map((user) =>
                user.uid !== 'local' ? (
                  <View style={style.participantContainer} key={user.uid}>
                    <Text style={style.participantText}>{user.uid}</Text>
                    <View style={style.participantButtonContainer}>
                      <RemoteAudioMute
                        uid={user.uid}
                        audio={user.audio}
                        isHost={props.isHost}
                      />
                      <RemoteVideoMute
                        uid={user.uid}
                        video={user.video}
                        isHost={props.isHost}
                      />
                      <RemoteEndCall uid={user.uid} isHost={props.isHost} />
                    </View>
                  </View>
                ) : (
                  <View style={style.participantContainer} key={user.uid}>
                    <Text style={style.participantText}>{user.uid}</Text>
                    <View style={style.participantButtonContainer}>
                      <LocalUserContext>
                        <LocalAudioMute />
                        <LocalVideoMute />
                      </LocalUserContext>
                    </View>
                  </View>
                ),
              )
            }
          </MaxUidConsumer>
        )}
      </MinUidConsumer>
    </View>
  );
};

const style = StyleSheet.create({
  participantView: {
    position: 'absolute',
    zIndex: 5,
    width: '20%',
    height: '92%',
    minWidth: 200,
    maxWidth: 400,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
  participantViewNative: {
    position: 'absolute',
    zIndex: 5,
    width: '100%',
    height: '100%',
    right: 0,
    top: 0,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
  },
  participantContainer: {
    flexDirection: 'row',
    flex: 0.07,
    backgroundColor: '#fff',
    height: '15%',
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantText: {
    flex: 1,
    fontSize: Platform.OS === 'web' ? 20 : 16,
    fontWeight: '500',
    flexDirection: 'row',
    color: '#333',
    lineHeight: 20,
    paddingLeft: 10,
    alignSelf: 'center',
  },
  participantButtonContainer: {
    // flex: 0.3,
    flexDirection: 'row',
    paddingRight: 10,
    alignSelf: 'center',
    alignItems: 'center',
  },
});

export default ParticipantView;
