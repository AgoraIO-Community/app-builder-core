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
  useCallback,
} from 'react';
import Toast from '../../../react-native-toast-message';
import {createHook} from 'customization-implementation';
import {useString} from '../../utils/useString';
import ChatContext from '../../components/ChatContext';
import events, {PersistanceLevel} from '../../rtm-events-api';
import {EventActions, EventNames} from '../../rtm-events';
import {useContent} from 'customization-api';
import {trimText} from '../../utils/common';
import {useRoomInfo} from 'customization-api';
import StorageContext from '../../components/StorageContext';
import {useSidePanel} from '../../utils/useSidePanel';
import {useCaption} from '../caption/useCaption';
import {SidePanelType} from '../SidePanelEnum';
import {
  ChatType,
  useChatUIControls,
} from '../../components/chat-ui/useChatUIControls';
import {useIsRecordingBot} from './useIsRecordingBot';
import {
  videoRoomRecordingToastHeading,
  videoRoomRecordingToastSubHeading,
  videoRoomUserFallbackText,
  videoRoomRecordingStartErrorToastHeading,
  videoRoomRecordingStopErrorToastHeading,
  videoRoomRecordingErrorToastSubHeading,
} from '../../language/default-labels/videoCallScreenLabels';
import {getOriginURL} from '../../auth/config';
import {LogSource, logger} from '../../logger/AppBuilderLogger';

const getFrontendUrl = (url: string) => {
  // check if it doesn't contains the https protocol
  if (url.indexOf('https://') !== 0) {
    url = `https://${url}`;
  }
  return url;
};

interface RecordingsData {
  recordings: [];
  pagination: {};
}
export interface RecordingContextInterface {
  startRecording: () => void;
  stopRecording: () => void;
  isRecordingActive: boolean;
  inProgress: boolean;
  fetchRecordings?: (page: number) => Promise<RecordingsData>;
}

const RecordingContext = createContext<RecordingContextInterface>({
  startRecording: () => {},
  stopRecording: () => {},
  isRecordingActive: false,
  inProgress: false,
});

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
    callActive: boolean;
  };
}

/**
 * Component to start / stop Agora cloud recording.
 * Sends a control message to all users in the channel over RTM to indicate that
 * Cloud recording has started/stopped.
 */

