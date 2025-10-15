import React, {useEffect, useRef} from 'react';
import events from '../../../rtm-events-api';
import {BreakoutRoomEventNames} from './constants';
import {useBreakoutRoom} from '../context/BreakoutRoomContext';
import {BreakoutRoomSyncStateEventPayload} from '../state/types';
import {useLocalUid} from '../../../../agora-rn-uikit';
import {useRoomInfo} from '../../../components/room-info/useRoomInfo';
import {logger, LogSource} from '../../../logger/AppBuilderLogger';

interface Props {
  children: React.ReactNode;
}

const BreakoutRoomEventsConfigure: React.FC<Props> = ({children}) => {
  const {
    // onMakeMePresenter,
    handleBreakoutRoomSyncState,
    handleHostOperationStart,
    handleHostOperationEnd,
  } = useBreakoutRoom();

  const localUid = useLocalUid();
  const {
    data: {isHost},
  } = useRoomInfo();

  const isHostRef = useRef(isHost);
  const localUidRef = useRef(localUid);
  // const onMakeMePresenterRef = useRef(onMakeMePresenter);
  const handleBreakoutRoomSyncStateRef = useRef(handleBreakoutRoomSyncState);
  const handleHostOperationStartRef = useRef(handleHostOperationStart);
  const handleHostOperationEndRef = useRef(handleHostOperationEnd);

  // keep refs updated
  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);
  useEffect(() => {
    localUidRef.current = localUid;
  }, [localUid]);
  // useEffect(() => {
  //   onMakeMePresenterRef.current = onMakeMePresenter;
  // }, [onMakeMePresenter]);
  useEffect(() => {
    handleBreakoutRoomSyncStateRef.current = handleBreakoutRoomSyncState;
  }, [handleBreakoutRoomSyncState]);
  useEffect(() => {
    handleHostOperationStartRef.current = handleHostOperationStart;
  }, [handleHostOperationStart]);
  useEffect(() => {
    handleHostOperationEndRef.current = handleHostOperationEnd;
  }, [handleHostOperationEnd]);

  useEffect(() => {
    // const handleMakePresenterEvent = (evtData: any) => {
    //   logger.log(
    //     LogSource.Internals,
    //     'BREAKOUT_ROOM',
    //     'BREAKOUT_ROOM_MAKE_PRESENTER event received',
    //     evtData,
    //   );
    //   try {
    //     const {payload} = evtData;
    //     const data = JSON.parse(payload);
    //     const {uid, action} = data;

    //     // Only process if it's for the local user
    //     if (uid === localUidRef.current) {
    //       onMakeMePresenterRef.current(action);
    //     }
    //   } catch (error) {
    //     logger.log(
    //       LogSource.Internals,
    //       'BREAKOUT_ROOM',
    //       'Error handling make presenter event',
    //       error,
    //     );
    //   }
    // };

    // ---------- BREAKOUT_ROOM_SYNC_STATE ----------
    const handleBreakoutRoomSyncStateEvent = (evtData: any) => {
      logger.log(
        LogSource.Events,
        'RTM_EVENTS',
        '[EVENT] BREAKOUT_ROOM_SYNC_STATE received',
        evtData,
      );
      try {
        const {ts, payload} = evtData || {};
        if (!payload) {
          logger.warn(
            LogSource.Events,
            'RTM_EVENTS',
            '[EVENT] BREAKOUT_ROOM_SYNC_STATE missing payload',
            {evtData},
          );
          return;
        }
        const data: BreakoutRoomSyncStateEventPayload = JSON.parse(payload);
        if (data?.data?.act === 'SYNC_STATE') {
          handleBreakoutRoomSyncStateRef.current(data.data, ts);
        } else {
          logger.debug(
            LogSource.Events,
            'RTM_EVENTS',
            '[EVENT] BREAKOUT_ROOM_SYNC_STATE Ignored event non-SYNC_STATE action received',
            {action: data?.data?.act},
          );
        }
      } catch (error: any) {
        logger.error(
          LogSource.Events,
          'RTM_EVENTS',
          '[ERROR] Failed to process event BREAKOUT_ROOM_SYNC_STATE',
          {error: error?.message},
        );
      }
    };

    // ---------- BREAKOUT_ROOM_HOST_OPERATION_START ----------
    const handleHostOperationStartEvent = (evtData: any) => {
      logger.debug(
        LogSource.Events,
        'RTM_EVENTS',
        '[EVENT] BREAKOUT_ROOM_HOST_OPERATION_START received',
        evtData,
      );
      try {
        const {sender, payload} = evtData || {};
        if (!payload) {
          logger.warn(
            LogSource.Events,
            'RTM_EVENTS',
            '[EVENT] BREAKOUT_ROOM_HOST_OPERATION_START missing payload',
            {evtData},
          );
          return;
        }
        // Ignore events from self
        if (sender === `${localUidRef.current}`) {
          logger.debug(
            LogSource.Events,
            'RTM_EVENTS',
            '[EVENT] Ignored self-sent BREAKOUT_ROOM_HOST_OPERATION_START',
            {sender, localUid: localUidRef.current},
          );
          return;
        }

        const data = JSON.parse(payload);
        const {operationName, hostUid, hostName} = data;

        handleHostOperationStartRef.current(operationName, hostUid, hostName);
      } catch (error: any) {
        logger.error(
          LogSource.Events,
          'RTM_EVENTS',
          '[ERROR] Failed to process event BREAKOUT_ROOM_HOST_OPERATION_START',
          {error: error?.message},
        );
      }
    };

    // ---------- BREAKOUT_ROOM_HOST_OPERATION_END ----------
    const handleHostOperationEndEvent = (evtData: any) => {
      logger.log(
        LogSource.Events,
        'RTM_EVENTS',
        '[EVENT] BREAKOUT_ROOM_HOST_OPERATION_END received',
        evtData,
      );
      try {
        const {sender, payload} = evtData || {};
        if (!payload) {
          logger.warn(
            LogSource.Events,
            'RTM_EVENTS',
            '[EVENT] BREAKOUT_ROOM_HOST_OPERATION_END missing payload',
            {evtData},
          );
          return;
        }
        // Ignore events from self
        if (sender === `${localUidRef.current}`) {
          logger.debug(
            LogSource.Events,
            'RTM_EVENTS',
            '[EVENT] Ignored self-sent event BREAKOUT_ROOM_HOST_OPERATION_END',
            {sender, localUid: localUidRef.current},
          );
          return;
        }

        const data = JSON.parse(payload);
        const {operationName, hostUid, hostName} = data;

        handleHostOperationEndRef.current(operationName, hostUid, hostName);
      } catch (error: any) {
        logger.error(
          LogSource.Events,
          'RTM_EVENTS',
          '[ERROR] Failed to process event BREAKOUT_ROOM_HOST_OPERATION_END',
          {error: error?.message},
        );
      }
    };

    // const handlePresenterAttributeEvent = (evtData: any) => {
    //   logger.log(
    //     LogSource.Internals,
    //     'BREAKOUT_ROOM',
    //     'BREAKOUT_PRESENTER_ATTRIBUTE event received',
    //     evtData,
    //   );
    //   try {
    //     const {payload} = evtData;
    //     const data = JSON.parse(payload);
    //     const {uid, isPresenter, timestamp} = data;
    //     // If this is the local user's presenter attribute, restore their state
    //     // Pass shouldSendEvent: false to avoid sending the event again (infinite loop)
    //     if (uid === localUidRef.current && !isHostRef.current) {
    //       if (isPresenter) {
    //         onMakeMePresenterRef.current('start', false);
    //       } else {
    //         onMakeMePresenterRef.current('stop', false);
    //       }
    //     }

    //     // Host updates customRTMMainRoomData with presenter status
    //     // This is mainly for syncing state when host rejoins and reads persisted attributes
    //     if (isHostRef.current) {
    //       if (isPresenter) {
    //         setCustomRTMMainRoomData(prev => {
    //           const currentPresenters = prev.breakout_room_presenters || [];
    //           // Check if already in the list (avoid duplicate from makePresenter)
    //           const exists = currentPresenters.find((p: any) => p.uid === uid);
    //           if (exists) {
    //             return prev;
    //           }
    //           return {
    //             ...prev,
    //             breakout_room_presenters: [
    //               ...currentPresenters,
    //               {uid, timestamp},
    //             ],
    //           };
    //         });
    //       } else {
    //         // Remove from presenters list
    //         setCustomRTMMainRoomData(prev => ({
    //           ...prev,
    //           breakout_room_presenters: (
    //             prev.breakout_room_presenters || []
    //           ).filter((p: any) => p.uid !== uid),
    //         }));
    //       }
    //     }
    //   } catch (error) {
    //     logger.log(
    //       LogSource.Internals,
    //       'BREAKOUT_ROOM',
    //       'Error handling presenter attribute event',
    //       error,
    //     );
    //   }
    // };

    // events.on(
    //   BreakoutRoomEventNames.BREAKOUT_ROOM_ANNOUNCEMENT,
    //   handleAnnouncementEvent,
    // );
    // events.on(
    //   EventNames.BREAKOUT_PRESENTER_ATTRIBUTE,
    //   handlePresenterAttributeEvent,
    // );
    // events.on(
    //   BreakoutRoomEventNames.BREAKOUT_ROOM_MAKE_PRESENTER,
    //   handleMakePresenterEvent,
    // );
    events.on(
      BreakoutRoomEventNames.BREAKOUT_ROOM_SYNC_STATE,
      handleBreakoutRoomSyncStateEvent,
    );
    events.on(
      BreakoutRoomEventNames.BREAKOUT_ROOM_HOST_OPERATION_START,
      handleHostOperationStartEvent,
    );
    events.on(
      BreakoutRoomEventNames.BREAKOUT_ROOM_HOST_OPERATION_END,
      handleHostOperationEndEvent,
    );

    return () => {
      // events.off(BreakoutRoomEventNames.BREAKOUT_ROOM_ANNOUNCEMENT);
      // events.off(
      //   EventNames.BREAKOUT_PRESENTER_ATTRIBUTE,
      //   handlePresenterAttributeEvent,
      // );
      // events.off(
      //   BreakoutRoomEventNames.BREAKOUT_ROOM_MAKE_PRESENTER,
      //   handleMakePresenterEvent,
      // );
      events.off(
        BreakoutRoomEventNames.BREAKOUT_ROOM_SYNC_STATE,
        handleBreakoutRoomSyncStateEvent,
      );
      events.off(
        BreakoutRoomEventNames.BREAKOUT_ROOM_HOST_OPERATION_START,
        handleHostOperationStartEvent,
      );
      events.off(
        BreakoutRoomEventNames.BREAKOUT_ROOM_HOST_OPERATION_END,
        handleHostOperationEndEvent,
      );
    };
  }, []);

  return <>{children}</>;
};

export default BreakoutRoomEventsConfigure;
