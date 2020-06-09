import React from 'react';
import {View, Text} from 'react-native';
import {MinUidConsumer} from '../agora-rn-uikit/src/MinUidContext';
import {MaxUidConsumer} from '../agora-rn-uikit/src/MaxUidContext';
import {RemoteAudioMute, RemoteVideoMute} from '../agora-rn-uikit/Components';
import LocalAudioMute from './LocalAudioMute';
import LocalVideoMute from './LocalVideoMute';
import LocalUserContext from '../agora-rn-uikit/src/LocalUserContext';
import styles from '../components/styles';

const ParticipantView = () => {
  return (
    <View style={styles.participantView}>
      <MinUidConsumer>
        {(minUsers) =>
          minUsers.map((user) =>
            user.uid !== 'local' ? (
              <View style={styles.participantContainer} key={user.uid}>
                <Text style={styles.participantText}>{user.uid}</Text>
                <View style={styles.participantButtonContainer}>
                  <RemoteAudioMute user={user} />
                  <RemoteVideoMute user={user} rightButton={true} />
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
                  <RemoteAudioMute user={user} />
                  <RemoteVideoMute user={user} rightButton={false} />
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
