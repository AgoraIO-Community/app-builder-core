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
import {
  ScreenshareContext,
  ScreenshareOperationState,
  ScreenshareStopOrigin,
} from './useScreenshare';
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
  getScreenshareSessionBoundaryMessage,
  getScreenshareSessionId,
  getScreenshareError,
  isUserCancelOrPermissionDenied,
  SCREENSHARE_JOURNEY,
} from './screenshareJourney';
import {
  getScreenshareStartDecision,
  getScreenshareStopDecision,
} from './screenshareOperation';
import {createScreenshareRecordingLayoutReconciler} from './screenshareRecordingLayoutReconciler';
import {
  captureScreenshareRecoveryCandidate,
  getScreenshareRecoveryDecision,
  ScreenshareRecoveryCandidate,
} from './screenshareInterruptionRecovery';

type ScreenshareAction = 'start' | 'stop';

export const ScreenshareContextConsumer = ScreenshareContext.Consumer;

export const ScreenshareConfigure = (props: {
  children: React.ReactNode;
  isRecordingActive: boolean;
}) => {
  const toastHeading = useString(videoRoomScreenShareErrorToastHeading)();
  const toastSubHeading = useString(videoRoomScreenShareErrorToastSubHeading)();
  const [isScreenshareActive, setScreenshareActive] = useState(false);
  const [operationState, setOperationState] =
    useState<ScreenshareOperationState>('inactive');
  const operationStateRef = useRef<ScreenshareOperationState>('inactive');
  const activeScreenshareSessionIdRef = useRef<string | null>(null);
  const pendingScreenshareSessionIdRef = useRef<string | null>(null);
  const queuedStopRef = useRef<{
    origin: ScreenshareStopOrigin;
    stopActorUid?: UidType;
  } | null>(null);
  const completedStopSessionIdRef = useRef<string | null>(null);
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
  const recoveryCandidateRef = useRef<ScreenshareRecoveryCandidate | null>(
    null,
  );
  const previousLayoutStateRef = useRef({
    activeUids,
    pinnedUid,
    currentLayout,
  });

  const updateOperationState = (state: ScreenshareOperationState) => {
    operationStateRef.current = state;
    setOperationState(state);
  };

  const {executeNormalQuery, executePresenterQuery} = useRecordingLayoutQuery();
  const recordingActiveRef = useRef(props.isRecordingActive);
  const executePresenterQueryRef = useRef(executePresenterQuery);
  const recordingLayoutReconcilerRef = useRef(
    createScreenshareRecordingLayoutReconciler(),
  );
  recordingActiveRef.current = props.isRecordingActive;
  executePresenterQueryRef.current = executePresenterQuery;

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
    const previousLayoutState = previousLayoutStateRef.current;
    const existingCandidate = recoveryCandidateRef.current;
    // Detect when the previously pinned screen-share UID disappears from the
    // RTC render list while RTM still says the logical share is active.
    const capturedCandidate = captureScreenshareRecoveryCandidate({
      previousActiveUids: previousLayoutState.activeUids,
      currentActiveUids: activeUids,
      previousPinnedUid: previousLayoutState.pinnedUid,
      previousLayout: previousLayoutState.currentLayout,
      screenShareData,
      detectedAt: Date.now(),
    });

    if (!existingCandidate && capturedCandidate) {
      recoveryCandidateRef.current = capturedCandidate;
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} pinned screen share removed by RTC; waiting for same UID to recover`,
        {
          action: 'recover',
          stage: 'rtc_interruption',
          outcome: 'started',
          screenshareSessionId:
            activeScreenshareSessionIdRef.current || 'unknown-session',
          screenShareUid: capturedCandidate.uid,
          previousPinnedUid: capturedCandidate.previousPinnedUid,
          previousLayout: capturedCandidate.previousLayout,
        },
      );
    }

    const candidate = recoveryCandidateRef.current;
    if (candidate) {
      // Recovery is driven by render state: first wait for the same UID to
      // rejoin, then wait for its video to be published before restoring it.
      const decision = getScreenshareRecoveryDecision({
        candidate,
        activeUids,
        pinnedUid,
        isVideoPublished: defaultContent?.[candidate.uid]?.video === 1,
        screenShareData,
      });

      if (decision === 'waiting_for_video' && !candidate.joinedLogged) {
        // The RTC user is back, but restoring now could show a blank tile.
        candidate.joinedLogged = true;
        logger.log(
          LogSource.Internals,
          'SCREENSHARE',
          `${SCREENSHARE_JOURNEY} interrupted screen share UID rejoined; waiting for video publication`,
          {
            action: 'recover',
            stage: 'rtc_rejoin',
            outcome: 'waiting',
            screenshareSessionId:
              activeScreenshareSessionIdRef.current || 'unknown-session',
            screenShareUid: candidate.uid,
            elapsedMs: Date.now() - candidate.detectedAt,
          },
        );
      } else if (decision === 'restore') {
        // Restore only the layout state that existed before interruption. A
        // newer user pin or screen-share session cancels this path below.
        isPinned.current = candidate.uid;
        dispatch({type: 'UserPin', value: [candidate.uid]});
        if (
          candidate.previousLayout === getPinnedLayoutName() &&
          currentLayout !== getPinnedLayoutName()
        ) {
          setPinnedLayout();
        }
        recoveryCandidateRef.current = null;
        logger.log(
          LogSource.Internals,
          'SCREENSHARE',
          `${SCREENSHARE_JOURNEY} interrupted screen share video republished; previous pin restored`,
          {
            action: 'recover',
            stage: 'layout_restore',
            outcome: 'success',
            screenshareSessionId:
              activeScreenshareSessionIdRef.current || 'unknown-session',
            screenShareUid: candidate.uid,
            restoredPinnedUid: candidate.previousPinnedUid,
            restoredLayout: candidate.previousLayout,
            elapsedMs: Date.now() - candidate.detectedAt,
          },
        );
      } else if (decision.startsWith('cancel_')) {
        // An authoritative stop, replacement share, or user layout choice
        // takes precedence over automatic interruption recovery.
        recoveryCandidateRef.current = null;
        logger.log(
          LogSource.Internals,
          'SCREENSHARE',
          `${SCREENSHARE_JOURNEY} interrupted screen share pin restoration skipped`,
          {
            action: 'recover',
            stage: 'layout_restore',
            outcome: 'skipped',
            screenshareSessionId:
              activeScreenshareSessionIdRef.current || 'unknown-session',
            screenShareUid: candidate.uid,
            skipReason: decision,
            currentPinnedUid: pinnedUid,
            currentLayout,
            elapsedMs: Date.now() - candidate.detectedAt,
          },
        );
      }
    }

    previousLayoutStateRef.current = {
      activeUids,
      pinnedUid,
      currentLayout,
    };
  }, [
    activeUids,
    currentLayout,
    defaultContent,
    dispatch,
    pinnedUid,
    screenShareData,
    setPinnedLayout,
  ]);

  useEffect(
    () => () => {
      recoveryCandidateRef.current = null;
    },
    [],
  );

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

  const ScreenshareStoppedCallback = async (
    stopOrigin: ScreenshareStopOrigin = 'unknown',
    screenshareAttemptId = getUniqueID(),
    screenshareSessionId = activeScreenshareSessionIdRef.current ||
      'unknown-session',
    stopActorUid?: UidType,
  ) => {
    const callbackStartedAt = Date.now();
    if (completedStopSessionIdRef.current === screenshareSessionId) {
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} screen share stop callback ignored because the session cleanup already completed`,
        {
          action: 'stop',
          stage: 'stop_callback',
          outcome: 'skipped',
          screenshareAttemptId,
          screenshareSessionId,
          recordingActive: props.isRecordingActive,
          screenShareUid,
          stopOrigin,
          stopActorUid,
          operationState: operationStateRef.current,
          duplicateReason: 'session_cleanup_already_completed',
        },
      );
      return;
    }
    completedStopSessionIdRef.current = screenshareSessionId;
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
    updateOperationState('inactive');
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
    const rtmEventSent = await events.send(
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
      `${SCREENSHARE_JOURNEY} screen share stop RTM event ${
        rtmEventSent ? 'sent to remote users' : 'failed to send to remote users'
      }`,
      {
        action: 'stop',
        stage: 'rtm_event',
        outcome: rtmEventSent ? 'success' : 'failure',
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
    pendingScreenshareSessionIdRef.current = null;
    queuedStopRef.current = null;
  };

  useEffect(() => {
    // @ts-ignore
    rtc.RtcEngineUnsafe.addListener(
      'onScreenshareStopped',
      ScreenshareStoppedCallback,
    );
  }, []);

  const executeStartRecordingLayoutQuery = async (
    screenshareAttemptId: string,
    screenshareSessionId: string,
    stopOrigin: ScreenshareStopOrigin,
    stopActorUid?: UidType,
  ) => {
    logger.log(
      LogSource.Internals,
      'SCREENSHARE',
      `${SCREENSHARE_JOURNEY} screen share start recording presenter layout query started`,
      {
        action: 'start',
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
    recordingLayoutReconcilerRef.current.markApplied(
      screenshareSessionId,
      recordingActiveRef.current,
    );
    logger.log(
      LogSource.Internals,
      'SCREENSHARE',
      `${SCREENSHARE_JOURNEY} screen share start recording layout query completed successfully`,
      {
        action: 'start',
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

  const executeStopRecordingLayoutQuery = async (
    screenshareAttemptId: string,
    screenshareSessionId: string,
    stopOrigin: ScreenshareStopOrigin,
    stopActorUid?: UidType,
  ) => {
    logger.log(
      LogSource.Internals,
      'SCREENSHARE',
      `${SCREENSHARE_JOURNEY} screen share stop recording normal layout query started`,
      {
        action: 'stop',
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
    await executeNormalQuery();
    logger.log(
      LogSource.Internals,
      'SCREENSHARE',
      `${SCREENSHARE_JOURNEY} screen share stop recording layout query completed successfully`,
      {
        action: 'stop',
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

  useEffect(() => {
    const screenshareSessionId = activeScreenshareSessionIdRef.current;
    const reconciliationAttemptId = getUniqueID();
    const logContext = {
      action: 'start' as ScreenshareAction,
      stage: 'recording_layout_reconciliation',
      screenshareAttemptId: reconciliationAttemptId,
      screenshareSessionId: screenshareSessionId || 'unknown-session',
      recordingActive: props.isRecordingActive,
      screenshareActive: isScreenshareActive,
      screenShareUid,
      operationState: operationStateRef.current,
    };

    recordingLayoutReconcilerRef.current
      .reconcile({
        screenshareSessionId,
        isRecordingActive: props.isRecordingActive,
        isScreenshareActive,
        executePresenterQuery: () => {
          logger.log(
            LogSource.Internals,
            'SCREENSHARE',
            `${SCREENSHARE_JOURNEY} screen share recording presenter layout reconciliation started`,
            {
              ...logContext,
              outcome: 'started',
              reconciliationReason:
                'recording_and_published_screenshare_are_active',
            },
          );
          return executePresenterQueryRef.current(screenShareUid);
        },
      })
      .then(result => {
        if (result === 'applied') {
          logger.log(
            LogSource.Internals,
            'SCREENSHARE',
            `${SCREENSHARE_JOURNEY} screen share recording presenter layout reconciliation completed successfully`,
            {
              ...logContext,
              outcome: 'success',
              recordingActiveNow: recordingActiveRef.current,
              activeScreenshareSessionIdNow:
                activeScreenshareSessionIdRef.current,
            },
          );
          return;
        }

        if (result === 'already_applied' || result === 'in_progress') {
          logger.log(
            LogSource.Internals,
            'SCREENSHARE',
            `${SCREENSHARE_JOURNEY} screen share recording presenter layout reconciliation skipped`,
            {
              ...logContext,
              outcome: 'skipped',
              duplicateReason:
                result === 'already_applied'
                  ? 'presenter_layout_already_applied'
                  : 'presenter_layout_query_in_progress',
            },
          );
          return;
        }

        if (
          isScreenshareActive ||
          (props.isRecordingActive && operationStateRef.current === 'starting')
        ) {
          logger.log(
            LogSource.Internals,
            'SCREENSHARE',
            `${SCREENSHARE_JOURNEY} screen share recording presenter layout reconciliation waiting for both states`,
            {
              ...logContext,
              outcome: 'waiting',
              waitingReason: !screenshareSessionId
                ? 'missing_active_screenshare_session'
                : !props.isRecordingActive
                ? 'recording_inactive'
                : 'screenshare_not_published',
            },
          );
        }
      })
      .catch(recordingError => {
        logger.error(
          LogSource.Internals,
          'SCREENSHARE',
          `${SCREENSHARE_JOURNEY} screen share recording presenter layout reconciliation failed; screen share remains active`,
          recordingError,
          {
            ...logContext,
            outcome: 'failure',
            recordingActiveNow: recordingActiveRef.current,
            activeScreenshareSessionIdNow:
              activeScreenshareSessionIdRef.current,
            ...getScreenshareError(recordingError),
          },
        );
      });
  }, [isScreenshareActive, props.isRecordingActive, screenShareUid]);

  const stopScreenshare = async (
    stopOrigin: ScreenshareStopOrigin = 'unknown',
    stopActorUid?: UidType,
  ) => {
    const screenshareAttemptId = getUniqueID();
    const screenshareSessionId =
      activeScreenshareSessionIdRef.current ||
      pendingScreenshareSessionIdRef.current ||
      getScreenshareSessionId('stop', null, getUniqueID);
    const currentOperationState = operationStateRef.current;
    const stopDecision = getScreenshareStopDecision(
      currentOperationState,
      Boolean(queuedStopRef.current),
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
        operationState: currentOperationState,
      },
    );
    if (currentOperationState === 'starting') {
      if (stopDecision === 'skip') {
        logger.log(
          LogSource.Internals,
          'SCREENSHARE',
          `${SCREENSHARE_JOURNEY} screen share stop skipped because a stop is already queued while start is pending`,
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
            operationState: currentOperationState,
            duplicateReason: 'stop_already_queued',
          },
        );
        return;
      }
      queuedStopRef.current = {origin: stopOrigin, stopActorUid};
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} screen share stop queued until the pending start finishes`,
        {
          action: 'stop',
          stage: 'precondition',
          outcome: 'queued',
          screenshareAttemptId,
          screenshareSessionId,
          recordingActive: props.isRecordingActive,
          screenShareUid,
          stopOrigin,
          stopActorUid,
          operationState: currentOperationState,
          queuedStop: true,
        },
      );
      return;
    }
    if (currentOperationState === 'inactive') {
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
          operationState: currentOperationState,
          duplicateReason: 'already_inactive',
        },
      );
      return;
    }
    if (stopDecision === 'skip') {
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} screen share stop skipped because stop is already in progress`,
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
          operationState: currentOperationState,
          duplicateReason: 'already_stopping',
        },
      );
      return;
    }
    updateOperationState('stopping');
    // Run only the stop workflow. RTC cleanup will invoke
    // ScreenshareStoppedCallback to update local, RTM, and layout state.
    const stopped = await executeStopScreenshareWorkflow(
      screenshareAttemptId,
      screenshareSessionId,
      stopOrigin,
      stopActorUid,
    );
    if (stopped) {
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        getScreenshareSessionBoundaryMessage('end', screenshareSessionId),
        {
          action: 'stop',
          stage: 'session_boundary',
          outcome: 'ended',
          screenshareAttemptId,
          screenshareSessionId,
          recordingActive: props.isRecordingActive,
          screenShareUid,
          stopOrigin,
          stopActorUid,
          operationState: operationStateRef.current,
        },
      );
    } else if (operationStateRef.current === 'stopping') {
      updateOperationState('active');
    }
  };
  const startScreenshare = async () => {
    const screenshareAttemptId = getUniqueID();
    const currentOperationState = operationStateRef.current;
    const startDecision = getScreenshareStartDecision(currentOperationState);
    const screenshareSessionId =
      pendingScreenshareSessionIdRef.current ||
      activeScreenshareSessionIdRef.current ||
      getScreenshareSessionId('start', null, getUniqueID);
    const logStartRequested = () =>
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
          operationState: currentOperationState,
        },
      );
    if (startDecision === 'skip') {
      logStartRequested();
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} screen share start skipped because screen share is ${currentOperationState}`,
        {
          action: 'start',
          stage: 'precondition',
          outcome: 'skipped',
          screenshareAttemptId,
          screenshareSessionId,
          recordingActive: props.isRecordingActive,
          screenShareUid,
          stopOrigin: 'unknown',
          operationState: currentOperationState,
          duplicateReason: `start_requested_while_${currentOperationState}`,
        },
      );
      return;
    }
    pendingScreenshareSessionIdRef.current = screenshareSessionId;
    completedStopSessionIdRef.current = null;
    updateOperationState('starting');
    logger.log(
      LogSource.Internals,
      'SCREENSHARE',
      getScreenshareSessionBoundaryMessage('start', screenshareSessionId),
      {
        action: 'start',
        stage: 'session_boundary',
        outcome: 'started',
        screenshareAttemptId,
        screenshareSessionId,
        recordingActive: props.isRecordingActive,
        screenShareUid,
        stopOrigin: 'unknown',
        operationState: operationStateRef.current,
      },
    );
    logStartRequested();
    // Run only the start workflow. Stop requests received while this is
    // pending are queued above and executed after startup completes.
    const started = await executeStartScreenshareWorkflow(
      screenshareAttemptId,
      screenshareSessionId,
      'unknown',
    );
    const queuedStop = queuedStopRef.current;
    queuedStopRef.current = null;
    if (started && queuedStop) {
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} screen share executing the stop queued during start`,
        {
          action: 'stop',
          stage: 'precondition',
          outcome: 'started',
          screenshareAttemptId: getUniqueID(),
          screenshareSessionId,
          recordingActive: props.isRecordingActive,
          screenShareUid,
          stopOrigin: queuedStop.origin,
          stopActorUid: queuedStop.stopActorUid,
          operationState: operationStateRef.current,
          queuedStop: true,
        },
      );
      await stopScreenshare(queuedStop.origin, queuedStop.stopActorUid);
    } else if (!started && queuedStop) {
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} screen share discarded the queued stop because start failed`,
        {
          action: 'stop',
          stage: 'precondition',
          outcome: 'skipped',
          screenshareAttemptId: getUniqueID(),
          screenshareSessionId,
          recordingActive: props.isRecordingActive,
          screenShareUid,
          stopOrigin: queuedStop.origin,
          stopActorUid: queuedStop.stopActorUid,
          operationState: operationStateRef.current,
          queuedStop: false,
          duplicateReason: 'start_failed',
        },
      );
    }
  };
  stopScreenshareRef.current = stopScreenshare;

  const executeStartScreenshareWorkflow = async (
    screenshareAttemptId: string,
    screenshareSessionId: string,
    stopOrigin: ScreenshareStopOrigin,
    stopActorUid?: UidType,
  ) => {
    const startedAt = Date.now();
    let stage = 'recording_layout';
    let recordingLayoutFailed = false;
    let rtcOperationSucceeded = false;
    logger.log(
      LogSource.Internals,
      'SCREENSHARE',
      `${SCREENSHARE_JOURNEY} screen share start workflow started`,
      {
        action: 'start',
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
          await executeStartRecordingLayoutQuery(
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
            `${SCREENSHARE_JOURNEY} screen share start recording layout query failed; continuing screen share start`,
            recordingError,
            {
              action: 'start',
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
          `${SCREENSHARE_JOURNEY} screen share start recording layout query skipped because recording is inactive`,
          {
            action: 'start',
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
        `${SCREENSHARE_JOURNEY} screen share start calling RtcEngine.startScreenshare`,
        {
          action: 'start',
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
      // The RTC start API only creates, joins, and publishes screen tracks.
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
          screenshareAttemptId,
          screenshareSessionId,
          recordingActive: props.isRecordingActive,
          screenShareUid,
          stopOrigin,
          stopActorUid,
        },
      );
      rtcOperationSucceeded = true;
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} screen share start RtcEngine.startScreenshare completed successfully`,
        {
          action: 'start',
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

      activeScreenshareSessionIdRef.current = screenshareSessionId;
      pendingScreenshareSessionIdRef.current = null;
      updateOperationState('active');
      setScreenshareActive(true);
      stage = 'local_active_state';
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} screen share start local active state set to active`,
        {
          action: 'start',
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
          action: 'start',
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
      stage = 'rtm_event';
      const rtmEventSent = await events.send(
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
        `${SCREENSHARE_JOURNEY} screen share start RTM event ${
          rtmEventSent
            ? 'sent to remote users'
            : 'failed to send to remote users'
        }`,
        {
          action: 'start',
          stage,
          outcome: rtmEventSent ? 'success' : 'failure',
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
        `${SCREENSHARE_JOURNEY} screen share start workflow ${
          recordingLayoutFailed
            ? 'completed with recording layout failure'
            : 'completed successfully'
        }`,
        {
          action: 'start',
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
      return true;
    } catch (e) {
      const userCancelOrPermissionDenied = isUserCancelOrPermissionDenied(e);
      logger.error(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} screen share start workflow failed at ${stage}: ${
          userCancelOrPermissionDenied
            ? 'user cancelled picker or permission was denied'
            : 'unexpected failure'
        }`,
        {
          action: 'start',
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
      Toast.show({
        leadingIconName: 'alert',
        type: 'error',
        text1: toastHeading,
        text2: toastSubHeading,
        visibilityTime: 1000 * 10,
        primaryBtn: null,
        secondaryBtn: null,
      });
      if (!rtcOperationSucceeded) {
        pendingScreenshareSessionIdRef.current = null;
        activeScreenshareSessionIdRef.current = null;
        setScreenshareActive(false);
        updateOperationState('inactive');
        logger.log(
          LogSource.Internals,
          'SCREENSHARE',
          getScreenshareSessionBoundaryMessage('end', screenshareSessionId),
          {
            action: 'start',
            stage: 'session_boundary',
            outcome: 'ended_with_start_failure',
            screenshareAttemptId,
            screenshareSessionId,
            recordingActive: props.isRecordingActive,
            screenShareUid,
            stopOrigin,
            stopActorUid,
            operationState: operationStateRef.current,
          },
        );
      }
      return rtcOperationSucceeded;
    }
  };

  const executeStopScreenshareWorkflow = async (
    screenshareAttemptId: string,
    screenshareSessionId: string,
    stopOrigin: ScreenshareStopOrigin,
    stopActorUid?: UidType,
  ) => {
    const startedAt = Date.now();
    let stage = 'recording_layout';
    let recordingLayoutFailed = false;
    let rtcOperationSucceeded = false;
    logger.log(
      LogSource.Internals,
      'SCREENSHARE',
      `${SCREENSHARE_JOURNEY} screen share stop workflow started`,
      {
        action: 'stop',
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
          await executeStopRecordingLayoutQuery(
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
            `${SCREENSHARE_JOURNEY} screen share stop recording layout query failed; continuing screen share stop`,
            recordingError,
            {
              action: 'stop',
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
          `${SCREENSHARE_JOURNEY} screen share stop recording layout query skipped because recording is inactive`,
          {
            action: 'stop',
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
        `${SCREENSHARE_JOURNEY} screen share stop calling RtcEngine.stopScreenshare`,
        {
          action: 'stop',
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
      // The RTC stop API performs idempotent track/client cleanup and then
      // invokes ScreenshareStoppedCallback for application-state cleanup.
      await rtc.RtcEngineUnsafe.stopScreenshare({
        screenshareAttemptId,
        screenshareSessionId,
        recordingActive: props.isRecordingActive,
        screenShareUid,
        stopOrigin,
        stopActorUid,
      });
      rtcOperationSucceeded = true;
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} screen share stop RtcEngine.stopScreenshare completed successfully`,
        {
          action: 'stop',
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
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} screen share stop workflow ${
          recordingLayoutFailed
            ? 'completed with recording layout failure'
            : 'completed successfully'
        }`,
        {
          action: 'stop',
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
      return true;
    } catch (e) {
      const userCancelOrPermissionDenied = isUserCancelOrPermissionDenied(e);
      logger.error(
        LogSource.Internals,
        'SCREENSHARE',
        `${SCREENSHARE_JOURNEY} screen share stop workflow failed at ${stage}: ${
          userCancelOrPermissionDenied
            ? 'user cancelled picker or permission was denied'
            : 'unexpected failure'
        }`,
        {
          action: 'stop',
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
      Toast.show({
        leadingIconName: 'alert',
        type: 'error',
        text1: toastHeading,
        text2: toastSubHeading,
        visibilityTime: 1000 * 10,
        primaryBtn: null,
        secondaryBtn: null,
      });
      return rtcOperationSucceeded;
    }
  };

  return (
    <ScreenshareContext.Provider
      value={{
        isScreenshareActive,
        operationState,
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
