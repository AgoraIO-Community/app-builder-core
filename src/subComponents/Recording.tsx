import React, {useContext} from 'react';
import {Image, TouchableOpacity, StyleSheet} from 'react-native';
import PropsContext from '../../agora-rn-uikit/src/PropsContext';
import icons from '../assets/icons';
import ChatContext, {controlMessageEnum} from '../components/ChatContext';
import ColorContext from '../components/ColorContext';
import {gql, useMutation} from '@apollo/client';

const START_RECORDING = gql`
  mutation startRecordingSession($channel: String!) {
    startRecordingSession(channel: $channel)
  }
`;

const STOP_RECORDING = gql`
  mutation stopRecordingSession($channel: String!) {
    startRecordingSession(channel: $channel)
  }
`;

const Recording = (props: any) => {
  const {primaryColor} = useContext(ColorContext);
  const setRecordingActive = props.setRecordingActive;
  const recordingActive = props.recordingActive;
  const {rtcProps} = useContext(PropsContext);
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
      style={
        recordingActive
          ? style.greenLocalButton
          : [style.localButton, {borderColor: primaryColor}]
      }
      onPress={() => {
        if (!recordingActive) {
          startRecordingQuery({variables: {channel: rtcProps.channel}});
          if (!startLoading && startData) {
            console.log(startData, startError);
            sendControlMessage(controlMessageEnum.cloudRecordingActive);
          }
        } else {
          stopRecordingQuery({variables: {channel: rtcProps.channel}});
          if (!stopLoading && stopData) {
            console.log(stopData);
            sendControlMessage(controlMessageEnum.cloudRecordingUnactive);
          }
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
