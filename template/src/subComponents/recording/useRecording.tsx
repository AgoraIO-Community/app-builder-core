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
import {EventNames} from '../../rtm-events';
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
import useRecordingLayoutQuery from './useRecordingLayoutQuery';
import {useScreenContext} from '../../components/contexts/ScreenShareContext';
import {useLiveStreamDataContext} from '../../components/contexts/LiveStreamDataContext';
import {fetchRetry} from '../../utils/fetch-retry';
import {LogSource, logger} from '../../logger/AppBuilderLogger';
import getUniqueID from '../../utils/getUniqueID';

const log = (...args: any[]) => {
  console.log('[Recording_v2:] ', ...args);
};

const RECORDING_BOT_UID = 100000;

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
  stopRecording: async () => {},
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
    setRecordingActive: React.Dispatch<SetStateAction<boolean>>;
    isRecordingActive: boolean;
    callActive: boolean;
  };
}

/**
 * Component to start / stop Agora cloud and web recording.
 * Sends a control message to all users in the channel over RTM to indicate that
 * Cloud recording has started/stopped.
 */
enum RECORDING_REQUEST_STATE {
  PENDING = 'PENDING',
  STARTED_MIX = 'STARTED_MIX',
  STARTED_WEB = 'STARTED_WEB',
  STOPPED = 'STOPPED',
  STOP_FAILED = 'STOP_FAILED',
  FAILED = 'FAILED',
}
const RecordingActions = {
  RECORDING_REQUEST_STATE: RECORDING_REQUEST_STATE,
  REQUEST_TO_STOP_RECORDING: 'REQUEST_TO_STOP_RECORDING',
};

const recordingMode = $config.RECORDING_MODE || 'MIX';

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

