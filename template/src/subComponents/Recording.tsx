import React, {useContext} from 'react';
import {Image, TouchableOpacity, StyleSheet} from 'react-native';
import icons from '../assets/icons';
import ChatContext, {controlMessageEnum} from '../components/ChatContext';
import ColorContext from '../components/ColorContext';
import {gql, useMutation} from '@apollo/client';
import {useParams} from '../components/Router';
import PropsContext from '../../agora-rn-uikit/src/PropsContext';

const START_RECORDING = gql`
  mutation startRecordingSession($passphrase: String!, $secret: String) {
    startRecordingSession(passphrase: $passphrase, secret: $secret)
  }
`;

const STOP_RECORDING = gql`
  mutation stopRecordingSession($passphrase: String!) {
    stopRecordingSession(passphrase: $passphrase)
  }
`;

/**
 * Component to start / stop Agora cloud recording.
 * Sends a control message to all users in the channel over RTM to indicate that
 * Cloud recording has started/stopped.
 */
const Recording = (props: any) => {
  const {rtcProps} = useContext(PropsContext);
  const {primaryColor} = useContext(ColorContext);
  const setRecordingActive = props.setRecordingActive;
  const recordingActive = props.recordingActive;
  const {phrase} = useParams();
  const [startRecordingQuery] = useMutation(START_RECORDING);
  const [stopRecordingQuery] = useMutation(STOP_RECORDING);
  const {sendControlMessage} = useContext(ChatContext);
  return (
    <TouchableOpacity
      style={[style.localButton, {borderColor: primaryColor}]}
      onPress={() => {
        if (!recordingActive) {
          // If recording is not going on, start the recording by executing the graphql query
          startRecordingQuery({
            variables: {
              passphrase: phrase,
              secret:
                rtcProps.encryption && rtcProps.encryption.key
                  ? rtcProps.encryption.key
                  : '',
            },
          })
            .then((res) => {
              console.log(res.data);
              if (res.data.startRecordingSession === 'success') {
                // Once the backend sucessfuly starts recording,
                // send a control message to everbody in the channel indicating that cloud recording is now active.
                sendControlMessage(controlMessageEnum.cloudRecordingActive);
                // set the local recording state to true to update the UI
                setRecordingActive(true);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          // If recording is already going on, stop the recording by executing the graphql query.
          stopRecordingQuery({variables: {passphrase: phrase}})
            .then((res) => {
              console.log(res.data);
              if (res.data.stopRecordingSession === 'success') {
                // Once the backend sucessfuly stops recording,
                // send a control message to everbody in the channel indicating that cloud recording is now inactive.
                sendControlMessage(controlMessageEnum.cloudRecordingUnactive);
                // set the local recording state to false to update the UI
                setRecordingActive(false);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
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
    backgroundColor: $config.secondaryFontColor,
    borderRadius: 23,
    borderColor: $config.primaryColor,
    borderWidth: 0,
    width: 40,
    height: 40,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: '100%',
    height: '100%',
    tintColor: $config.primaryColor,
  },
});

export default Recording;
