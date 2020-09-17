import React, {useContext} from 'react';
import {Image, TouchableOpacity, StyleSheet} from 'react-native';
import PropsContext from '../../agora-rn-uikit/src/PropsContext';
import icons from '../assets/icons';
import ChatContext, {controlMessageEnum} from '../components/ChatContext';
import ColorContext from '../components/ColorContext';

let data = {
  resourceId: '',
  sid: '',
};

function startRecording(channel: string) {
  // let formData = new FormData();
  // formData.append("cname", channel);
  fetch('https://peaceful-headland-25872.herokuapp.com/record', {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `cname=${channel}`,
  })
    .then((response) => response.json())
    .then((result) => {
      console.log('started recording : ', result);
      data = result.values;
    })
    .catch((error) => console.log('error', error));
}

function stopRecording(channel: string) {
  fetch('https://peaceful-headland-25872.herokuapp.com/stop_record', {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `cname=${channel}&resourceId=${data.resourceId}&sid=${data.sid}`,
  })
    .then((response) => response.json())
    .then((result) => {
      console.log('stopped recording: ', result);
    })
    .catch((error) => console.log('error', error));
}

const Recording = (props: any) => {
  const {primaryColor} = useContext(ColorContext);
  const setRecordingActive = props.setRecordingActive;
  const recordingActive = props.recordingActive;
  const {rtcProps} = useContext(PropsContext);
  const {sendControlMessage} = useContext(ChatContext);
  return (
    <TouchableOpacity
      style={
        recordingActive
          ? style.greenLocalButton
          : [style.localButton, {borderColor: primaryColor}]
      }
      onPress={() => {
        if (!recordingActive) {
          startRecording(rtcProps.channel);
          sendControlMessage(controlMessageEnum.cloudRecordingActive);
        } else {
          stopRecording(rtcProps.channel);
          sendControlMessage(controlMessageEnum.cloudRecordingUnactive);
        }
        setRecordingActive(!recordingActive);
      }}>
      <Image
        source={{uri: icons.recordingIcon}}
        style={[style.buttonIcon, {tintColor: primaryColor}]}
      />
    </TouchableOpacity>
  );
};

const style = StyleSheet.create({
  localButton: {
    backgroundColor: '#fff',
    borderRadius: 2,
    borderColor: '#099DFD',
    borderWidth: 1,
    width: 46,
    height: 46,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenLocalButton: {
    backgroundColor: '#4BEB5B',
    borderRadius: 2,
    borderColor: '#F86051',
    width: 46,
    height: 46,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: 25,
    height: 25,
    tintColor: '#099DFD',
  },
});

export default Recording;
