/*
********************************************
 Copyright © 2022 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.
 Use without a license or in violation of any license terms and conditions (including use for
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more
 information visit https://appbuilder.agora.io.
*********************************************
*/
import React, {useContext, useEffect, useRef, useState} from 'react';
import {DispatchContext, PropsContext, UidType} from '../../../agora-rn-uikit';
import {ScreenshareContext, ScreenshareStopOrigin} from './useScreenshare';
import {
  getGridLayoutName,
  getPinnedLayoutName,
  useChangeDefaultLayout,
  useSetPinnedLayout,
} from '../../pages/video-call/DefaultLayouts';
import {useScreenContext} from '../../components/contexts/ScreenShareContext';
import events, {PersistanceLevel} from '../../rtm-events-api';
import {EventActions, EventNames} from '../../rtm-events';
import {IAgoraRTC} from 'agora-rtc-sdk-ng';
import useRecordingLayoutQuery from '../recording/useRecordingLayoutQuery';
import {timeNow} from '../../rtm/utils';
import {
  controlMessageEnum,
  useLayout,
  useContent,
  useRtc,
} from 'customization-api';
import {filterObject} from '../../utils';
import Toast from '../../../react-native-toast-message';
import {useString} from '../../utils/useString';
import {
  videoRoomScreenShareErrorToastHeading,
  videoRoomScreenShareErrorToastSubHeading,
} from '../../language/default-labels/videoCallScreenLabels';
import {LogSource, logger} from '../../logger/AppBuilderLogger';
import getUniqueID from '../../utils/getUniqueID';
import {
  getScreenshareSessionId,
  getScreenshareError,
  isUserCancelOrPermissionDenied,
  SCREENSHARE_JOURNEY,
} from './screenshareJourney';

type ScreenshareAction = 'start' | 'stop';

export const ScreenshareContextConsumer = ScreenshareContext.Consumer;

