import React, {useEffect} from 'react';
import events from '../../../rtm-events-api';
import {BreakoutRoomEventNames} from './constants';
import {useBreakoutRoom} from '../context/BreakoutRoomContext';
import {BreakoutRoomSyncStateEventPayload} from '../state/types';

interface Props {
  children: React.ReactNode;
}

const BreakoutRoomMainEventsConfigure: React.FC<Props> = ({children}) => {
  const {onRaiseHand, handleBreakoutRoomSyncState} = useBreakoutRoom();

  useEffect(() => {
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

    const handleBreakoutRoomSyncStateEvent = (evtData: any) => {
      const {payload} = evtData;
      console.log(
        'supriya-event BREAKOUT_ROOM_SYNC_STATE data (main): ',
        evtData,
      );
      const data: BreakoutRoomSyncStateEventPayload = JSON.parse(payload);
      if (data.data.act === 'SYNC_STATE') {
        handleBreakoutRoomSyncState(data.data.data);
      }
    };

    events.on(
      BreakoutRoomEventNames.BREAKOUT_ROOM_ATTENDEE_RAISE_HAND,
      handleRaiseHandEvent,
    );
    events.on(
      BreakoutRoomEventNames.BREAKOUT_ROOM_SYNC_STATE,
      handleBreakoutRoomSyncStateEvent,
    );

    return () => {
      events.off(
        BreakoutRoomEventNames.BREAKOUT_ROOM_ATTENDEE_RAISE_HAND,
        handleRaiseHandEvent,
      );
      events.off(
        BreakoutRoomEventNames.BREAKOUT_ROOM_SYNC_STATE,
        handleBreakoutRoomSyncStateEvent,
      );
    };
  }, [onRaiseHand, handleBreakoutRoomSyncState]);

  return <>{children}</>;
};

export default BreakoutRoomMainEventsConfigure;
