import React from 'react';
import {View, Text} from 'react-native';
import {MinUidConsumer} from '../../agora-rn-uikit/src/MinUidContext';
import {MaxUidConsumer} from '../../agora-rn-uikit/src/MaxUidContext';
import LocalAudioMute from '../subComponents/LocalAudioMute';
import LocalVideoMute from '../subComponents/LocalVideoMute';
import LocalUserContext from '../../agora-rn-uikit/src/LocalUserContext';
import styles from './styles';
import RemoteAudioMute from '../subComponents/RemoteAudioMute';
import RemoteVideoMute from '../subComponents/RemoteVideoMute';
import RemoteEndCall from '../subComponents/RemoteEndCall';

const ParticipantView = (props: {isHost: boolean}) => {
  return (
    <View style={styles.participantView}>
      <MinUidConsumer>
        {(minUsers) =>
          minUsers.map((user) =>
            user.uid !== 'local' ? (
              <View style={styles.participantContainer} key={user.uid}>
                <Text style={styles.participantText}>{user.uid}</Text>
                <View style={styles.participantButtonContainer}>
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
              <View style={styles.participantContainer} key={user.uid}>
                <Text style={styles.participantText}>{user.uid}</Text>
                <View style={styles.participantButtonContainer}>
                  <LocalUserContext>
                    <LocalAudioMute />
                    <LocalVideoMute />
                  </LocalUserContext>
                </View>
              </View>
            ),
          )
        }
      </MinUidConsumer>
      <MaxUidConsumer>
        {(maxUsers) =>
          maxUsers.map((user) =>
            user.uid !== 'local' ? (
              <View style={styles.participantContainer} key={user.uid}>
                <Text style={styles.participantText}>{user.uid}</Text>
                <View style={styles.participantButtonContainer}>
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
              <View style={styles.participantContainer} key={user.uid}>
                <Text style={styles.participantText}>{user.uid}</Text>
                <View style={styles.participantButtonContainer}>
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
    </View>
  );
};

export default ParticipantView;