const RecordingProvider = (props: RecordingProviderProps) => {
  const {setRecordingActive, isRecordingActive, callActive} = props?.value;
  const {
    data: {isHost, roomId},
  } = useRoomInfo();
  const [inProgress, setInProgress] = useState(false);
  const [uidWhoStarted, setUidWhoStarted] = useState(0);
  const {defaultContent} = useContent();
  const {hostUids, audienceUids} = useLiveStreamDataContext();

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

  const {localUid, hasUserJoinedRTM} = useContext(ChatContext);
  const {store} = React.useContext(StorageContext);

  const {setChatType} = useChatUIControls();
  const {setSidePanel} = useSidePanel();
  const {setIsCaptionON} = useCaption();
  const {executePresenterQuery, executeNormalQuery} = useRecordingLayoutQuery();
  const {screenShareData} = useScreenContext();
  const userCountGotValidEntry = useRef<boolean>(false);
  const {isRecordingBot, recordingBotUIConfig} = useIsRecordingBot();

  useEffect(() => {
    /**
     * The below check makes sure the notification is triggered
     * only once. In native apps, this componenet is mounted everytime
     * when chat icon is toggle, as Controls component is hidden and
     * shown
     */
    if (prevRecordingState) {
      if (prevRecordingState?.isRecordingActive === isRecordingActive) {
        return;
      }

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
  }, [isRecordingActive, callActive, isHost, uidWhoStarted]);

  const startRecording = () => {
    logger.debug(
      LogSource.Internals,
      'RECORDING',
      'start recording method called',
    );
    if (inProgress) {
      logger.error(
        LogSource.Internals,
        'RECORDING',
        'start recording already in progress. Aborting..',
      );
      return;
    }
    logger.debug(
      LogSource.NetworkRest,
      'recording_start',
      'start recording API called',
    );
    const passphrase = roomId.host || '';
    let url = '';
    if (recordingMode === 'WEB') {
      let recordinghostURL = getOriginURL();
      // let recordinghostURL =
      //   'https://app-builder-core-git-hotfix-recording-state-attr-c1a3f2-agoraio.vercel.app';
      if (recordinghostURL.includes('localhost')) {
        console.error(
          'web-recording - Recording url cannot be localhost. It should be a valid deployed URL',
        );
        return;
      }
      recordinghostURL = getFrontendUrl(recordinghostURL);
      url = `${recordinghostURL}/${passphrase}`;
    }
    setInProgress(true);
    events.send(
      EventNames.RECORDING_STATE_ATTRIBUTE,
      JSON.stringify({
        action: RecordingActions.RECORDING_REQUEST_STATE.PENDING,
        value: {uid: `${localUid}`, api: 'START_RECORDING'},
      }),
      PersistanceLevel.Session,
    );
    const startReqTs = Date.now();
    const requestId = getUniqueID();
    logger.debug(
      LogSource.NetworkRest,
      'recording_start',
      'Trying to start recording',
      {
        passphrase: roomId.host,
        url,
        mode: recordingMode,
        startReqTs,
        requestId: requestId,
      },
    );
    fetch(`${$config.BACKEND_ENDPOINT}/v1/recording/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: store.token ? `Bearer ${store.token}` : '',
        'X-Request-Id': requestId,
      },
      body: JSON.stringify({
        passphrase: roomId.host,
        url,
        webpage_ready_timeout: 10,
        encryption: $config.ENCRYPTION_ENABLED,
        mode: recordingMode.toLowerCase(),
      }),
    })
      .then((res: any) => {
        const endRequestTs = Date.now();
        const latency = endRequestTs - startReqTs;
        if (res.status === 200) {
          logger.debug(
            LogSource.NetworkRest,
            'recording_start',
            'start recording successfully',
            {
              responseData: res,
              startReqTs,
              endRequestTs,
              latency,
              requestId,
            },
          );
          // 1. set the local recording state to true to update the UI
          events.send(
            EventNames.RECORDING_STARTED_BY_ATTRIBUTE,
            JSON.stringify({
              action: '',
              value: `${localUid}`,
            }),
            PersistanceLevel.Session,
          );
          setUidWhoStarted(localUid);
          // 2. Check if recording mode is cloud
          if (recordingMode === 'MIX') {
            setInProgress(false);
            setRecordingActive(true);
            events.send(
              EventNames.RECORDING_STATE_ATTRIBUTE,
              JSON.stringify({
                action: RecordingActions.RECORDING_REQUEST_STATE.STARTED_MIX,
                value: `${localUid}`,
              }),
              PersistanceLevel.Session,
            );
            // 3.a  Set the presenter mode if screen share is active
            // 3.b Get the most recent screenshare uid
            const sorted = Object.entries(screenShareData)
              .filter(el => el[1]?.ts && el[1].ts > 0 && el[1]?.isActive)
              .sort((a, b) => b[1].ts - a[1].ts);

            const activeScreenshareUid = sorted.length > 0 ? sorted[0][0] : 0;
            if (activeScreenshareUid) {
              logger.debug(
                LogSource.Internals,
                'RECORDING',
                'screenshare: Executing presenter query for screenuid',
                activeScreenshareUid,
              );
              executePresenterQuery(parseInt(activeScreenshareUid));
            } else {
              executeNormalQuery();
            }
          }
        } else if (res.status === 500) {
          showErrorToast(headingStartError, subheadingError);
          throw Error(`Internal server error ${res.status}`);
        } else {
          showErrorToast(headingStartError);
          throw Error(`Internal server error ${res.status}`);
        }
      })
      .catch(err => {
        const endRequestTs = Date.now();
        const latency = endRequestTs - startReqTs;
        logger.error(
          LogSource.NetworkRest,
          'recording_start',
          'Error while start recording',
          err,
          {startReqTs, endRequestTs, latency, requestId},
        );
        setRecordingActive(false);
        setInProgress(false);
        events.send(
          EventNames.RECORDING_STATE_ATTRIBUTE,
          JSON.stringify({
            action: RecordingActions.RECORDING_REQUEST_STATE.FAILED,
            value: `${localUid}`,
          }),
          PersistanceLevel.Session,
        );
      });
  };

  const _stopRecording = useCallback(
    async (calledBy?: 'user' | 'bot' | 'bot-when-no-host') => {
      /**
       * Any host in the channel can stop recording.
       */
      logger.debug(
        LogSource.Internals,
        'RECORDING',
        '_stopRecording API called',
        {calledBy: calledBy},
      );

      events.send(
        EventNames.RECORDING_STATE_ATTRIBUTE,
        JSON.stringify({
          action: RecordingActions.RECORDING_REQUEST_STATE.PENDING,
          value: {uid: `${localUid}`, api: 'STOP_RECORDING'},
        }),
        PersistanceLevel.Session,
      );
      const requestId = getUniqueID();
      const startReqTs = Date.now();
      logger.log(
        LogSource.NetworkRest,
        'recording_stop',
        '_stopRecording API called',
        {calledBy: calledBy, requestId, startReqTs},
      );
      fetchRetry(`${$config.BACKEND_ENDPOINT}/v1/recording/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: store.token ? `Bearer ${store.token}` : '',
          'X-Request-Id': requestId,
        },
        body: JSON.stringify({
          passphrase: roomId.host,
          mode: recordingMode.toLowerCase(),
        }),
      })
        .then(res => {
          const endReqTs = Date.now();
          setInProgress(false);
          if (res.status === 200 || res.status === 202) {
            logger.debug(
              LogSource.NetworkRest,
              'recording_stop',
              '_stopRecording successfull',
              {
                res,
                startReqTs,
                endReqTs,
                latency: endReqTs - startReqTs,
                requestId,
              },
            );
            /**
             * 1. Once the backend sucessfuly stops recording, send message
             * in the channel indicating that cloud recording is now inactive.
             */
            events.send(
              EventNames.RECORDING_STATE_ATTRIBUTE,
              JSON.stringify({
                action: RecordingActions.RECORDING_REQUEST_STATE.STOPPED,
                value: `${localUid}`,
              }),
              PersistanceLevel.Session,
            );
            // 2. set the local recording state to false to update the UI
            setRecordingActive(false);
          } else if (res.status === 500) {
            showErrorToast(headingStopError, subheadingError);
            throw Error(`Internal server error ${res.status}`);
          } else {
            showErrorToast(headingStopError);
            // return Promise.reject(res);
            throw Error(`Internal server error ${res.status}`);
          }
        })
        .catch(err => {
          const endReqTs = Date.now();
          logger.log(
            LogSource.NetworkRest,
            'recording_stop',
            '_stopRecording Error',
            {
              error: err,
              startReqTs,
              endReqTs,
              latency: endReqTs - startReqTs,
              requestId,
            },
          );
          setInProgress(false);
          events.send(
            EventNames.RECORDING_STATE_ATTRIBUTE,
            JSON.stringify({
              action: RecordingActions.RECORDING_REQUEST_STATE.STOP_FAILED,
              value: `${localUid}`,
            }),
            PersistanceLevel.Session,
          );
        });
    },
    [
      headingStopError,
      roomId.host,
      setRecordingActive,
      store.token,
      subheadingError,
      localUid,
    ],
  );

  const stopRecording = useCallback(() => {
    setInProgress(true);
    if (recordingMode === 'WEB') {
      logger.debug(
        LogSource.Internals,
        'RECORDING',
        'stopRecording function is called',
        {
          recordingBotId: RECORDING_BOT_UID,
          recordingMode: recordingMode,
        },
      );
      //add logger
      logger.debug(
        LogSource.Internals,
        'RECORDING',
        'Stopping recording by sending event to bot',
        RECORDING_BOT_UID,
      );
      // send stop request to bot
      events.send(
        EventNames.RECORDING_STATE_ATTRIBUTE,
        JSON.stringify({
          action: RecordingActions.REQUEST_TO_STOP_RECORDING,
          value: `${localUid}`,
        }),
        PersistanceLevel.None,
        RECORDING_BOT_UID, // bot uid
      );
    } else {
      logger.debug(
        LogSource.Internals,
        'RECORDING',
        'Stopping recording by calling (stopRecording function)',
        recordingMode,
      );
      //add logger - mix mode
      _stopRecording('user');
    }
  }, [_stopRecording, localUid]);

  const fetchRecordings = useCallback(
    (page: number) => {
      const requestId = getUniqueID();
      const startReqTs = Date.now();
      logger.debug(
        LogSource.NetworkRest,
        'recordings_get',
        'Trying to fetch recordings',
        {
          passphrase: roomId?.host,
          limit: 10,
          page,
          requestId,
          startReqTs,
        },
      );
      return fetch(`${$config.BACKEND_ENDPOINT}/v1/recordings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: store.token ? `Bearer ${store.token}` : '',
          'X-Request-Id': requestId,
        },
        body: JSON.stringify({
          passphrase: roomId?.host,
          limit: 10,
          page,
        }),
      }).then(async response => {
        const endReqTs = Date.now();
        const data = await response.json();
        if (response.ok) {
          logger.debug(
            LogSource.NetworkRest,
            'recordings_get',
            'fetch recordings successfull',
            {
              responseData: data,
              startReqTs,
              endReqTs,
              latency: endReqTs - startReqTs,
              requestId,
            },
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
            {
              startReqTs,
              endReqTs,
              latency: endReqTs - startReqTs,
              requestId,
            },
          );
          return Promise.reject(error);
        }
      });
    },
    [roomId?.host, store.token],
  );

  // Events
  useEffect(() => {
    events.on(EventNames.RECORDING_STATE_ATTRIBUTE, data => {
      logger.debug(
        LogSource.Internals,
        'RECORDING',
        'event recording_state attribute received',
        data,
      );
      const payload = JSON.parse(data.payload);
      const action = payload.action;
      switch (action) {
        case RecordingActions.RECORDING_REQUEST_STATE.PENDING:
          logger.debug(
            LogSource.Internals,
            'RECORDING',
            'recording_state -> PENDING',
          );
          setInProgress(true);
          if (isRecordingBot && payload?.value?.api === 'START_RECORDING') {
            logger.debug(
              LogSource.Internals,
              'RECORDING',
              'Recording-bot: sending event recording-started event to users in the call',
            );
            setInProgress(false);
            setRecordingActive(true);
            events.send(
              EventNames.RECORDING_STATE_ATTRIBUTE,
              JSON.stringify({
                action: RecordingActions.RECORDING_REQUEST_STATE.STARTED_WEB,
                value: `${localUid}`,
              }),
              PersistanceLevel.Session,
            );
          }
          break;
        case RecordingActions.RECORDING_REQUEST_STATE.STARTED_MIX:
          logger.debug(
            LogSource.Internals,
            'RECORDING',
            'recording_state -> STARTED_MIX',
          );
          //add logger
          setInProgress(false);
          setRecordingActive(true);
          break;
        case RecordingActions.RECORDING_REQUEST_STATE.STARTED_WEB:
          logger.debug(
            LogSource.Internals,
            'RECORDING',
            'recording_state -> STARTED_WEB',
          );
          //add logger
          setInProgress(false);
          setRecordingActive(true);
          break;
        case RecordingActions.RECORDING_REQUEST_STATE.FAILED:
          logger.debug(
            LogSource.Internals,
            'RECORDING',
            'recording_state -> FAILED',
          );
          //add logger
          setInProgress(false);
          setRecordingActive(false);
          showErrorToast(headingStartError, subheadingError);
          break;
        case RecordingActions.RECORDING_REQUEST_STATE.STOPPED:
          logger.debug(
            LogSource.Internals,
            'RECORDING',
            'recording_state -> STOPPED',
          );
          //add logger
          setInProgress(false);
          setRecordingActive(false);
          break;
        /**
         * The below case is for enable stop button again if stop recording api failed. for remote users
         */
        case RecordingActions.RECORDING_REQUEST_STATE.STOP_FAILED:
          logger.debug(
            LogSource.Internals,
            'RECORDING',
            'recording_state -> STOP_FAILED',
          );
          setInProgress(false);
          setRecordingActive(true);
          break;
        /**
         * The below case is not persisted, hence we need not worry about whether the
         * new user gets the correct state or not
         */
        case RecordingActions.REQUEST_TO_STOP_RECORDING:
          logger.log(
            LogSource.NetworkRest,
            'recording_stop',
            'recording_state -> REQUEST_TO_STOP_RECORDING',
          );
          _stopRecording('bot');
          break;
        default:
          break;
      }
    });
    events.on(EventNames.RECORDING_STARTED_BY_ATTRIBUTE, data => {
      logger.debug(
        LogSource.Internals,
        'RECORDING',
        'event recording_started_by attribute received',
        data,
      );
      const payload = JSON.parse(data.payload);
      const value = payload.value;
      setUidWhoStarted(parseInt(value));
    });
    return () => {
      events.off(EventNames.RECORDING_STATE_ATTRIBUTE);
      events.off(EventNames.RECORDING_STARTED_BY_ATTRIBUTE);
    };
  }, [
    roomId.host,
    setRecordingActive,
    localUid,
    _stopRecording,
    isRecordingBot,
  ]);
  // ************ Recording Bot starts ************

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
     * The below piece of code is executed only for recording bot
     * If all the members have left the call and recording is still active -
     * bot will call the stop recording API
     */
    if (!isRecordingBot) {
      return;
    }
    // Check if user has joined RTM
    if (!hasUserJoinedRTM) {
      return;
    }

    const areUsersInChannel = hostUids.length > 0 || audienceUids.length > 0;
    logger.debug(
      LogSource.Internals,
      'RECORDING',
      'Recording-bot: areUsersInChannel',
      areUsersInChannel,
    );

    // console.log('bot hostUids', hostUids);
    // console.log('bot audienceUids', audienceUids);
    // old code
    // /**
    //  * The below check makes sure we are only looking at hostuids
    //  * It fixes the below issue
    //  * In case of screenshare it so happens sometimes that in
    //  * initial render for the bot - the hostuid contains the uid which is
    //  * actually a screenshare uid. The data is yet not populated whether
    //  * its pure host or screenshare uid
    //  * To only consider uids which are purely host we filter the uids as below
    //  */
    // const areUsersInChannel =
    // areHostsInChannel.length > 0 || audienceUids?.length > 0;

    if (areUsersInChannel) {
      /**
       * If there are users in the call, set the user count as valid and
       * then going forward we can track if the users in the channel are reducing to zero
       */
      if (!userCountGotValidEntry.current) {
        userCountGotValidEntry.current = true;
      }
    }
    const shouldStopRecording =
      !areUsersInChannel && userCountGotValidEntry?.current;

    logger.debug(
      LogSource.Internals,
      'RECORDING',
      'Recording-bot: Checking if bot should stop recording',
      {
        shouldStopRecording: shouldStopRecording,
        areUsersInChannel: areUsersInChannel,
        userCountGotValidEntry: userCountGotValidEntry.current,
      },
    );
    if (shouldStopRecording) {
      logger.debug(
        LogSource.Internals,
        'RECORDING',
        'Recording-bot: will now stop recording',
      );
      _stopRecording();
    }
  }, [
    hasUserJoinedRTM,
    isRecordingBot,
    hostUids,
    audienceUids,
    _stopRecording,
  ]);

  // useEffect(() => { //
  //   if (hasUserJoinedRTM && isRecordingBot) {
  //     log('Recording-bot: sending event that recording has started');
  //     logger.log(
  //       LogSource.Internals,
  //       'RECORDING',
  //       'Recording-bot: sending event recording-started event to users in the call',
  //     );
  //     setInProgress(false);
  //     setRecordingActive(true);
  //     events.send(
  //       EventNames.RECORDING_STATE_ATTRIBUTE,
  //       JSON.stringify({
  //         action: RecordingActions.RECORDING_REQUEST_STATE.STARTED_WEB,
  //         value: `${localUid}`,
  //       }),
  //       PersistanceLevel.Session,
  //     );
  //   }
  // }, [isRecordingBot, hasUserJoinedRTM, localUid, setRecordingActive]);
  // ************ Recording Bot ends ************

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
