import React, {useEffect} from 'react';
import events from '../../../rtm-events-api';
import {BreakoutRoomEventNames} from './constants';
import Toast from '../../../../react-native-toast-message';
import {useBreakoutRoom} from '../context/BreakoutRoomContext';
import {BreakoutRoomSyncStateEventPayload} from '../state/types';

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

  useEffect(() => {
    const handlePresenterStatusEvent = (evtData: any) => {
      console.log('supriya-event BREAKOUT_ROOM_MAKE_PRESENTER data: ', evtData);
      try {
        const {payload} = evtData;
        const data = JSON.parse(payload);
        if (data.action === 'start' || data.action === 'stop') {
          onMakeMePresenter(data.action);
        }
      } catch (error) {}
    };

    const handleRaiseHandEvent = (evtData: any) => {
      console.log(
        'supriya-event BREAKOUT_ROOM_ATTENDEE_RAISE_HAND data: ',
        evtData,
      );
      try {
        const {payload} = evtData;
        const data = JSON.parse(payload);
        if (data.action === 'raise' || data.action === 'lower') {
          onRaiseHand(data.action, data.uid);
        }
      } catch (error) {}
    };

    const handleAnnouncementEvent = (evtData: any) => {
      console.log('supriya-event BREAKOUT_ROOM_ANNOUNCEMENT data: ', evtData);
      try {
        const {_, payload} = evtData;
        const data = JSON.parse(payload);
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
      const {payload} = evtData;
      console.log('supriya-event BREAKOUT_ROOM_SYNC_STATE data: ', evtData);
      const data: BreakoutRoomSyncStateEventPayload = JSON.parse(payload);
      if (data.data.act === 'SYNC_STATE') {
        handleBreakoutRoomSyncState(data.data.data);
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
  }, [onMakeMePresenter, handleBreakoutRoomSyncState, onRaiseHand]);

  return <>{children}</>;
};

export default BreakoutRoomEventsConfigure;
