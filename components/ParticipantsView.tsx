import React from 'react';
import {View, Text, Platform} from 'react-native';
import {MinUidConsumer} from '../agora-rn-uikit/src/MinUidContext';
import {MaxUidConsumer} from '../agora-rn-uikit/src/MaxUidContext';
import {RemoteAudioMute, RemoteVideoMute} from '../agora-rn-uikit/Components';
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
              <View key={user.uid} />
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
              <View key={user.uid} />
            ),
          )
        }
      </MaxUidConsumer>
    </View>
  );
};

export default ParticipantView;
