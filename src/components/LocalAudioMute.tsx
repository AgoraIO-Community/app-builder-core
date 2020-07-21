import React, {useContext} from 'react';
import RtcContext, {DispatchType} from '../../agora-rn-uikit/src/RtcContext';
import {LocalContext} from '../../agora-rn-uikit/src/LocalUserContext';
import {Image, TouchableOpacity} from 'react-native';
import icons from './icons';
import styles from './styles';

function LocalAudioMute() {
  const {dispatch} = useContext(RtcContext);
  const local = useContext(LocalContext);

  return (
    <TouchableOpacity
      onPress={() => {
        (dispatch as DispatchType<'LocalMuteAudio'>)({
          type: 'LocalMuteAudio',
          value: [local.audio],
        });
      }}>
      <Image
        style={styles.buttonIcon}
        source={{uri: local.audio ? icons.mic : icons.micOff}}
      />
    </TouchableOpacity>
  );
}

export default LocalAudioMute;
