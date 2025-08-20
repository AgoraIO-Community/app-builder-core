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
  const {onMakeMePresenter, handleBreakoutRoomSyncState} = useBreakoutRoom();

  useEffect(() => {
    const handleHandRaiseEvent = (evtData: any) => {
      console.log('supriya BREAKOUT_ROOM_ATTENDEE_RAISE_HAND data: ', evtData);
      try {
        const {uid, payload} = evtData;
        const data = JSON.parse(payload);
        // uid timestamp action
        if (data.action === 'raise') {
        } else if (data.action === 'lower') {
        }
      } catch (error) {}
    };

    const handlePresenterStatusEvent = (evtData: any) => {
      console.log('supriya BREAKOUT_ROOM_MAKE_PRESENTER data: ', evtData);
      try {
        const {payload} = evtData;
        const data = JSON.parse(payload);
        if (data.action === 'start') {
          onMakeMePresenter('start');
        } else if (data.action === 'stop') {
          onMakeMePresenter('stop');
        }
      } catch (error) {}
    };

    const handleAnnouncementEvent = (evtData: any) => {
      console.log('supriya BREAKOUT_ROOM_ANNOUNCEMENT data: ', evtData);
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

    const handleBreakoutRoomStateSync = (evtData: any) => {
      const {payload} = evtData;
      console.log('supriya BREAKOUT_ROOM_SYNC_STATE data: ', evtData);
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
      handleHandRaiseEvent,
    );
    events.on(
      BreakoutRoomEventNames.BREAKOUT_ROOM_SYNC_STATE,
      handleBreakoutRoomStateSync,
    );

    return () => {
      events.off(BreakoutRoomEventNames.BREAKOUT_ROOM_ANNOUNCEMENT);
      events.off(
        BreakoutRoomEventNames.BREAKOUT_ROOM_MAKE_PRESENTER,
        handlePresenterStatusEvent,
      );
      events.off(
        BreakoutRoomEventNames.BREAKOUT_ROOM_ATTENDEE_RAISE_HAND,
        handleHandRaiseEvent,
      );
      events.off(
        BreakoutRoomEventNames.BREAKOUT_ROOM_SYNC_STATE,
        handleBreakoutRoomStateSync,
      );
    };
  }, [onMakeMePresenter, handleBreakoutRoomSyncState]);

  return <>{children}</>;
};

export default BreakoutRoomEventsConfigure;
