import React from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import {MaxUidConsumer} from '../../agora-rn-uikit/src/MaxUidContext';
import {MaxVideoView} from '../../agora-rn-uikit/Components';
import {LocalAudioMute, LocalVideoMute} from '../../agora-rn-uikit/Components';
import LocalUserContext from '../../agora-rn-uikit/src/LocalUserContext';
import SelectDevice from '../subComponents/SelectDevice';
import styles from './styles';

const Precall = (props: any) => {
  const {setCallActive} = props;

  return (
    <View style={styles.full}>
      <MaxUidConsumer>
        {(maxUsers) => (
          <MaxVideoView user={maxUsers[0]} key={maxUsers[0].uid} />
        )}
      </MaxUidConsumer>
      <View style={styles.precallPickers}>
        <SelectDevice />
      </View>
      <View style={styles.precallControls}>
        <LocalUserContext>
          <LocalVideoMute />
          <LocalAudioMute />
        </LocalUserContext>
      </View>
      <TouchableOpacity onPress={() => setCallActive(true)}>
        <View style={styles.precallButton}>
          <Text style={styles.buttonText}>Join</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Precall;
