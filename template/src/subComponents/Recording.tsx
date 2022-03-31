/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React, {useContext, useEffect, useRef} from 'react';
import {TouchableOpacity, StyleSheet, View, Text} from 'react-native';
import ChatContext, {controlMessageEnum} from '../components/ChatContext';
import ColorContext from '../components/ColorContext';
import {gql, useMutation} from '@apollo/client';
import {useParams} from '../components/Router';
import {PropsContext} from '../../agora-rn-uikit';
import Toast from '../../react-native-toast-message';
import {ImageIcon} from '../../agora-rn-uikit';

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
function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const Recording = (props: any) => {
  const {rtcProps} = useContext(PropsContext);
  const {primaryColor} = useContext(ColorContext);
  const setRecordingActive = props.setRecordingActive;
  const recordingActive = props.recordingActive;
  const {phrase} = useParams();
  const [startRecordingQuery] = useMutation(START_RECORDING);
  const [stopRecordingQuery] = useMutation(STOP_RECORDING);
  const {sendControlMessage} = useContext(ChatContext);
  const prevRecordingState = usePrevious({recordingActive});

  useEffect(() => {
    /**
     * The below check makes sure the notification is triggered
     * only once. In native apps, this componenet is mounted everytime
     * when chat icon is toggle, as Controls component is hidden and
     * shown
     */
    if (prevRecordingState && recordingActive) {
      if (prevRecordingState?.recordingActive === recordingActive) return;
      Toast.show({text1: 'Recording Started', visibilityTime: 1000});
    }
  }, [recordingActive]);

  return (
    <TouchableOpacity
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
      <View style={[style.localButton, {borderColor: primaryColor}]}>
        <ImageIcon
          name={recordingActive ? 'recordingActiveIcon' : 'recordingIcon'}
          style={[style.buttonIcon]}
          color={recordingActive ? '#FD0845' : $config.PRIMARY_COLOR}
        />
      </View>
      <Text
        style={{
          textAlign: 'center',
          marginTop: 5,
          color: recordingActive ? '#FD0845' : $config.PRIMARY_COLOR,
        }}>
        {recordingActive ? 'Recording' : 'Record'}
      </Text>
    </TouchableOpacity>
  );
};

const style = StyleSheet.create({
  localButton: {
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    borderRadius: 23,
    borderColor: $config.PRIMARY_COLOR,
    borderWidth: 0,
    width: 40,
    height: 40,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: '90%',
    height: '90%',
  },
});

export default Recording;