export const ScreenshareConfigure = (props: {
  children: React.ReactNode;
  isRecordingActive: boolean;
}) => {
  const toastHeading = useString(videoRoomScreenShareErrorToastHeading)();
  const toastSubHeading = useString(videoRoomScreenShareErrorToastSubHeading)();
  const [isScreenshareActive, setScreenshareActive] = useState(false);
  const activeScreenshareSessionIdRef = useRef<string | null>(null);
  const stopScreenshareRef = useRef<
    (
      origin?: ScreenshareStopOrigin,
      stopActorUid?: UidType,
    ) => Promise<void> | void
  >(() => {});
  const {dispatch} = useContext(DispatchContext);
  const rtc = useRtc();
  const {defaultContent, activeUids, pinnedUid, secondaryPinnedUid} =
    useContent();
  const isPinned = useRef(0);
  const {setScreenShareData, screenShareData} = useScreenContext();
  const setPinnedLayout = useSetPinnedLayout();
  const changeLayout = useChangeDefaultLayout();
  const {currentLayout} = useLayout();
  const currentLayoutRef = useRef({currentLayout: currentLayout});

  const {executeNormalQuery, executePresenterQuery} = useRecordingLayoutQuery();

  const {channel, appId, screenShareUid, screenShareToken, encryption} =
    useContext(PropsContext).rtcProps;

  const defaultContentRef = useRef({defaultContent: defaultContent});
  const pinnedUidRef = useRef({pinnedUid: pinnedUid});
  const secondaryPinnedUidRef = useRef({
    secondaryPinnedUid: secondaryPinnedUid,
  });

  useEffect(() => {
    pinnedUidRef.current.pinnedUid = pinnedUid;
  }, [pinnedUid]);

  useEffect(() => {
    secondaryPinnedUidRef.current.secondaryPinnedUid = secondaryPinnedUid;
  }, [secondaryPinnedUid]);

  useEffect(() => {
    defaultContentRef.current.defaultContent = defaultContent;
  }, [defaultContent]);

  useEffect(() => {
    currentLayoutRef.current.currentLayout = currentLayout;
  }, [currentLayout]);

  /**
   * Event api callback trigger even before screenshare data available in the RTC layer.
   * so instead of calling triggerChangeLayout from the event api call back
   * listening for rtc layout lastJoinedUid data and if its screenshare then call triggerChangeLayout
   * lastJoinedUid will be coming from the user joined event
   * cross check lastJoinedUid data with renderlist
   */

  useEffect(() => {
    const data = filterObject(screenShareData, ([k, v]) => v?.isActive);
    if (data) {
      const recentScreenshare = Object.keys(data)
        .map(i => parseInt(i))
        .sort((a, b) => {
          return data[a].ts - data[b].ts;
        });
      if (recentScreenshare?.length) {
        recentScreenshare.reverse();
        if (
          isPinned.current !== recentScreenshare[0] &&
          activeUids.indexOf(recentScreenshare[0]) !== -1
        ) {
          triggerChangeLayout(
            true,
            recentScreenshare[0],
            defaultContentRef.current.defaultContent[recentScreenshare[0]]
              ?.parentUid,
          );
        }
      }
    }
  }, [activeUids, screenShareData]);

  const triggerChangeLayout = (
    pinned: boolean,
    screenShareUid?: UidType,
    parentUid?: UidType,
  ) => {
    let layout = currentLayoutRef.current.currentLayout;
    //screenshare is started set the layout to Pinned View
    if (pinned && screenShareUid) {
      isPinned.current = screenShareUid;
      dispatch({
        type: 'UserPin',
        value: [screenShareUid],
      });
      if (parentUid && !secondaryPinnedUidRef.current.secondaryPinnedUid) {
        dispatch({
          type: 'UserSecondaryPin',
          value: [parentUid],
        });
      } else if (
        parentUid &&
        secondaryPinnedUidRef.current.secondaryPinnedUid
      ) {
        dispatch({
          type: 'ActiveSpeaker',
          value: [parentUid],
        });
      }
      layout !== getPinnedLayoutName() && setPinnedLayout();
    } else {
      isPinned.current = 0;
      //screenshare is stopped set the layout Grid View
      layout !== getGridLayoutName() && changeLayout();
    }
  };

  useEffect(() => {
    const unsubKickScreenshare = events.on(
      controlMessageEnum.kickScreenshare,
      data => {
        //if screenscreen already active. then below method will stop the screen share
        stopScreenshareRef.current('remote_host_removal', data?.sender);
      },
    );
    const unsubScreenshareAttribute = events.on(
      EventNames.SCREENSHARE_ATTRIBUTE,
      data => {
        const payload = JSON.parse(data.payload);
        const action = payload.action;
        const value = payload.value;

        if (data?.sender) {
          let screenUidOfUser =
            defaultContentRef.current.defaultContent[data?.sender]?.screenUid;
          if (!screenUidOfUser) {
            screenUidOfUser = payload?.screenUidOfUser;
          }
          if (screenUidOfUser) {
            switch (action) {
              case EventActions.SCREENSHARE_STARTED:
                setScreenShareData(prevState => {
                  return {
                    ...prevState,
                    [screenUidOfUser]: {
                      name: defaultContentRef.current.defaultContent[
                        screenUidOfUser
                      ]?.name,
                      isActive: true,
                      ts: value || 0,
                    },
                  };
                });
                break;
              case EventActions.SCREENSHARE_STOPPED:
                setScreenShareData(prevState => {
                  return {
                    ...prevState,
                    [screenUidOfUser]: {
                      name: defaultContentRef.current.defaultContent[
                        screenUidOfUser
                      ]?.name,
                      isActive: false,
                      ts: value || 0,
                    },
                  };
                });
                //if remote user started/stopped the screenshare then change the layout to pinned/grid
                //if user pinned somebody then don't triggerlayout change
                if (!pinnedUidRef.current.pinnedUid) {
                  triggerChangeLayout(false);
                }
                if (screenUidOfUser === pinnedUidRef.current.pinnedUid) {
                  triggerChangeLayout(false);
                  dispatch({
                    type: 'UserPin',
                    value: [0],
                  });
                }
                break;
              default:
                break;
            }
          }
        }
      },
    );

    return () => {
      unsubKickScreenshare();
      unsubScreenshareAttribute();
    };
  }, []);

  const ScreenshareStoppedCallback = (
    stopOrigin: ScreenshareStopOrigin = 'unknown',
    screenshareAttemptId = getUniqueID(),
    screenshareSessionId = activeScreenshareSessionIdRef.current ||
      'unknown-session',
    stopActorUid?: UidType,
  ) => {
    const callbackStartedAt = Date.now();
    logger.log(
      LogSource.Internals,
      'SCREENSHARE',
      `${SCREENSHARE_JOURNEY} screen share stop callback received from RTC engine`,
      {
        action: 'stop',
        stage: 'stop_callback',
        outcome: 'started',
        screenshareAttemptId,
        screenshareSessionId,
        recordingActive: props.isRecordingActive,
        screenShareUid,
        stopOrigin,
        stopActorUid,
      },
    );
    setScreenshareActive(false);
    logger.log(
      LogSource.Internals,
      'SCREENSHARE',
      `${SCREENSHARE_JOURNEY} screen share stop local active state set to inactive`,
      {
        action: 'stop',
        stage: 'local_active_state',
        outcome: 'success',
        screenshareAttemptId,
        screenshareSessionId,
        recordingActive: props.isRecordingActive,
        screenShareUid,
        stopOrigin,
        stopActorUid,
      },
    );
    events.send(
      EventNames.SCREENSHARE_ATTRIBUTE,
      JSON.stringify({
        action: EventActions.SCREENSHARE_STOPPED,
        value: 0,
      }),
      PersistanceLevel.Sender,
    );
    logger.log(
      LogSource.Internals,
      'SCREENSHARE',
      `${SCREENSHARE_JOURNEY} screen share stop RTM event sent to remote users`,
      {
        action: 'stop',
        stage: 'rtm_event',
        outcome: 'success',
        screenshareAttemptId,
        screenshareSessionId,
        recordingActive: props.isRecordingActive,
        screenShareUid,
        stopOrigin,
        stopActorUid,
      },
    );
    setScreenShareData(prevState => {
      return {
        ...prevState,
        [screenShareUid]: {
          ...prevState[screenShareUid],
          isActive: false,
          ts: 0,
        },
      };
    });
    logger.log(
      LogSource.Internals,
      'SCREENSHARE',
      `${SCREENSHARE_JOURNEY} screen share stop local context set to inactive`,
      {
        action: 'stop',
        stage: 'screenshare_context',
        outcome: 'success',
        screenshareAttemptId,
        screenshareSessionId,
        recordingActive: props.isRecordingActive,
        screenShareUid,
        stopOrigin,
        stopActorUid,
      },
    );
    //if local user stopped the screenshare then change layout to grid
    //if user pinned somebody then don't triggerlayout change
    if (!pinnedUidRef.current.pinnedUid) {
      triggerChangeLayout(false);
    }
    if (screenShareUid === pinnedUidRef.current.pinnedUid) {
      triggerChangeLayout(false);
      dispatch({
        type: 'UserPin',
        value: [0],
      });
    }
    logger.log(
      LogSource.Internals,
      'SCREENSHARE',
      `${SCREENSHARE_JOURNEY} screen share stop layout update completed when applicable`,
      {
        action: 'stop',
        stage: 'layout_update',
        outcome: 'success',
        screenshareAttemptId,
        screenshareSessionId,
        recordingActive: props.isRecordingActive,
        screenShareUid,
        stopOrigin,
        stopActorUid,
      },
    );
    logger.log(
      LogSource.Internals,
      'SCREENSHARE',
      `${SCREENSHARE_JOURNEY} screen share stop callback handling completed`,
      {
        action: 'stop',
        stage: 'complete',
        outcome: 'success',
        screenshareAttemptId,
        screenshareSessionId,
        recordingActive: props.isRecordingActive,
        screenShareUid,
        stopOrigin,
        stopActorUid,
        elapsedMs: Date.now() - callbackStartedAt,
      },
    );
    activeScreenshareSessionIdRef.current = null;
  };

  useEffect(() => {
    // @ts-ignore
    rtc.RtcEngineUnsafe.addListener(
      'onScreenshareStopped',
      ScreenshareStoppedCallback,
    );
  }, []);

  const executeRecordingQuery = async (
    isScreenActive: boolean,
    screenshareAttemptId: string,
    screenshareSessionId: string,
    stopOrigin: ScreenshareStopOrigin,
    stopActorUid?: UidType,
  ) => {
    const action: ScreenshareAction = isScreenActive ? 'start' : 'stop';
    if (isScreenActive) {
      // If recording is going on, set the presenter query
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} screen share start recording presenter layout query started`,
        {
          action,
          stage: 'recording_layout',
          outcome: 'started',
          screenshareAttemptId,
          screenshareSessionId,
          recordingActive: props.isRecordingActive,
          screenShareUid,
          stopOrigin,
          stopActorUid,
        },
      );
      await executePresenterQuery(screenShareUid);
    } else {
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} screen share stop recording normal layout query started`,
        {
          action,
          stage: 'recording_layout',
          outcome: 'started',
          screenshareAttemptId,
          screenshareSessionId,
          recordingActive: props.isRecordingActive,
          screenShareUid,
          stopOrigin,
          stopActorUid,
        },
      );
      // If no recording is going on, set the normal query
      await executeNormalQuery();
    }
    logger.log(
      LogSource.Internals,
      'SCREENSHARE',
      `${SCREENSHARE_JOURNEY} screen share ${action} recording layout query completed successfully`,
      {
        action,
        stage: 'recording_layout',
        outcome: 'success',
        screenshareAttemptId,
        screenshareSessionId,
        recordingActive: props.isRecordingActive,
        screenShareUid,
        stopOrigin,
        stopActorUid,
      },
    );
  };

  const stopScreenshare = async (
    stopOrigin: ScreenshareStopOrigin = 'unknown',
    stopActorUid?: UidType,
  ) => {
    const screenshareAttemptId = getUniqueID();
    const screenshareSessionId = getScreenshareSessionId(
      'stop',
      activeScreenshareSessionIdRef.current,
      getUniqueID,
    );
    logger.log(
      LogSource.Internals,
      'SCREENSHARE',
      `${SCREENSHARE_JOURNEY} screen share stop requested from ${stopOrigin}`,
      {
        action: 'stop',
        stage: 'ui_request',
        outcome: 'started',
        screenshareAttemptId,
        screenshareSessionId,
        recordingActive: props.isRecordingActive,
        screenShareUid,
        stopOrigin,
        stopActorUid,
      },
    );
    if (!isScreenshareActive) {
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} screen share stop skipped because screen share is already inactive`,
        {
          action: 'stop',
          stage: 'precondition',
          outcome: 'skipped',
          screenshareAttemptId,
          screenshareSessionId,
          recordingActive: props.isRecordingActive,
          screenShareUid,
          stopOrigin,
          stopActorUid,
        },
      );
      return;
    }
    await userScreenshare(
      false,
      screenshareAttemptId,
      screenshareSessionId,
      stopOrigin,
      stopActorUid,
    );
  };
  const startScreenshare = async () => {
    const screenshareAttemptId = getUniqueID();
    const screenshareSessionId = getScreenshareSessionId(
      'start',
      activeScreenshareSessionIdRef.current,
      getUniqueID,
    );
    logger.log(
      LogSource.Internals,
      'SCREENSHARE',
      `${SCREENSHARE_JOURNEY} screen share start requested from UI`,
      {
        action: 'start',
        stage: 'ui_request',
        outcome: 'started',
        screenshareAttemptId,
        screenshareSessionId,
        recordingActive: props.isRecordingActive,
        screenShareUid,
        stopOrigin: 'unknown',
      },
    );
    if (isScreenshareActive) {
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} screen share start skipped because screen share is already active`,
        {
          action: 'start',
          stage: 'precondition',
          outcome: 'skipped',
          screenshareAttemptId,
          screenshareSessionId,
          recordingActive: props.isRecordingActive,
          screenShareUid,
          stopOrigin: 'unknown',
        },
      );
      return;
    }
    await userScreenshare(
      true,
      screenshareAttemptId,
      screenshareSessionId,
      'unknown',
    );
  };
  stopScreenshareRef.current = stopScreenshare;

  const userScreenshare = async (
    isActive: boolean,
    screenshareAttemptId: string,
    screenshareSessionId: string,
    stopOrigin: ScreenshareStopOrigin,
    stopActorUid?: UidType,
  ) => {
    const startedAt = Date.now();
    const action: ScreenshareAction = isActive ? 'start' : 'stop';
    let stage = 'recording_layout';
    let recordingLayoutFailed = false;
    logger.log(
      LogSource.Internals,
      'SCREENSHARE',
      `${SCREENSHARE_JOURNEY} screen share ${action} workflow started`,
      {
        action,
        stage: 'journey',
        outcome: 'started',
        screenshareAttemptId,
        screenshareSessionId,
        recordingActive: props.isRecordingActive,
        screenShareUid,
        stopOrigin,
        stopActorUid,
        channel,
      },
    );
    try {
      if (props.isRecordingActive) {
        try {
          await executeRecordingQuery(
            isActive,
            screenshareAttemptId,
            screenshareSessionId,
            stopOrigin,
            stopActorUid,
          );
        } catch (recordingError) {
          recordingLayoutFailed = true;
          logger.error(
            LogSource.Internals,
            'SCREENSHARE',
            `${SCREENSHARE_JOURNEY} screen share ${action} recording layout query failed; continuing screen share ${action}`,
            recordingError,
            {
              action,
              stage,
              outcome: 'partial_failure',
              screenshareAttemptId,
              screenshareSessionId,
              recordingActive: props.isRecordingActive,
              screenShareUid,
              stopOrigin,
              stopActorUid,
              ...getScreenshareError(recordingError),
            },
          );
        }
      } else {
        logger.log(
          LogSource.Internals,
          'SCREENSHARE',
          `${SCREENSHARE_JOURNEY} screen share ${action} recording layout query skipped because recording is inactive`,
          {
            action,
            stage,
            outcome: 'skipped',
            screenshareAttemptId,
            screenshareSessionId,
            recordingActive: false,
            screenShareUid,
            stopOrigin,
            stopActorUid,
          },
        );
      }
      stage = 'rtc_operation';
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} screen share ${action} calling RtcEngine.startScreenshare`,
        {
          action,
          stage,
          outcome: 'started',
          screenshareAttemptId,
          screenshareSessionId,
          recordingActive: props.isRecordingActive,
          screenShareUid,
          stopOrigin,
          stopActorUid,
        },
      );
      // @ts-ignore
      await rtc.RtcEngineUnsafe.startScreenshare(
        screenShareToken,
        channel,
        null,
        screenShareUid,
        appId,
        rtc.RtcEngineUnsafe as unknown as IAgoraRTC,
        encryption as unknown as any,
        {encoderConfig: '1080p_2', optimizationMode: 'detail'},
        'auto',
        {
          action,
          screenshareAttemptId,
          screenshareSessionId,
          recordingActive: props.isRecordingActive,
          screenShareUid,
          stopOrigin,
          stopActorUid,
        },
      );
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} screen share ${action} RtcEngine.startScreenshare completed successfully`,
        {
          action,
          stage,
          outcome: 'success',
          screenshareAttemptId,
          screenshareSessionId,
          recordingActive: props.isRecordingActive,
          screenShareUid,
          stopOrigin,
          stopActorUid,
        },
      );
      isActive && setScreenshareActive(true);

      if (isActive) {
        activeScreenshareSessionIdRef.current = screenshareSessionId;
        stage = 'local_active_state';
        logger.log(
          LogSource.Internals,
          'SCREENSHARE',
          `${SCREENSHARE_JOURNEY} screen share start local active state set to active`,
          {
            action,
            stage,
            outcome: 'success',
            screenshareAttemptId,
            screenshareSessionId,
            recordingActive: props.isRecordingActive,
            screenShareUid,
            stopOrigin,
            stopActorUid,
          },
        );
        // 1. Set local state
        stage = 'screenshare_context';
        setScreenShareData(prevState => {
          return {
            ...prevState,
            [screenShareUid]: {
              name: defaultContentRef.current.defaultContent[screenShareUid]
                ?.name,
              isActive: true,
              ts: timeNow(),
            },
          };
        });
        logger.log(
          LogSource.Internals,
          'SCREENSHARE',
          `${SCREENSHARE_JOURNEY} screen share start local context set to active`,
          {
            action,
            stage,
            outcome: 'success',
            screenshareAttemptId,
            screenshareSessionId,
            recordingActive: props.isRecordingActive,
            screenShareUid,
            stopOrigin,
            stopActorUid,
          },
        );
        // 2. Inform everyone in the channel screenshare is actice
        stage = 'rtm_event';
        events.send(
          EventNames.SCREENSHARE_ATTRIBUTE,
          JSON.stringify({
            action: EventActions.SCREENSHARE_STARTED,
            value: timeNow(),
            screenUidOfUser: screenShareUid,
          }),
          PersistanceLevel.Sender,
        );
        logger.log(
          LogSource.Internals,
          'SCREENSHARE',
          `${SCREENSHARE_JOURNEY} screen share start RTM event sent to remote users`,
          {
            action,
            stage,
            outcome: 'success',
            screenshareAttemptId,
            screenshareSessionId,
            recordingActive: props.isRecordingActive,
            screenShareUid,
            stopOrigin,
            stopActorUid,
          },
        );
      }
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} screen share ${action} workflow ${
          recordingLayoutFailed
            ? 'completed with recording layout failure'
            : 'completed successfully'
        }`,
        {
          action,
          stage: 'complete',
          outcome: recordingLayoutFailed ? 'partial_success' : 'success',
          screenshareAttemptId,
          screenshareSessionId,
          recordingActive: props.isRecordingActive,
          screenShareUid,
          stopOrigin,
          stopActorUid,
          elapsedMs: Date.now() - startedAt,
        },
      );
    } catch (e) {
      const userCancelOrPermissionDenied = isUserCancelOrPermissionDenied(e);
      logger.error(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} screen share ${action} workflow failed at ${stage}: ${
          userCancelOrPermissionDenied
            ? 'user cancelled picker or permission was denied'
            : 'unexpected failure'
        }`,
        {
          action,
          stage,
          outcome: userCancelOrPermissionDenied
            ? 'user_cancel_or_permission_denied'
            : 'failure',
          screenshareAttemptId,
          screenshareSessionId,
          recordingActive: props.isRecordingActive,
          screenShareUid,
          stopOrigin,
          stopActorUid,
          elapsedMs: Date.now() - startedAt,
          ...getScreenshareError(e),
        },
      );
      if (!userCancelOrPermissionDenied) {
        Toast.show({
          leadingIconName: 'alert',
          type: 'error',
          text1: toastHeading,
          text2: toastSubHeading,
          visibilityTime: 1000 * 10,
          primaryBtn: null,
          secondaryBtn: null,
        });
      }
    }
  };

  return (
    <ScreenshareContext.Provider
      value={{
        isScreenshareActive,
        startScreenshare,
        stopScreenshare,
        //@ts-ignore
        ScreenshareStoppedCallback,
      }}>
      {props.children}
    </ScreenshareContext.Provider>
  );
};

export default ScreenshareConfigure;
