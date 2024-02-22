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
  useState,
} from 'react';
import {gql, useMutation} from '@apollo/client';
import {useParams} from '../../components/Router';
import {PropsContext} from '../../../agora-rn-uikit';
import Toast from '../../../react-native-toast-message';
import {createHook} from 'customization-implementation';
import {useString} from '../../utils/useString';
import ChatContext from '../../components/ChatContext';
import events, {PersistanceLevel} from '../../rtm-events-api';
import {EventActions, EventNames} from '../../rtm-events';
import useRecordingLayoutQuery from './useRecordingLayoutQuery';
import {useScreenContext} from '../../components/contexts/ScreenShareContext';
import {useContent} from 'customization-api';
import {trimText} from '../../utils/common';
import {useRoomInfo} from 'customization-api';
import {Linking} from 'react-native';
import StorageContext from '../../components/StorageContext';

export interface RecordingContextInterface {
  startRecording: () => void;
  stopRecording: () => void;
  isRecordingActive: boolean;
  inProgress: boolean;
}

const RecordingContext = createContext<RecordingContextInterface>({
  startRecording: () => {},
  stopRecording: () => {},
  isRecordingActive: false,
  inProgress: false,
});

const START_RECORDING = gql`
  mutation startRecordingSession(
    $passphrase: String!
    $secret: String
    $config: recordingConfig!
  ) {
    startRecordingSession(
      passphrase: $passphrase
      secret: $secret
      config: $config
    )
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
  value: {
    setRecordingActive: React.Dispatch<SetStateAction<boolean>>;
    isRecordingActive: boolean;
    callActive: boolean;
  };
}

/**
 * Component to start / stop Agora cloud recording.
 * Sends a control message to all users in the channel over RTM to indicate that
 * Cloud recording has started/stopped.
 */

const RecordingProvider = (props: RecordingProviderProps) => {
  const {rtcProps} = useContext(PropsContext);
  const {setRecordingActive, isRecordingActive, callActive} = props?.value;
  const {
    data: {isHost, roomId},
  } = useRoomInfo();
  const [inProgress, setInProgress] = useState(false);
  const [uidWhoStarted, setUidWhoStarted] = useState(0);
  const {defaultContent, activeUids} = useContent();
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
  const {executePresenterQuery, executeNormalQuery} = useRecordingLayoutQuery();
  const {localUid} = useContext(ChatContext);
  const {screenShareData} = useScreenContext();
  const {store} = React.useContext(StorageContext);

  React.useEffect(() => {
    events.on(EventNames.RECORDING_ATTRIBUTE, data => {
      const payload = JSON.parse(data.payload);
      const action = payload.action;
      const value = payload.value;
      switch (action) {
        case EventActions.RECORDING_STARTED:
          setUidWhoStarted(parseInt(value));
          setRecordingActive(true);
          break;
        case EventActions.RECORDING_STOPPED:
          setRecordingActive(false);
          break;
        case EventActions.RECORDING_STOP_REQUEST:
          stopRecording();
          break;
        default:
          break;
      }
    });
    return () => {
      events.off(EventNames.RECORDING_ATTRIBUTE);
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

      if ($config.ENABLE_WAITING_ROOM && !isHost && !callActive) {
        return;
      }

      Toast.show({
        leadingIconName: 'recording',
        type: 'info',
        text1: recordingStartedText(isRecordingActive),
        text2: isRecordingActive
          ? `This room is being recorded by ${
              trimText(defaultContent[uidWhoStarted]?.name) || 'user'
            }`
          : '',
        visibilityTime: 3000,
        primaryBtn: null,
        secondaryBtn: null,
        leadingIcon: null,
      });
    }
  }, [isRecordingActive, callActive, isHost]);

  const startRecording = () => {
    console.log('supriya - start recording', roomId.host);
    const passphrase = roomId.host || '';
    fetch(`${$config.BACKEND_ENDPOINT}/v1/recording/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: store.token ? `Bearer ${store.token}` : '',
      },
      body: JSON.stringify({
        passphrase: roomId.host,
        url: `http://localhost:9000/${passphrase}`,
      }),
    }).then((res: any) => {
      setInProgress(false);
      console.log('supriya recording/start response received', res);
      if (res.status === 200) {
        /**
         * 1. Once the backend sucessfuly starts recording, send message
         * in the channel indicating that cloud recording is now active.
         */
        events.send(
          EventNames.RECORDING_ATTRIBUTE,
          JSON.stringify({
            action: EventActions.RECORDING_STARTED,
            value: `${localUid}`,
          }),
          PersistanceLevel.Session,
        );
        // 2. set the local recording state to true to update the UI
        setUidWhoStarted(localUid);
        setRecordingActive(true);
      }
    });
    // await Linking.canOpenURL(url).then(supported => {
    //   console.log('supported? :', supported);
    //   if (supported) {
    //     Linking.openURL(url)
    //       .then(aa => console.log('openURL resp.:', aa))
    //       .catch(err => console.log('openURL error:', err));
    //   } else {
    //     console.log('url not valid');
    //   }
    // });
    // setInProgress(true);
    // fetch(`${$config.BACKEND_ENDPOINT}/recording/start`, {
    //   body: JSON.stringify({
    //     passphrase: roomId,
    //     mode: 'web',
    //     url: '',
    //     webpage_ready_timeout: 10,
    //   }),
    // })
    //   .then(response => response.json())
    //   .then((res: any) => {
    //     if (res && res?.url) {
    //       console.log('supriya startRecording response received');
    //       Linking.openURL('');
    //     } else {
    //       console.log('supriya startRecording response received without url');
    //     }
    //   })
    //   .catch(_ => {
    //     console.log('supriya startRecording catch block');
    //   });
    // If recording is not going on, start the recording by executing the graphql query
    // startRecordingQuery({
    //   variables: {
    //     passphrase: phrase,
    //     secret:
    //       rtcProps.encryption && rtcProps.encryption.key
    //         ? rtcProps.encryption.key
    //         : '',
    //     config: {
    //       resolution: 'SD360p',
    //       trigger: 'AUTO',
    //     },
    //   },
    // })
    //   .then(res => {
    //     setInProgress(false);
    //     if (res.data.startRecordingSession === 'success') {
    //       /**
    //        * 1. Once the backend sucessfuly starts recording, send message
    //        * in the channel indicating that cloud recording is now active.
    //        */
    //       events.send(
    //         EventNames.RECORDING_ATTRIBUTE,
    //         JSON.stringify({
    //           action: EventActions.RECORDING_STARTED,
    //           value: `${localUid}`,
    //         }),
    //         PersistanceLevel.Session,
    //       );
    //       // 2. set the local recording state to true to update the UI
    //       setUidWhoStarted(localUid);
    //       setRecordingActive(true);
    //       // 3. set the presenter mode if screen share is active
    //       // 3.a Get the most recent screenshare uid
    //       const sorted = Object.entries(screenShareData)
    //         .filter(el => el[1]?.ts && el[1].ts > 0 && el[1]?.isActive)
    //         .sort((a, b) => b[1].ts - a[1].ts);

    //       const activeScreenshareUid = sorted.length > 0 ? sorted[0][0] : 0;
    //       if (activeScreenshareUid) {
    //         console.log(
    //           'screenshare: Executing presenter query for screenuid',
    //           activeScreenshareUid,
    //         );
    //         executePresenterQuery(parseInt(activeScreenshareUid));
    //       } else {
    //         executeNormalQuery();
    //       }
    //     }
    //   })
    //   .catch(err => {
    //     setInProgress(false);
    //     console.log(err);
    //   });
  };

  const stopRecording = () => {
    /**
     * if condition added for below issue
     *
     * user 1 and user 2 in the call
     * user 1 start the recording
     * user 2 stops the recording
     * user 2 join the call getting stop recording notification which is not needed
     *
     * solution
     * case 1 - if recording is not started by the host then we will send level1 message to host who started the recording
     * case 2 - if person who started the recording no longer available in the call then will stop the recording
     */
    if (
      localUid === uidWhoStarted ||
      activeUids.indexOf(uidWhoStarted) === -1
    ) {
      setInProgress(true);
      // If recording is already going on, stop the recording by executing the graphql query.

      fetch(`${$config.BACKEND_ENDPOINT}/v1/recording/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: store.token ? `Bearer ${store.token}` : '',
        },
        body: JSON.stringify({
          passphrase: roomId.host,
        }),
      })
        .then(res => {
          setInProgress(false);
          if (res.status === 200) {
            /**
             * 1. Once the backend sucessfuly starts recording, send message
             * in the channel indicating that cloud recording is now inactive.
             */
            events.send(
              EventNames.RECORDING_ATTRIBUTE,
              JSON.stringify({
                action: EventActions.RECORDING_STOPPED,
                value: '',
              }),
              PersistanceLevel.Session,
            );
            // 2. set the local recording state to false to update the UI
            setRecordingActive(false);
          }
        })
        .catch(err => {
          setInProgress(false);
          console.log(err);
        });
    } else {
      events.send(
        EventNames.RECORDING_ATTRIBUTE,
        JSON.stringify({
          action: EventActions.RECORDING_STOP_REQUEST,
          value: '',
        }),
        PersistanceLevel.None,
      );
    }
  };

  return (
    <RecordingContext.Provider
      value={{
        inProgress,
        startRecording,
        stopRecording,
        isRecordingActive,
      }}>
      {props.children}
    </RecordingContext.Provider>
  );
};
/**
 * The Recording app state governs the App Builder cloud recording functionality.
 */
const useRecording = createHook(RecordingContext);

export {RecordingProvider, useRecording};
