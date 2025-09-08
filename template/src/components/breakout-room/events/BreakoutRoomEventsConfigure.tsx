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

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  useEffect(() => {
    const handlePresenterStatusEvent = (evtData: any) => {
      console.log('supriya-event BREAKOUT_ROOM_MAKE_PRESENTER data: ', evtData);
      try {
        const {sender, payload} = evtData;
        if (sender === `${localUid}`) {
          return;
        }
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
        const {sender, payload} = evtData;
        if (!isHostRef.current) {
          return;
        }
        if (sender === `${localUid}`) {
          return;
        }
        const data = JSON.parse(payload);
        if (data.action === 'raise' || data.action === 'lower') {
          onRaiseHand(data.action, data.uid);
        }
      } catch (error) {}
    };

    const handleAnnouncementEvent = (evtData: any) => {
      console.log('supriya-event BREAKOUT_ROOM_ANNOUNCEMENT data: ', evtData);
      try {
        const {_, payload, sender} = evtData;
        const data: BreakoutRoomAnnouncementEventPayload = JSON.parse(payload);
        if (sender === `${localUid}`) {
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
  }, [onMakeMePresenter, handleBreakoutRoomSyncState, onRaiseHand, localUid]);

  return <>{children}</>;
};

export default BreakoutRoomEventsConfigure;
