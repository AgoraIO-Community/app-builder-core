import React from 'react';
import {MinUidConsumer} from '../agora-rn-uikit/src/MinUidContext';
import {View, Text} from 'react-native';
import styles from './styles';

export default function ParticipantCounter() {
  return (
    <View style={styles.participantCountInner}>
      <MinUidConsumer>
        {(minUsers) => (
          <View style={styles.participantCountTextHolder}>
            <Text style={styles.participantCountText}>+{minUsers.length + 1}</Text>
          </View>
        )}
      </MinUidConsumer>
    </View>
  );
}
