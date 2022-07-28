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
import {gql, useMutation} from '@apollo/client';
import {useParams} from '../../components/Router';
import {PropsContext} from '../../../agora-rn-uikit';
import Toast from '../../../react-native-toast-message';
import {createHook} from 'fpe-implementation';
import {useString} from '../../utils/useString';
import ChatContext from '../../components/ChatContext';
import CustomEvents, {EventLevel} from '../../custom-events';
import {EventActions, EventNames} from '../../rtm-events';
import useRecordingLayoutQuery from './useRecordingLayoutQuery';
import {useScreenContext} from '../../components/contexts/ScreenShareContext';

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
function usePrevious<T = any>(value: any) {
  const ref = useRef<T>();
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
  const prevRecordingState = usePrevious<{isRecordingActive: boolean}>({
    isRecordingActive,
  });
  //commented for v1 release
  //const recordingStartedText = useString<boolean>('recordingNotificationLabel');
  const recordingStartedText = (active: boolean) =>
    active ? 'Recording Started' : 'Recording Stopped';
  const {executePresenterQuery} = useRecordingLayoutQuery();
  const {localUid} = useContext(ChatContext);
  const {screenShareData} = useScreenContext();

  React.useEffect(() => {
    CustomEvents.on(EventNames.RECORDING_ATTRIBUTE, (data) => {
      switch (data?.payload?.action) {
        case EventActions.RECORDING_STARTED:
          setRecordingActive(true);
          break;
        case EventActions.RECORDING_STOPPED:
          setRecordingActive(false);
          break;
        default:
          break;
      }
    });
    () => {
      CustomEvents.off(EventNames.RECORDING_ATTRIBUTE);
    };
  }, []);

  useEffect(() => {
    /**
     * The below check makes sure the notification is triggered
     * only once. In native apps, this componenet is mounted everytime
     * when chat icon is toggle, as Controls component is hidden and
     * shown
     */
    if (prevRecordingState) {
      if (prevRecordingState?.isRecordingActive === isRecordingActive) return;
      Toast.show({
        type: 'success',
        text1: recordingStartedText(isRecordingActive),
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
          /**
           * 1. Once the backend sucessfuly starts recording, send message
           * in the channel indicating that cloud recording is now active.
           */
          CustomEvents.send(EventNames.RECORDING_ATTRIBUTE, {
            action: EventActions.RECORDING_STARTED,
            value: `${localUid}`,
            level: EventLevel.LEVEL3,
          });
          // 2. set the local recording state to true to update the UI
          setRecordingActive(true);
          // 3. set the presenter mode if screen share is active
          if (Object.values(screenShareData).some((item) => item.isActive)) {
            console.log('Executing presenter query');
            executePresenterQuery();
          }
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
          /**
           * 1. Once the backend sucessfuly starts recording, send message
           * in the channel indicating that cloud recording is now inactive.
           */
          CustomEvents.send(EventNames.RECORDING_ATTRIBUTE, {
            action: EventActions.RECORDING_STOPPED,
            value: '',
            level: EventLevel.LEVEL3,
          });
          // 2. set the local recording state to false to update the UI
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
