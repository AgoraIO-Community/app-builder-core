import React, { useContext } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import styles from '../components/styles';
import PropsContext from '../agora-rn-uikit/src/PropsContext'
import icons from './icons';
const {recordingIcon} = icons;
function startRecording(channel: string) {
  let formData = new FormData();
  formData.append("cname", channel);
  fetch('https://peaceful-headland-25872.herokuapp.com/record', {
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: formData
  }).then(response => {
    console.log("Started recording", response);
  }).catch(err => {
    console.log(err)
  })
}

function stopRecording() {

}

let data = {};

export default function Recording(props) {
  const setRecordingActive = props.setRecordingActive;
  const recordingActive = props.recordingActive;
  const { rtcProps } = useContext(PropsContext);
  return (
    <TouchableOpacity
      style={recordingActive ? styles.greenLocalButton : styles.localButton}
      onPress={() => setRecordingActive(!recordingActive)}>
      <Image source={{ uri: recordingIcon }} style={styles.buttonIcon} />
    </TouchableOpacity>
  );
}
