import React, {useEffect, useRef} from 'react';
import events from '../../../rtm-events-api';
import {BreakoutRoomEventNames} from './constants';
import {useBreakoutRoom} from '../context/BreakoutRoomContext';
import {BreakoutRoomSyncStateEventPayload} from '../state/types';
import {useLocalUid} from '../../../../agora-rn-uikit';
import {useRoomInfo} from '../../../components/room-info/useRoomInfo';
import {logger, LogSource} from '../../../logger/AppBuilderLogger';
import {EventNames} from '../../../rtm-events';
import {useRTMGlobalState} from '../../../rtm/RTMGlobalStateProvider';

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
  // const {setCustomRTMMainRoomData} = useRTMGlobalState();
  const localUid = useLocalUid();
  const {
    data: {isHost},
  } = useRoomInfo();
  const isHostRef = React.useRef(isHost);
  const localUidRef = React.useRef(localUid);
  // const onMakeMePresenterRef = useRef(onMakeMePresenter);
  const handleBreakoutRoomSyncStateRef = useRef(handleBreakoutRoomSyncState);
  const handleHostOperationStartRef = useRef(handleHostOperationStart);
  const handleHostOperationEndRef = useRef(handleHostOperationEnd);

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
    //     console.log('supriya-presenter handleMakePresenterEvent data: ', data);
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

    const handleBreakoutRoomSyncStateEvent = (evtData: any) => {
      console.log('BREAKOUT_ROOM_SYNC_STATE event recevied', evtData);
      const {ts, payload} = evtData;
      const data: BreakoutRoomSyncStateEventPayload = JSON.parse(payload);
      if (data.data.act === 'SYNC_STATE') {
        console.log(
          'supriya-state-sync ********* BREAKOUT_ROOM_SYNC_STATE event triggered ***************',
        );
        handleBreakoutRoomSyncStateRef.current(data.data, ts);
      }
    };

    const handleHostOperationStartEvent = (evtData: any) => {
      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        'BREAKOUT_ROOM_HOST_OPERATION_START event received',
        evtData,
      );
      try {
        const {sender, payload} = evtData;
        // Ignore events from self
        if (sender === `${localUidRef.current}`) {
          return;
        }
        // // Only process if current user is also a host
        // if (!isHostRef.current) {
        //   return;
        // }

        const data = JSON.parse(payload);
        const {operationName, hostUid, hostName} = data;

        handleHostOperationStartRef.current(operationName, hostUid, hostName);
      } catch (error) {
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          'Error handling host operation start event',
          {error: error.message},
        );
      }
    };

    const handleHostOperationEndEvent = (evtData: any) => {
      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        'BREAKOUT_ROOM_HOST_OPERATION_END event received',
        evtData,
      );
      try {
        const {sender, payload} = evtData;
        // Ignore events from self
        if (sender === `${localUidRef.current}`) {
          return;
        }
        // // Only process if current user is also a host
        // if (!isHostRef.current) {
        //   return;
        // }

        const data = JSON.parse(payload);
        const {operationName, hostUid, hostName} = data;

        handleHostOperationEndRef.current(operationName, hostUid, hostName);
      } catch (error) {
        logger.log(
          LogSource.Internals,
          'BREAKOUT_ROOM',
          'Error handling host operation end event',
          {error: error.message},
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
    //     console.log('supriya-presenter handlePresenterAttributeEvent', data);

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
