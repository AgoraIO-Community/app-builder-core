import React, {useEffect, useRef} from 'react';
import events from '../../../rtm-events-api';
import {BreakoutRoomEventNames} from './constants';
import Toast from '../../../../react-native-toast-message';
import {useBreakoutRoom} from '../context/BreakoutRoomContext';
import {
  BreakoutRoomAnnouncementEventPayload,
  BreakoutRoomSyncStateEventPayload,
} from '../state/types';
import {useLocalUid} from '../../../../agora-rn-uikit';
import {useRoomInfo} from '../../../components/room-info/useRoomInfo';
import {logger, LogSource} from '../../../logger/AppBuilderLogger';

interface Props {
  children: React.ReactNode;
  mainChannelName: string;
}

const BreakoutRoomEventsConfigure: React.FC<Props> = ({
  children,
  mainChannelName,
}) => {
  const {onMakeMePresenter, handleBreakoutRoomSyncState, onRaiseHand} =
    useBreakoutRoom();
  const localUid = useLocalUid();
  const {
    data: {isHost},
  } = useRoomInfo();
  const isHostRef = React.useRef(isHost);
  const localUidRef = React.useRef(localUid);
  const onRaiseHandRef = useRef(onRaiseHand);
  const onMakeMePresenterRef = useRef(onMakeMePresenter);
  const handleBreakoutRoomSyncStateRef = useRef(handleBreakoutRoomSyncState);

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);
  useEffect(() => {
    localUidRef.current = localUid;
  }, [localUid]);
  useEffect(() => {
    onRaiseHandRef.current = onRaiseHand;
  }, [onRaiseHand]);
  useEffect(() => {
    onMakeMePresenterRef.current = onMakeMePresenter;
  }, [onMakeMePresenter]);
  useEffect(() => {
    handleBreakoutRoomSyncStateRef.current = handleBreakoutRoomSyncState;
  }, [handleBreakoutRoomSyncState]);

  useEffect(() => {
    const handlePresenterStatusEvent = (evtData: any) => {
      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        'BREAKOUT_ROOM_MAKE_PRESENTER event recevied',
        evtData,
      );
      try {
        const {sender, payload} = evtData;
        if (sender === `${localUidRef.current}`) {
          return;
        }
        const data = JSON.parse(payload);
        if (data.action === 'start' || data.action === 'stop') {
          onMakeMePresenterRef.current(data.action);
        }
      } catch (error) {}
    };

    const handleRaiseHandEvent = (evtData: any) => {
      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        'BREAKOUT_ROOM_ATTENDEE_RAISE_HAND event recevied',
        evtData,
      );
      try {
        const {sender, payload} = evtData;
        if (!isHostRef.current) {
          return;
        }
        if (sender === `${localUidRef.current}`) {
          return;
        }
        const data = JSON.parse(payload);
        if (data.action === 'raise' || data.action === 'lower') {
          onRaiseHandRef.current?.(data.action, data.uid);
        }
      } catch (error) {}
    };

    const handleAnnouncementEvent = (evtData: any) => {
      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        'BREAKOUT_ROOM_ANNOUNCEMENT event recevied',
        evtData,
      );
      try {
        const {_, payload, sender} = evtData;
        const data: BreakoutRoomAnnouncementEventPayload = JSON.parse(payload);
        if (sender === `${localUidRef.current}`) {
          return;
        }
        if (data.announcement) {
          Toast.show({
            leadingIconName: 'speaker',
            type: 'info',
            text1: `Message from host: :${data.announcement}`,
            visibilityTime: 3000,
            primaryBtn: null,
            secondaryBtn: null,
            leadingIcon: null,
          });
        }
      } catch (error) {}
    };

    const handleBreakoutRoomSyncStateEvent = (evtData: any) => {
      logger.log(
        LogSource.Internals,
        'BREAKOUT_ROOM',
        'BREAKOUT_ROOM_SYNC_STATE event recevied',
        evtData,
      );
      const {payload} = evtData;
      const data: BreakoutRoomSyncStateEventPayload = JSON.parse(payload);
      if (data.data.act === 'SYNC_STATE') {
        handleBreakoutRoomSyncStateRef.current(data.data.data);
      }
    };

    events.on(
      BreakoutRoomEventNames.BREAKOUT_ROOM_ANNOUNCEMENT,
      handleAnnouncementEvent,
    );
    events.on(
      BreakoutRoomEventNames.BREAKOUT_ROOM_MAKE_PRESENTER,
      handlePresenterStatusEvent,
    );
    events.on(
      BreakoutRoomEventNames.BREAKOUT_ROOM_ATTENDEE_RAISE_HAND,
      handleRaiseHandEvent,
    );
    events.on(
      BreakoutRoomEventNames.BREAKOUT_ROOM_SYNC_STATE,
      handleBreakoutRoomSyncStateEvent,
    );

    return () => {
      events.off(BreakoutRoomEventNames.BREAKOUT_ROOM_ANNOUNCEMENT);
      events.off(
        BreakoutRoomEventNames.BREAKOUT_ROOM_MAKE_PRESENTER,
        handlePresenterStatusEvent,
      );
      events.off(
        BreakoutRoomEventNames.BREAKOUT_ROOM_ATTENDEE_RAISE_HAND,
        handleRaiseHandEvent,
      );
      events.off(
        BreakoutRoomEventNames.BREAKOUT_ROOM_SYNC_STATE,
        handleBreakoutRoomSyncStateEvent,
      );
    };
  }, []);

  return <>{children}</>;
};

export default BreakoutRoomEventsConfigure;