const RecordingProvider = (props: RecordingProviderProps) => {
  const {callActive} = props?.value;
  const [isRecordingActive, setRecordingActive] = useState(false);
  const {
    data: {isHost, roomId},
  } = useRoomInfo();
  const [inProgress, setInProgress] = useState(false);
  const [uidWhoStarted, setUidWhoStarted] = useState(0);
  const {defaultContent, activeUids} = useContent();
  const prevRecordingState = usePrevious<{isRecordingActive: boolean}>({
    isRecordingActive,
  });
  const recordingStartedText = useString<boolean>(
    videoRoomRecordingToastHeading,
  );
  const subheading = useString(videoRoomRecordingToastSubHeading);

  const headingStartError = useString(
    videoRoomRecordingStartErrorToastHeading,
  )();
  const headingStopError = useString(videoRoomRecordingStopErrorToastHeading)();
  const subheadingError = useString(videoRoomRecordingErrorToastSubHeading)();

  const userlabel = useString(videoRoomUserFallbackText)();

  const {localUid} = useContext(ChatContext);
  const {store} = React.useContext(StorageContext);

  const {setChatType} = useChatUIControls();
  const {setSidePanel} = useSidePanel();
  const {setIsCaptionON} = useCaption();
  const {isRecordingBot, recordingBotUIConfig} = useIsRecordingBot();

  const setRecordingBotUI = () => {
    if (isRecordingBot) {
      if (recordingBotUIConfig?.chat && $config.CHAT) {
        setSidePanel(SidePanelType.Chat);
        setChatType(ChatType.Group);
      }
      if (recordingBotUIConfig.stt && $config.ENABLE_STT) {
        setIsCaptionON(true);
      }
    }
  };

  useEffect(() => {
    if (callActive) {
      setRecordingBotUI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callActive]);

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
          ? subheading(
              trimText(defaultContent[uidWhoStarted]?.name) || userlabel,
            )
          : '',
        visibilityTime: 3000,
        primaryBtn: null,
        secondaryBtn: null,
        leadingIcon: null,
      });
    }
  }, [isRecordingActive, callActive, isHost]);

  const showErrorToast = (text1: string, text2?: string) => {
    Toast.show({
      leadingIconName: 'alert',
      type: 'error',
      text1: text1,
      text2: text2 ? text2 : '',
      visibilityTime: 3000,
      primaryBtn: null,
      secondaryBtn: null,
      leadingIcon: null,
    });
  };

  const startRecording = () => {
    const passphrase = roomId.host || '';
    let recordinghostURL = getOriginURL();
    if (inProgress) {
      logger.debug(
        LogSource.Internals,
        'RECORDING',
        'start recording already in progress. Aborting..',
      );
      return;
    }
    if (recordinghostURL.includes('localhost')) {
      logger.error(
        LogSource.Internals,
        'RECORDING',
        'Recording url cannot be localhost. It should be a valid deployed URL',
        recordinghostURL,
      );
      return;
    }
    recordinghostURL = getFrontendUrl(recordinghostURL);
    setInProgress(true);
    logger.debug(
      LogSource.NetworkRest,
      'recording_start',
      'Trying to start recording',
      {
        passphrase: roomId.host,
        url: `${recordinghostURL}/${passphrase}`,
      },
    );
    fetch(`${$config.BACKEND_ENDPOINT}/v1/recording/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: store.token ? `Bearer ${store.token}` : '',
      },
      body: JSON.stringify({
        passphrase: roomId.host,
        url: `${recordinghostURL}/${passphrase}`,
        webpage_ready_timeout: 10,
        encryption: $config.ENCRYPTION_ENABLED,
        mode: 'web',
      }),
    })
      .then((res: any) => {
        setInProgress(false);
        if (res.status === 200) {
          logger.debug(
            LogSource.NetworkRest,
            'recording_start',
            'start recording successfully',
            res,
          );
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
        } else if (res.status === 500) {
          logger.error(
            LogSource.NetworkRest,
            'recording_start',
            'Error while start recording',
            res,
          );
          showErrorToast(headingStartError, subheadingError);
        } else {
          logger.error(
            LogSource.NetworkRest,
            'recording_start',
            'Error while start recording',
            res,
          );
          showErrorToast(headingStartError);
        }
      })
      .catch(err => {
        logger.error(
          LogSource.NetworkRest,
          'recording_start',
          'Error while start recording',
          err,
        );
        setInProgress(false);
      });
  };

  const stopRecording = useCallback(() => {
    /**
     * Any host in the channel can stop recording.
     */
    logger.debug(LogSource.Internals, 'RECORDING', 'stop recording API called');
    if (inProgress) {
      logger.error(
        LogSource.Internals,
        'RECORDING',
        'stop recording already in progress. Aborting..',
      );
      return;
    }
    setInProgress(true);
    // If recording is already going on, stop the recording by executing the below query.
    logger.debug(
      LogSource.NetworkRest,
      'recording_stop',
      'Trying to stop recording',
    );
    fetch(`${$config.BACKEND_ENDPOINT}/v1/recording/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: store.token ? `Bearer ${store.token}` : '',
      },
      body: JSON.stringify({
        passphrase: roomId.host,
        mode: 'web',
      }),
    })
      .then(res => {
        setInProgress(false);
        if (res.status === 200) {
          logger.debug(
            LogSource.NetworkRest,
            'recording_stop',
            'stop recording successfull',
            res,
          );
          /**
           * 1. Once the backend sucessfuly stops recording, send message
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
        } else if (res.status === 500) {
          logger.error(
            LogSource.NetworkRest,
            'recording_stop',
            'Error while stopping recording',
            res,
          );
          showErrorToast(headingStopError, subheadingError);
        } else {
          logger.error(
            LogSource.NetworkRest,
            'recording_stop',
            'Error while stopping recording',
            res,
          );
          showErrorToast(headingStopError);
        }
      })
      .catch(err => {
        logger.error(
          LogSource.NetworkRest,
          'recording_stop',
          'Error while stopping recording',
          err,
        );
        setInProgress(false);
      });
  }, [
    headingStopError,
    inProgress,
    roomId.host,
    setRecordingActive,
    store.token,
    subheadingError,
  ]);

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
        default:
          break;
      }
    });
    return () => {
      events.off(EventNames.RECORDING_ATTRIBUTE);
    };
  }, [roomId.host, setRecordingActive]);

  const fetchRecordings = useCallback(
    (page: number) => {
      logger.log(
        LogSource.NetworkRest,
        'recordings_get',
        'Trying to fetch recordings',
        {
          passphrase: roomId?.host,
          limit: 10,
          page,
        },
      );
      return fetch(`${$config.BACKEND_ENDPOINT}/v1/recordings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: store.token ? `Bearer ${store.token}` : '',
        },
        // '2b65f378-b048-4d28-9d4c-bd71edab61b7'
        body: JSON.stringify({
          passphrase: roomId?.host,
          limit: 10,
          page,
        }),
      }).then(async response => {
        const data = await response.json();
        if (response.ok) {
          logger.log(
            LogSource.NetworkRest,
            'recordings_get',
            'fetch recordings successfull',
            data,
          );
          if (data) {
            return data;
          } else {
            return Promise.reject(
              new Error(
                `No recordings found for meeting Id: "${roomId?.host}"`,
              ),
            );
          }
        } else {
          const error = {
            message: data?.error?.message,
          };
          logger.error(
            LogSource.NetworkRest,
            'recordings_get',
            'Error while fetching recording',
            error,
          );
          return Promise.reject(error);
        }
      });
    },
    [roomId?.host, store.token],
  );

  return (
    <RecordingContext.Provider
      value={{
        inProgress,
        startRecording,
        stopRecording,
        isRecordingActive,
        fetchRecordings,
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
