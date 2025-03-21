import React, {useContext, useEffect} from 'react';
import {whiteboardContext} from './WhiteboardConfigure';
import {useContent, useLayout} from 'customization-api';
import {DispatchContext} from '../../../agora-rn-uikit';
import {EventNames} from '../../rtm-events';
import events, {PersistanceLevel} from '../../rtm-events-api';
import WhiteboardWrapper from './../whiteboard/WhiteboardWrapper';
import {useRoomInfo} from './../room-info/useRoomInfo';
import LocalEventEmitter, {
  LocalEventsEnum,
} from '../../rtm-events-api/LocalEvents';

export const WhiteboardListener = () => {
  const {dispatch} = useContext(DispatchContext);
  const {setCustomContent} = useContent();
  const {currentLayout, setLayout} = useLayout();
  const {
    data: {isHost},
    isWhiteBoardOn,
  } = useRoomInfo();

  useEffect(() => {
    if (($config.ENABLE_WAITING_ROOM && !isHost) || $config.AUTO_CONNECT_RTM) {
      if (isWhiteBoardOn) {
        WhiteboardStartedCallBack();
      } else {
        WhiteboardStoppedCallBack();
      }
    }
  }, [isWhiteBoardOn, isHost]);

  const WhiteboardCallBack = ({status}) => {
    if (status) {
      WhiteboardStartedCallBack();
    } else {
      WhiteboardStoppedCallBack();
    }
  };

  useEffect(() => {
    if (
      !$config.ENABLE_WAITING_ROOM ||
      ($config.ENABLE_WAITING_ROOM && isHost)
    ) {
      LocalEventEmitter.on(
        LocalEventsEnum.WHITEBOARD_ACTIVE_LOCAL,
        WhiteboardCallBack,
      );

      return () => {
        LocalEventEmitter.on(
          LocalEventsEnum.WHITEBOARD_ACTIVE_LOCAL,
          WhiteboardCallBack,
        );
      };
    }
  }, [isHost]);

  //whiteboard start

  const {
    whiteboardActive,
    joinWhiteboardRoom,
    leaveWhiteboardRoom,
    getWhiteboardUid,
  } = useContext(whiteboardContext);

  const WhiteboardStoppedCallBack = () => {
    toggleWhiteboard(true, false);
  };

  const WhiteboardStartedCallBack = () => {
    toggleWhiteboard(false, false);
  };

  useEffect(() => {
    whiteboardActive && currentLayout !== 'pinned' && setLayout('pinned');
  }, []);

  const toggleWhiteboard = (
    whiteboardActive: boolean,
    triggerEvent: boolean,
  ) => {
    if ($config.ENABLE_WHITEBOARD) {
      if (whiteboardActive) {
        leaveWhiteboardRoom();
        setCustomContent(getWhiteboardUid(), false);
        setLayout('grid');
        triggerEvent &&
          events.send(
            EventNames.WHITEBOARD_ACTIVE,
            JSON.stringify({status: false}),
            PersistanceLevel.Session,
          );
      } else {
        joinWhiteboardRoom();
        setCustomContent(getWhiteboardUid(), WhiteboardWrapper, {}, true);
        dispatch({
          type: 'UserPin',
          value: [getWhiteboardUid()],
        });
        setLayout('pinned');
        triggerEvent &&
          events.send(
            EventNames.WHITEBOARD_ACTIVE,
            JSON.stringify({status: true}),
            PersistanceLevel.Session,
          );
      }
    }
  };
  return null;
};
