import React, {useEffect} from 'react';
import events from '../../../rtm-events-api';
import {BreakoutRoomEventNames} from './constants';
import {useBreakoutRoom} from '../context/BreakoutRoomContext';

interface Props {
  children: React.ReactNode;
}

const BreakoutRoomMainEventsConfigure: React.FC<Props> = ({children}) => {
  const {onRaiseHand} = useBreakoutRoom();

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

    events.on(
      BreakoutRoomEventNames.BREAKOUT_ROOM_ATTENDEE_RAISE_HAND,
      handleRaiseHandEvent,
    );

    return () => {
      events.off(
        BreakoutRoomEventNames.BREAKOUT_ROOM_ATTENDEE_RAISE_HAND,
        handleRaiseHandEvent,
      );
    };
  }, [onRaiseHand]);

  return <>{children}</>;
};

export default BreakoutRoomMainEventsConfigure;
