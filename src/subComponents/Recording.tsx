import React, {useContext} from 'react';
import {Image, TouchableOpacity, StyleSheet} from 'react-native';
import icons from '../assets/icons';
import ChatContext, {controlMessageEnum} from '../components/ChatContext';
import ColorContext from '../components/ColorContext';
import {gql, useMutation} from '@apollo/client';
import {useParams} from '../components/Router';

const START_RECORDING = gql`
  mutation startRecordingSession($passphrase: String!) {
    startRecordingSession(passphrase: $passphrase)
  }
`;

const STOP_RECORDING = gql`
  mutation stopRecordingSession($passphrase: String!) {
    stopRecordingSession(passphrase: $passphrase)
  }
`;

const Recording = (props: any) => {
  const {primaryColor} = useContext(ColorContext);
  const setRecordingActive = props.setRecordingActive;
  const recordingActive = props.recordingActive;
  const {phrase} = useParams();
  const [
    startRecordingQuery,
    {data: startData, loading: startLoading, error: startError},
  ] = useMutation(START_RECORDING);
  const [
    stopRecordingQuery,
    {data: stopData, loading: stopLoading},
  ] = useMutation(STOP_RECORDING);
  const {sendControlMessage} = useContext(ChatContext);
  return (
    <TouchableOpacity
      style={[style.localButton, {borderColor: primaryColor}]}
      onPress={() => {
        if (!recordingActive) {
          startRecordingQuery({variables: {passphrase: phrase}});
          if (!startLoading && startData) {
            console.log(startData, startError);
            sendControlMessage(controlMessageEnum.cloudRecordingActive);
          }
        } else {
          stopRecordingQuery({variables: {passphrase: phrase}});
          if (!stopLoading && stopData) {
            console.log(stopData);
            sendControlMessage(controlMessageEnum.cloudRecordingUnactive);
          }
        }
        setRecordingActive(!recordingActive);
      }}>
      <Image
        source={{
          uri: recordingActive
            ? icons.recordingActiveIcon
            : icons.recordingIcon,
        }}
        style={[style.buttonIcon, {tintColor: primaryColor}]}
        resizeMode={'contain'}
      />
    </TouchableOpacity>
  );
};

const style = StyleSheet.create({
  localButton: {
    backgroundColor: '#fff',
    borderRadius: 2,
    borderColor: '#099DFD',
    borderWidth: 0,
    width: 46,
    height: 46,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // greenLocalButton: {
  //   backgroundColor: '#4BEB5B',
  //   borderRadius: 2,
  //   borderColor: '#F86051',
  //   width: 46,
  //   height: 46,
  //   alignSelf: 'center',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  buttonIcon: {
    width: 45,
    height: 35,
    tintColor: '#099DFD',
  },
});

export default Recording;
