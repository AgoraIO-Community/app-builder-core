import React, { useContext } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import styles from './styles';
import PropsContext from '../../agora-rn-uikit/src/PropsContext'
import icons from '../assets/icons';
const { recordingIcon } = icons;

let data = {
  resourceId:"",
  sid:""
};

function startRecording(channel: string) {
  // let formData = new FormData();
  // formData.append("cname", channel);
  fetch('https://peaceful-headland-25872.herokuapp.com/record', {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `cname=${channel}`
  }).then(response => response.json())
    .then(result => {
      console.log("started recording : ", result)
      data = result.values;
    })
    .catch(error => console.log('error', error));
}

function stopRecording(channel: string) {
  fetch('https://peaceful-headland-25872.herokuapp.com/stop_record', {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `cname=${channel}&resourceId=${data.resourceId}&sid=${data.sid}`
  }).then(response => response.json())
    .then(result => {
      console.log("stopped recording: ", result)
    })
    .catch(error => console.log('error', error));
}

export default function Recording(props) {
  const setRecordingActive = props.setRecordingActive;
  const recordingActive = props.recordingActive;
  const { rtcProps } = useContext(PropsContext);
  return (
    <TouchableOpacity
      style={recordingActive ? styles.greenLocalButton : styles.localButton}
      onPress={
        () => {
          if(!recordingActive){
            startRecording(rtcProps.channel);
          }
          else{
            stopRecording(rtcProps.channel);
          }
          setRecordingActive(!recordingActive)
        }
      }>
      <Image source={{ uri: recordingIcon }} style={styles.buttonIcon} />
    </TouchableOpacity>
  );
}
