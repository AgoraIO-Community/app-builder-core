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
import React, {
  createContext,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
} from 'react';
import {controlMessageEnum} from '../../components/ChatContext';
import {gql, useMutation} from '@apollo/client';
import {useParams} from '../../components/Router';
import {PropsContext} from '../../../agora-rn-uikit';
import Toast from '../../../react-native-toast-message';
import {createHook} from 'fpe-implementation';
import {useString} from '../../utils/useString';
import useSendControlMessage, {
  CONTROL_MESSAGE_TYPE,
} from '../../utils/useSendControlMessage';

export interface RecordingContextInterface {
  startRecording: () => void;
  stopRecording: () => void;
  setRecordingActive: React.Dispatch<SetStateAction<boolean>>;
  isRecordingActive: boolean;
}

const RecordingContext = createContext<RecordingContextInterface>({
  startRecording: () => {},
  stopRecording: () => {},
  setRecordingActive: () => {},
  isRecordingActive: false,
});

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
interface RecordingProviderProps {
  children: React.ReactNode;
  value: Omit<RecordingContextInterface, 'startRecording' | 'stopRecording'>;
}

/**
 * Component to start / stop Agora cloud recording.
 * Sends a control message to all users in the channel over RTM to indicate that
 * Cloud recording has started/stopped.
 */
const RecordingProvider = (props: RecordingProviderProps) => {
  const {rtcProps} = useContext(PropsContext);
  const {setRecordingActive, isRecordingActive} = props?.value;
  const {phrase} = useParams<{phrase: string}>();
  const [startRecordingQuery] = useMutation(START_RECORDING);
  const [stopRecordingQuery] = useMutation(STOP_RECORDING);
  const sendCtrlMsg = useSendControlMessage();
  const prevRecordingState = usePrevious({isRecordingActive});
  const recordingStartedText = useString('recordingNotificationLabel')();
  useEffect(() => {
    /**
     * The below check makes sure the notification is triggered
     * only once. In native apps, this componenet is mounted everytime
     * when chat icon is toggle, as Controls component is hidden and
     * shown
     */
    if (prevRecordingState && isRecordingActive) {
      if (prevRecordingState?.isRecordingActive === isRecordingActive) return;
      Toast.show({
        type: 'success',
        text1: recordingStartedText,
        visibilityTime: 1000,
      });
    }
  }, [isRecordingActive]);

  const startRecording = () => {
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
          sendCtrlMsg(
            CONTROL_MESSAGE_TYPE.controlMessageToEveryOne,
            controlMessageEnum.cloudRecordingActive,
          );
          // set the local recording state to true to update the UI
          setRecordingActive(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const stopRecording = () => {
    // If recording is already going on, stop the recording by executing the graphql query.
    stopRecordingQuery({variables: {passphrase: phrase}})
      .then((res) => {
        console.log(res.data);
        if (res.data.stopRecordingSession === 'success') {
          // Once the backend sucessfuly stops recording,
          // send a control message to everbody in the channel indicating that cloud recording is now inactive.
          sendCtrlMsg(
            CONTROL_MESSAGE_TYPE.controlMessageToEveryOne,
            controlMessageEnum.cloudRecordingUnactive,
          );
          // set the local recording state to false to update the UI
          setRecordingActive(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <RecordingContext.Provider
      value={{
        startRecording,
        stopRecording,
        isRecordingActive,
        setRecordingActive,
      }}>
      {props.children}
    </RecordingContext.Provider>
  );
};

const useRecording = createHook(RecordingContext);

export {RecordingProvider, useRecording};
